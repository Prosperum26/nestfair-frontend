import { Check, Gift, Heart, Hourglass, Repeat, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { firstName } from '@/lib/date.ts';
import { compensationLine, marketAcceptState } from '../swap-lists.ts';
import { slotLabel, timeLeftLabel } from '../swap-format.ts';
import type { Swap } from '../types.ts';

/**
 * Một thẻ trong Chợ ca (preview 15): ca cần người nhận, đồng hồ đếm ngược, quà hoặc làm bù, nút "Nhận giúp".
 * Nút khóa kèm lý do khi bạn không đủ điều kiện (vắng, đã có ca cùng việc, là người nhờ).
 */
export function MarketCard({
  swap,
  now,
  accepting,
  accepted = false,
  onAccept,
}: {
  swap: Swap;
  now: Date;
  accepting: boolean;
  /** Vừa nhận thành công: thay nút bằng dấu "Đã nhận" trong lúc thẻ rời danh sách. */
  accepted?: boolean;
  onAccept: () => void;
}) {
  const slot = swap.fromAssignment;
  const line = compensationLine(swap);
  const state = marketAcceptState(swap);
  const expired = new Date(swap.expiresAt).getTime() <= now.getTime();
  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <IconTile icon={<Sparkles />} tone="yellow" size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-h4 text-ink">{slot ? slotLabel(slot) : 'Ca trực'}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-cap text-ink-2">
            <Avatar name={swap.requesterName} tone={avatarToneFor(swap.requesterMemberId)} size={20} />
            <span className="truncate">{firstName(swap.requesterName)} nhờ</span>
            {slot && <span className="font-mono">· {slot.weight} điểm</span>}
          </p>
        </div>
        <Chip tone="outline" size="sm" icon={<Hourglass />}>
          {timeLeftLabel(swap.expiresAt, now)}
        </Chip>
      </div>

      {line && (
        <div
          className={
            line.kind === 'GIFT'
              ? 'mt-3 flex items-center gap-2 rounded-btn bg-hl-soft px-3 py-2 text-sm text-hl-ink'
              : 'mt-3 flex items-center gap-2 rounded-btn bg-lil-bg px-3 py-2 text-sm text-lil'
          }
        >
          {line.kind === 'GIFT' ? <Gift className="size-4 shrink-0" aria-hidden /> : <Repeat className="size-4 shrink-0" aria-hidden />}
          <span className="min-w-0 flex-1 truncate">{line.text}</span>
          {line.amountText && <span className="shrink-0 font-mono font-semibold text-ink">{line.amountText}</span>}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-cap text-ink-2">{state.reason ?? 'Nhận rồi thì ca chuyển sang bạn ngay, không cần chờ duyệt.'}</p>
        {accepted ? (
          <Chip tone="mint" icon={<Check />}>
            Đã nhận ca
          </Chip>
        ) : (
          <Button variant="accent" size="sm" leftIcon={<Heart />} disabled={state.disabled || expired} loading={accepting} onClick={onAccept}>
            Nhận giúp
          </Button>
        )}
      </div>
    </article>
  );
}
