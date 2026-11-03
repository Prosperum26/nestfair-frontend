import { Plus, Receipt, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { CATEGORY_META, SPLIT_META } from '../category.ts';
import { dayMonth, groupByDay } from '../grouping.ts';
import type { Expense } from '../types.ts';
import { CategoryTile, Person } from './bits.tsx';

interface ListProps {
  expenses: Expense[];
  meId: string | undefined;
  selectedId: string | null;
  onSelect: (expense: Expense) => void;
}

/** Bảng sổ chi desktop (ảnh 07): header nền paper-2 chữ overline, hàng h60, cột tiền căn phải mono. */
export function ExpenseTable({ expenses, meId, selectedId, onSelect }: ListProps) {
  const th = 'px-3 font-mono text-over font-medium uppercase text-ink-2';
  return (
    <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
      <thead>
        <tr className="h-10 bg-paper-2 text-left">
          <th className={cn(th, 'w-[72px] rounded-l-btn-sm')}>Ngày</th>
          <th className={th}>Khoản chi</th>
          <th className={cn(th, 'w-[112px]')}>Người trả</th>
          <th className={cn(th, 'w-[112px]')}>Cách chia</th>
          <th className={cn(th, 'w-[112px] text-right')}>Tổng</th>
          <th className={cn(th, 'w-[100px] rounded-r-btn-sm text-right')}>Của bạn</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => {
          const selected = e.id === selectedId;
          const split = SPLIT_META[e.splitType];
          return (
            <tr
              key={e.id}
              onClick={() => onSelect(e)}
              className={cn('h-[60px] cursor-pointer [&>td]:border-b [&>td]:border-line', selected ? 'bg-hl-soft' : 'hover:bg-paper')}
            >
              <td className="px-3 font-mono text-ms text-ink">{dayMonth(e.spentAt)}</td>
              <td className="px-3">
                {/* Nút thật cho bàn phím / trình đọc màn hình; cả hàng vẫn bấm được bằng chuột. */}
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelect(e);
                  }}
                  className="flex w-full min-w-0 items-center gap-3 rounded-btn-sm text-left focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <CategoryTile category={e.category} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{e.title}</span>
                    <span className="block text-cap text-ink-2">{CATEGORY_META[e.category].label}</span>
                  </span>
                </button>
              </td>
              <td className="px-3 text-ink">
                <Person user={e.payer} meId={meId} />
              </td>
              <td className="px-3">
                <Chip tone={split.tone} size="sm">
                  {split.label}
                </Chip>
              </td>
              <td className="px-3 text-right font-mono text-mm text-ink">{formatVnd(e.totalAmount)}</td>
              <td className="px-3 text-right font-mono text-ms text-ink-2">{e.myShare ? formatVnd(e.myShare) : '–'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Danh sách mobile (ảnh 07 mobile): nhóm theo ngày, mỗi ngày một thẻ. */
export function ExpenseDayList({ expenses, meId, onSelect }: Omit<ListProps, 'selectedId'>) {
  return (
    <div className="flex flex-col gap-4">
      {groupByDay(expenses).map((g) => (
        <section key={g.key} aria-label={g.label}>
          <h3 className="mb-2 font-mono text-over uppercase text-ink-2">{g.label}</h3>
          <ul className="divide-y divide-line rounded-card border border-line bg-surface px-4">
            {g.items.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e)}
                  className="flex w-full items-center gap-3 py-3.5 text-left focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <CategoryTile category={e.category} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{e.title}</span>
                    <span className="block text-cap text-ink-2">
                      {e.payer.id === meId ? 'Bạn' : firstName(e.payer.fullName)} trả · {SPLIT_META[e.splitType].label}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-mm text-ink">{formatVnd(e.totalAmount)}</span>
                    <span className="block text-cap text-ink-2">
                      Bạn <span className="font-mono">{formatVnd(e.myShare)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ExpenseListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải sổ chi">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[60px]" />
      ))}
    </div>
  );
}

export function ExpenseListEmpty({ filtered, onAdd }: { filtered: boolean; onAdd: () => void }) {
  return filtered ? (
    <EmptyState icon={<Receipt />} title="Không có khoản chi nào khớp" description="Thử bỏ bớt bộ lọc hoặc tìm từ khác." />
  ) : (
    <EmptyState
      icon={<Receipt />}
      tone="yellow"
      title="Tháng này chưa có khoản chi nào"
      description="Ghi khoản chi đầu tiên, NestFair sẽ chia tiền và tính ai cần trả ai."
      action={
        <Button variant="accent" leftIcon={<Plus />} onClick={onAdd}>
          Thêm chi tiêu
        </Button>
      }
    />
  );
}

export function ExpenseListError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<TriangleAlert />}
      tone="tom"
      title="Chưa tải được sổ chi"
      description="Kiểm tra kết nối mạng rồi thử lại nhé."
      action={
        <Button variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      }
    />
  );
}
