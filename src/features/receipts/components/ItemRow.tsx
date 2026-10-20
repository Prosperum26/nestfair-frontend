import { Trash2, TriangleAlert } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { AmountInput } from '@/features/expenses/components/AmountInput.tsx';
import type { UserBrief } from '@/features/expenses/types.ts';
import { firstName } from '@/lib/date.ts';
import { cn } from '@/lib/cn.ts';
import type { ReviewItem } from '../draft-form.ts';

const initialOf = (name: string) => (name.trim().split(/\s+/).at(-1) ?? name).charAt(0).toUpperCase();

/**
 * Một món trên hóa đơn: sửa tên, tiền, bấm avatar để chọn ai dùng món. `flagged` tô vàng (AI không chắc, chưa được
 * xác nhận); sửa tiền hoặc chọn người dùng món là cách người dùng xác nhận nên tắt viền (`uncertain = false`).
 */
export function ItemRow({
  item,
  members,
  flagged,
  error,
  onChange,
  onRemove,
}: {
  item: ReviewItem;
  members: UserBrief[];
  flagged: boolean;
  error?: { name?: string; lineTotal?: string; userIds?: string };
  onChange: (next: ReviewItem) => void;
  onRemove: () => void;
}) {
  const toggle = (id: string) =>
    onChange({ ...item, uncertain: false, userIds: item.userIds.includes(id) ? item.userIds.filter((u) => u !== id) : [...item.userIds, id] });

  return (
    <li
      className={cn(
        'grid gap-x-3 gap-y-2 rounded-btn px-3 py-3 md:grid-cols-[minmax(0,1fr)_44px_132px_auto_40px] md:items-center',
        flagged ? 'bg-hl-soft ring-2 ring-hl' : 'border-b border-line last:border-b-0',
      )}
    >
      <div className="min-w-0">
        <input
          aria-label="Tên món"
          value={item.name}
          maxLength={80}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
          className={cn(
            'h-10 w-full rounded-btn-sm border bg-surface px-3 text-sm text-ink focus:border-ink focus:shadow-focus focus:outline-none',
            error?.name ? 'border-[1.5px] border-tom' : 'border-line-2',
          )}
        />
        {error?.name && <p className="mt-1 text-cap text-tom">{error.name}</p>}
        {flagged && item.note && (
          <p className="mt-1.5 flex items-start gap-1.5 text-cap text-hl-ink">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            {item.note}
          </p>
        )}
      </div>

      <span className="font-mono text-ms text-ink-2 md:text-center" title="Số lượng AI đọc được">
        ×{item.quantity}
      </span>

      <div>
        <AmountInput
          size="sm"
          aria-label="Tiền món"
          placeholder="0"
          value={item.lineTotal}
          invalid={!!error?.lineTotal}
          onChange={(v) => onChange({ ...item, lineTotal: v, uncertain: false })}
        />
        {error?.lineTotal && <p className="mt-1 text-cap text-tom">{error.lineTotal}</p>}
      </div>

      <div className="md:justify-self-end">
        <div className="-mx-1 flex flex-wrap items-center" role="group" aria-label="Ai dùng món này">
          {members.map((m) => {
            const on = item.userIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                aria-label={`${firstName(m.fullName)} ${on ? 'có' : 'không'} dùng món này`}
                onClick={() => toggle(m.id)}
                className="flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:shadow-focus md:size-9"
              >
                {on ? (
                  <Avatar name={m.fullName} tone={avatarToneFor(m.id)} src={m.avatarUrl} size={28} />
                ) : (
                  <span className="inline-flex size-7 items-center justify-center rounded-full border border-dashed border-line-2 text-cap font-semibold text-ink-3" aria-hidden>
                    {initialOf(m.fullName)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {error?.userIds && <p className="mt-1 text-cap text-tom md:text-right">{error.userIds}</p>}
      </div>

      <IconButton icon={<Trash2 />} label="Xóa món" onClick={onRemove} className="justify-self-end md:justify-self-auto" />
    </li>
  );
}
