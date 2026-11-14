import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { ITEMS_COLLAPSED_COUNT, itemsSummary, visibleItems } from '../items-summary.ts';
import type { ExpenseItem } from '../types.ts';

const MAX_AVATARS = 3;

interface Person {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}

/** Hàng "tên món ······ thành tiền": cột trái co giãn và cắt chữ để tên dài không làm tràn ngang ở 360px. */
function ItemRow({ label, extra, amount, muted }: { label: string; extra?: React.ReactNode; amount: string; muted?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`min-w-0 truncate text-sm ${muted ? 'text-ink-2' : 'font-medium text-ink'}`}>{label}</span>
      {extra}
      <span className="h-0 min-w-3 flex-1 translate-y-1 border-b-[1.5px] border-dotted border-line-2" />
      <span className={`shrink-0 font-mono text-ms ${muted ? 'text-ink-2' : 'text-ink'}`}>{amount}</span>
    </li>
  );
}

/**
 * Mục "Các món trong hóa đơn" ở chi tiết khoản chi: tên món, người dùng món (chỉ khoản chia theo món), thành tiền,
 * và một dòng "Giảm giá / phí khác" khi tổng món lệch tổng hóa đơn. Quá 6 món thì thu gọn. Không có món thì không hiện gì.
 */
export function ExpenseItemsList({
  items,
  totalAmount,
  people,
  meId,
}: {
  items: readonly ExpenseItem[];
  totalAmount: number;
  people: readonly Person[];
  meId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const { adjustment } = itemsSummary(totalAmount, items);
  const shown = visibleItems(items, expanded);
  const byId = new Map(people.map((p) => [p.userId, p]));

  return (
    <section aria-label="Các món trong hóa đơn">
      <p className="font-mono text-over uppercase text-ink-2">Các món trong hóa đơn · {items.length} món</p>
      <ul className="mt-3 flex flex-col gap-3">
        {shown.map((item, index) => {
          const users = item.userIds.map((id) => byId.get(id)).filter((p): p is Person => p !== undefined);
          return (
            <ItemRow
              key={`${index}-${item.name}`}
              label={item.name}
              amount={formatVnd(item.lineTotal)}
              extra={
                users.length > 0 ? (
                  <span className="flex shrink-0 items-center -space-x-1.5">
                    <span className="sr-only">Dùng: {users.map((u) => (u.userId === meId ? 'Bạn' : firstName(u.fullName))).join(', ')}</span>
                    {users.slice(0, MAX_AVATARS).map((u) => (
                      <span key={u.userId} aria-hidden className="rounded-full ring-2 ring-surface">
                        <Avatar name={u.fullName} tone={avatarToneFor(u.userId)} src={u.avatarUrl} size={20} />
                      </span>
                    ))}
                    {users.length > MAX_AVATARS && (
                      <span aria-hidden className="pl-2 text-cap text-ink-2">
                        +{users.length - MAX_AVATARS}
                      </span>
                    )}
                  </span>
                ) : null
              }
            />
          );
        })}
        {adjustment !== 0 && (
          <ItemRow
            muted
            label="Giảm giá / phí khác"
            amount={`${adjustment < 0 ? '−' : '+'}${formatVnd(Math.abs(adjustment))}`}
          />
        )}
      </ul>
      {items.length > ITEMS_COLLAPSED_COUNT ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 max-sm:h-11"
          leftIcon={expanded ? <ChevronUp /> : <ChevronDown />}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Thu gọn' : `Xem tất cả (${items.length})`}
        </Button>
      ) : null}
    </section>
  );
}
