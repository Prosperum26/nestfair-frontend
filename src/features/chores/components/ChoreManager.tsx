import { Pause, Pencil, Play, Plus, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { describeChore, ROTATION_HINTS, upcomingSlots } from '../chore-text.ts';
import { messageForError } from '../errors.ts';
import { useChores, useUpdateChore, useWeekView } from '../hooks.ts';
import type { Chore } from '../types.ts';
import { shiftWeek, weekKeyOf } from '../week.ts';
import { ChoreFormModal } from './ChoreFormModal.tsx';

function ChoreRow({ chore, isAdmin, onEdit, onToggle }: { chore: Chore; isAdmin: boolean; onEdit: () => void; onToggle: () => void }) {
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className={chore.isActive ? 'truncate text-sm font-semibold text-ink' : 'truncate text-sm font-semibold text-ink-3'}>{chore.title}</p>
        <p className="mt-0.5 text-cap text-ink-2">{describeChore(chore)}</p>
      </div>
      <Chip tone="outline" size="sm">
        Độ nặng {chore.weight}
      </Chip>
      <Chip tone="neutral" size="sm">
        {ROTATION_HINTS[chore.rotationMode].label}
      </Chip>
      {!chore.isActive && (
        <Chip tone="yellow" size="sm">
          Đang tạm ngưng
        </Chip>
      )}
      {isAdmin && (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" leftIcon={<Pencil />} onClick={onEdit}>
            Sửa
          </Button>
          <Button size="sm" variant="ghost" leftIcon={chore.isActive ? <Pause /> : <Play />} onClick={onToggle}>
            {chore.isActive ? 'Tạm ngưng' : 'Bật lại'}
          </Button>
        </div>
      )}
    </li>
  );
}

/** Danh sách việc; trưởng phòng thêm / sửa / tạm ngưng. Tắt việc có ca đang chạy thì cảnh báo trước. */
export function ChoreManager({ houseId, isAdmin }: { houseId: string; isAdmin: boolean }) {
  const chores = useChores(houseId, true);
  const thisWeek = weekKeyOf(new Date());
  const current = useWeekView(houseId, thisWeek);
  const next = useWeekView(houseId, shiftWeek(thisWeek, 1));
  const update = useUpdateChore(houseId);
  const [form, setForm] = useState<{ chore: Chore | null } | null>(null);
  const [pause, setPause] = useState<Chore | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upcoming = pause ? upcomingSlots([...(current.data?.assignments ?? []), ...(next.data?.assignments ?? [])], pause.id, new Date()) : 0;
  const closePause = () => {
    setPause(null);
    setError(null);
  };

  const toggle = (chore: Chore) => {
    if (chore.isActive) {
      setPause(chore);
      return;
    }
    update.mutate({ choreId: chore.id, isActive: true }, { onSuccess: () => toast(`Đã bật lại "${chore.title}".`), onError: (e) => toast(messageForError(e)) });
  };

  const confirmPause = () => {
    if (!pause) return;
    setError(null);
    update.mutate(
      { choreId: pause.id, isActive: false },
      {
        onSuccess: () => {
          toast(`Đã tạm ngưng "${pause.title}".`);
          closePause();
        },
        onError: (e) => setError(messageForError(e)),
      },
    );
  };

  return (
    <section aria-labelledby="chores-title" className="rounded-card border border-line bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-over uppercase text-ink-2">Danh sách việc</p>
          <h2 id="chores-title" className="font-display text-ct text-ink">
            Việc nhà
          </h2>
        </div>
        {isAdmin && (
          <Button variant="accent" leftIcon={<Plus />} onClick={() => setForm({ chore: null })}>
            Việc mới
          </Button>
        )}
      </div>

      {chores.isPending ? (
        <div className="mt-4 flex flex-col gap-3" aria-busy="true" aria-label="Đang tải danh sách việc">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : chores.isError ? (
        <EmptyState
          icon={<TriangleAlert />}
          tone="tom"
          title="Không tải được danh sách việc"
          description={messageForError(chores.error)}
          action={
            <Button variant="secondary" onClick={() => void chores.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : chores.data.length === 0 ? (
        <EmptyState icon={<Plus />} tone="yellow" title="Chưa có việc nào" description={isAdmin ? 'Thêm việc đầu tiên của nhà để bắt đầu xếp lịch.' : 'Trưởng phòng chưa thêm việc nào.'} />
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {chores.data.map((c) => (
            <ChoreRow key={c.id} chore={c} isAdmin={isAdmin} onEdit={() => setForm({ chore: c })} onToggle={() => toggle(c)} />
          ))}
        </ul>
      )}

      <ChoreFormModal open={!!form} onClose={() => setForm(null)} houseId={houseId} chore={form?.chore ?? null} />

      <Modal open={!!pause} onClose={closePause} title={`Tạm ngưng "${pause?.title ?? ''}"?`} description="Việc sẽ không được xếp vào lịch nữa. Lịch sử giữ nguyên, bật lại lúc nào cũng được.">
        {upcoming > 0 && (
          <p className="mb-4 rounded-btn-sm bg-hl-soft px-3 py-2 text-sm text-hl-ink">
            Việc này đang có <span className="font-mono">{upcoming}</span> ca chưa làm trong hai tuần tới. Các ca đó sẽ bị hủy.
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closePause}>
            Để sau
          </Button>
          <Button loading={update.isPending} onClick={confirmPause}>
            Tạm ngưng
          </Button>
        </div>
      </Modal>
    </section>
  );
}
