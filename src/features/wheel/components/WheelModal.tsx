import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { Ban, CircleCheck, Dice5, Radio, ShieldCheck, TriangleAlert, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { Stamp } from '@/components/ui/Stamp.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { useSocket } from '@/features/realtime/context.ts';
import { ApiError } from '@/lib/api.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { houseClock } from '@/lib/house-time.ts';
import { useReducedMotion } from '@/lib/use-reduced-motion.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { totalRotation, wheelAngle } from '../angle.ts';
import { wheelApi } from '../api.ts';
import { isNetworkError, wheelErrorMessage } from '../errors.ts';
import { useSpin, useWheelOptions, wheelKeys } from '../hooks.ts';
import { canSpin, formatDue, normalizeTitle, resultAnnouncement, resultHeadline, titleError, toggleParticipant } from '../selection.ts';
import { readSoundPref, tick, writeSoundPref } from '../sound.ts';
import { useWheelStore } from '../store.ts';
import type { ActiveSpin, DueKey } from '../types.ts';
import { WheelCanvas } from './WheelCanvas.tsx';

/** Giảm chuyển động: không xoay, "Đang chọn…" 1,5 giây rồi lát trúng sáng lên. */
const REDUCED_PICK_MS = 1_500;

const initialOf = (name: string) => firstName(name).charAt(0).toUpperCase();
const STAMP_TONE = { lil: 'lil', mint: 'mint', yellow: 'hl', sky: 'sky' } as const;

/** Form chọn việc, người tham gia và hạn rồi bấm Quay. */
function SetupForm({ houseId }: { houseId: string }) {
  const me = useAuthStore((s) => s.user?.id);
  const options = useWheelOptions(houseId, true);
  const spin = useSpin(houseId);
  const show = useWheelStore((s) => s.show);
  const [title, setTitle] = useState('');
  const [touched, setTouched] = useState(false);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [dueKey, setDueKey] = useState<DueKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<string | null>(null);

  const data = options.data;
  const participants = selected ?? data?.defaultParticipantIds ?? [];
  const due = data?.dueOptions.find((o) => o.key === (dueKey ?? data.defaultDueKey));
  const tErr = titleError(title);
  const ready = !!data && !data.houseOnBreak && canSpin(participants, title, !!due?.valid) && data.remaining.hour > 0 && data.remaining.day > 0;

  if (options.status === 'pending') {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải">
        <Skeleton className="h-11" />
        <Skeleton className="h-32" />
        <Skeleton className="h-11" />
      </div>
    );
  }
  if (options.status === 'error' || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center text-sm text-ink-2">
        Không tải được thông tin vòng quay.
        <Button size="sm" variant="secondary" onClick={() => void options.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const submit = () => {
    setTouched(true);
    if (!ready || !due) return;
    // Cùng một lần bấm (kể cả thử lại sau lỗi mạng) dùng chung một key: server không quay hai lần (LW-10).
    keyRef.current ??= crypto.randomUUID();
    setError(null);
    spin.mutate(
      { body: { taskTitle: normalizeTitle(title), participantIds: participants, dueAt: due.dueAt }, key: keyRef.current },
      {
        onSuccess: (s) => {
          keyRef.current = null;
          show(s, { open: true });
        },
        onError: (e) => {
          if (!isNetworkError(e)) keyRef.current = null;
          if (e instanceof ApiError && e.code === 'WHEEL_BUSY') {
            // LW-01: người đến sau tự chuyển sang xem vòng đang chạy.
            void wheelApi.current(houseId).then((s) => (s ? show(s, { open: true }) : setError(wheelErrorMessage(e))));
            return;
          }
          if (e instanceof ApiError && ['PARTICIPANT_NOT_MEMBER', 'PARTICIPANT_ABSENT', 'WHEEL_DUE_INVALID'].includes(e.code ?? '')) {
            setSelected(null);
            void options.refetch();
          }
          setError(wheelErrorMessage(e));
        },
      },
    );
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-5"
    >
      <Field label="Việc đột xuất" htmlFor="wheel-title" error={touched && tErr ? tErr : undefined}>
        <Input
          id="wheel-title"
          value={title}
          maxLength={80}
          placeholder="Ví dụ: Thông bồn cầu"
          invalid={touched && !!tErr}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Người tham gia</legend>
        <ul className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:gap-2.5 sm:overflow-visible">
          {data.members.map((m) => (
            <li key={m.id} className={cn('shrink-0 rounded-btn border border-line px-3 py-2 sm:border-0 sm:p-0', m.absentToday && 'opacity-50')}>
              <Checkbox
                id={`wheel-p-${m.id}`}
                checked={participants.includes(m.id)}
                disabled={m.absentToday}
                onChange={() => setSelected(toggleParticipant(participants, m.id, data.members))}
                label={
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Avatar name={m.name} tone={avatarToneFor(m.id)} src={m.avatarUrl} size={24} />
                    {firstName(m.name)}
                    {m.id === me && <span className="text-ink-2">(bạn)</span>}
                    {m.absentToday && <span className="text-cap text-ink-2">Vắng hôm nay</span>}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
        <p className={cn('mt-2 font-mono text-cap', participants.length < 2 ? 'text-tom' : 'text-ink-2')}>
          {participants.length} / {data.members.length} người tham gia{participants.length < 2 ? ' · cần ít nhất 2 người' : ''}
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Hạn chót</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-2">
          {data.dueOptions.map((o) => {
            const active = o.key === due?.key;
            return (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!o.valid}
                title={o.reason ?? undefined}
                onClick={() => setDueKey(o.key)}
                className={cn(
                  'flex flex-col items-start rounded-btn border px-3 py-2 text-left text-sm focus-visible:shadow-focus focus-visible:outline-none',
                  active ? 'border-ink bg-ink text-white' : 'border-line-2 bg-surface text-ink hover:bg-paper',
                  !o.valid && 'cursor-not-allowed opacity-[0.38]',
                )}
              >
                <span className="font-semibold">{o.label}</span>
                <span className={cn('text-cap', active ? 'text-ink-on2' : 'text-ink-2')}>{o.valid ? formatDue(o.dueAt) : o.reason}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="flex gap-2 rounded-btn bg-paper-2 px-3 py-2.5 text-sm text-ink-2">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Người trúng do máy chủ chọn và gửi cho cả phòng. Không có quay lại; muốn nhờ người khác thì dùng Đổi ca.
      </p>

      {data.houseOnBreak && <p className="text-sm text-tom">Cả nhà đang nghỉ hôm nay nên không quay được.</p>}
      {(data.remaining.hour === 0 || data.remaining.day === 0) && (
        <p className="text-sm text-tom">Nhà đã quay nhiều lần rồi, nghỉ tay chút nhé (tối đa 5 vòng/giờ, 10 vòng/ngày).</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-tom">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 bg-surface px-4 pt-2 pb-1 sm:static sm:mx-0 sm:p-0">
        <Button type="submit" variant="accent" size="lg" fullWidth leftIcon={<Dice5 />} loading={spin.isPending} disabled={!ready}>
          {isNetworkError(spin.error) ? 'Quay lại (kết nối lỗi)' : 'Quay'}
        </Button>
        <p className="mt-2 text-center font-mono text-cap text-ink-2">
          Còn {Math.min(data.remaining.hour, data.remaining.day)} lượt trong giờ này · {data.remaining.day} lượt hôm nay
        </p>
      </div>
    </form>
  );
}

/** Bánh xe đồng bộ: góc theo giờ server, kết quả, confetti, âm thanh. */
function SpinView({ active, onDone }: { active: ActiveSpin; onDone: () => void }) {
  const { spin, clockOffsetMs } = active;
  const me = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { onlineUserIds } = useSocket();
  const [soundOn, setSoundOn] = useState(() => readSoundPref() ?? spin.spunBy.id === me);
  const serverNow = () => Date.now() + clockOffsetMs;
  const startAt = Date.parse(spin.startAt);
  const revealAt = Date.parse(spin.revealAt);
  const total = useMemo(() => totalRotation(spin.slices.length, spin.landingIndex, spin.seed), [spin.slices.length, spin.landingIndex, spin.seed]);
  const doneAt = reduced ? startAt + REDUCED_PICK_MS : revealAt;
  const [finished, setFinished] = useState(() => serverNow() >= doneAt);

  // Component gắn key theo vòng nên chỉ cần hẹn giờ "xong" một lần.
  useEffect(() => {
    const t = setTimeout(() => setFinished(true), Math.max(0, doneAt - (Date.now() + clockOffsetMs)));
    return () => clearTimeout(t);
  }, [doneAt, clockOffsetMs]);

  const voided = spin.status === 'VOIDED';
  const winner = spin.winner ?? spin.participants.find((p) => p.id === spin.slices[spin.landingIndex]) ?? null;
  const showResult = finished && !voided && !!winner;

  const confettiDone = useRef<string | null>(null);
  useEffect(() => {
    if (!showResult || reduced || confettiDone.current === spin.spinId) return;
    confettiDone.current = spin.spinId;
    void confetti({ particleCount: 120, spread: 75, origin: { y: 0.45 }, colors: ['#f5d547', '#8f78ea', '#2e9a72', '#3f8fc4', '#d9472f'], disableForReducedMotion: true });
  }, [showResult, reduced, spin.spinId]);

  const initials = useMemo(() => Object.fromEntries(spin.participants.map((p) => [p.id, initialOf(p.name)])), [spin.participants]);
  const angleAt = () => (reduced ? (serverNow() >= startAt + REDUCED_PICK_MS ? total : 0) : wheelAngle(serverNow(), startAt, spin.durationMs, total));
  const watchers = spin.participants.length + (spin.participants.some((p) => p.id === spin.spunBy.id) ? 0 : 1);
  const watching = [...new Set([spin.spunBy.id, ...spin.participants.map((p) => p.id)])].filter((id) => onlineUserIds.includes(id));
  const people = new Map([spin.spunBy, ...spin.participants].map((p) => [p.id, p]));
  const toggleSound = () => {
    setSoundOn((v) => {
      writeSoundPref(!v);
      return !v;
    });
  };
  const live = voided
    ? `Vòng quay ${spin.taskTitle} đã bị hủy`
    : showResult
      ? resultAnnouncement(winner, spin.taskTitle, me)
      : 'Đang quay…';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-ct text-ink" title={spin.taskTitle}>
            {spin.taskTitle}
          </p>
          <p className="text-sm text-ink-2">
            {firstName(spin.spunBy.name)} quay · {spin.participants.map((p) => firstName(p.name)).join(', ')}
            {spin.excludedCount > 0 && ` · ${spin.excludedCount} người không tham gia`}
          </p>
        </div>
        <IconButton icon={soundOn ? <Volume2 /> : <VolumeX />} label={soundOn ? 'Tắt tiếng' : 'Bật tiếng'} onClick={toggleSound} />
      </div>

      <div className="relative rounded-card border border-line bg-paper p-4">
        <WheelCanvas
          slices={spin.slices}
          initials={initials}
          angleAt={angleAt}
          running={!finished && !reduced}
          highlight={finished && reduced ? spin.landingIndex : null}
          onSliceChange={() => soundOn && !reduced && tick(1)}
          label={`Vòng quay ${spin.taskTitle}, ${spin.slices.length} lát`}
        />
        {showResult && (
          <Stamp
            label="TRÚNG"
            date={houseClock(new Date()).ddmm}
            tone={STAMP_TONE[avatarToneFor(winner.id)]}
            className="absolute right-2 bottom-2 size-24 sm:size-28"
          />
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      {voided ? (
        <div className="flex items-start gap-3 rounded-card border border-tom-border bg-tom-bg p-4 text-sm text-tom">
          <Ban className="mt-0.5 size-5 shrink-0" aria-hidden />
          Vòng quay này đã bị trưởng phòng hủy, ca đột xuất cũng được hủy theo.
        </div>
      ) : showResult ? (
        <div className="flex items-center gap-3 rounded-card bg-sky-bg p-4">
          <Avatar name={winner.name} tone={avatarToneFor(winner.id)} src={winner.avatarUrl} size={40} />
          <div className="min-w-0">
            <p className="font-display text-ct text-ink">{resultHeadline(winner, me)}</p>
            <p className="text-sm text-ink-2 [overflow-wrap:anywhere]">
              Đã tạo việc đột xuất · {spin.taskTitle} · hạn {formatDue(spin.dueAt)}
            </p>
            {spin.winnerSlotsToday >= 2 && (
              <p className="mt-1 flex items-center gap-1.5 text-cap text-hl-ink">
                <TriangleAlert className="size-3.5" aria-hidden />
                {winner.id === me ? 'Bạn' : firstName(winner.name)} đã có {spin.winnerSlotsToday} ca khác hôm nay.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-card bg-ink px-4 py-3">
          <span className="flex shrink-0 -space-x-1.5">
            {watching.map((id) => (
              <Avatar key={id} name={people.get(id)!.name} tone={avatarToneFor(id)} src={people.get(id)!.avatarUrl} size={24} className="ring-2 ring-ink" />
            ))}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              {Math.max(watching.length, 1)} / {watchers} người đang xem
            </p>
            <p className="text-cap text-ink-on2">Mọi máy quay cùng một kết quả</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-hl px-2.5 py-1 text-cap font-semibold text-ink">
            <Radio className="size-3.5" aria-hidden />
            {reduced ? 'Đang chọn…' : 'Đang quay…'}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        {showResult && winner.id === me && (
          <Button
            variant="accent"
            leftIcon={<CircleCheck />}
            onClick={() => {
              onDone();
              void navigate('/chores');
            }}
          >
            Đến ca của tôi
          </Button>
        )}
        <Button variant={showResult && winner.id === me ? 'secondary' : 'primary'} disabled={!finished && !voided} onClick={onDone}>
          {finished || voided ? 'Xong' : 'Đang quay…'}
        </Button>
      </div>
    </div>
  );
}

/** Modal vòng quay (desktop) / bottom sheet (mobile), gắn một lần trong AppShell. */
export function WheelModal({ houseId }: { houseId: string | undefined }) {
  const { open, active, close, show } = useWheelStore();
  // Mở modal mà chưa có vòng nào trong máy: hỏi server có vòng đang chạy không (vào giữa chừng, LW-12).
  const current = useQuery({
    queryKey: wheelKeys.current(houseId ?? ''),
    queryFn: () => wheelApi.current(houseId!),
    enabled: open && !active && !!houseId,
    staleTime: 0,
    gcTime: 0,
  });
  const found = current.data;
  useEffect(() => {
    if (open && !active && found?.status === 'SPINNING') show(found);
  }, [open, active, found, show]);
  const checking = current.isFetching;

  const done = () => {
    useWheelStore.setState({ active: null });
    close();
  };

  return (
    <Modal
      open={open}
      onClose={active?.spin.status === 'SPINNING' ? close : done}
      overline="Việc đột xuất · Đồng bộ cả phòng"
      title="Vòng quay may mắn"
    >
      {active ? (
        <SpinView key={active.spin.spinId} active={active} onDone={done} />
      ) : checking || !houseId ? (
        <Skeleton className="h-64" />
      ) : (
        <SetupForm houseId={houseId} />
      )}
    </Modal>
  );
}
