import { ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { LedgerRow, Receipt } from '@/components/ui/Receipt.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { SPLIT_META } from '../category.ts';
import { isLedgerStale, ledgerErrorMessage } from '../errors.ts';
import { dayMonth } from '../grouping.ts';
import { useDeleteExpense } from '../hooks.ts';
import type { Expense } from '../types.ts';
import { CategoryTile } from './bits.tsx';
import { ExpenseItemsList } from './ExpenseItemsList.tsx';

const pad = (n: number) => n.toString().padStart(2, '0');
const timeOf = (iso: string) => {
  const d = new Date(iso);
  return `${dayMonth(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Chi tiết khoản chọn dạng hóa đơn răng cưa (ảnh 07, Design.md mục 4): tên + ngày · người trả → tổng ml →
 * chip kiểu chia → dòng sổ cái từng người → ảnh hóa đơn → Sửa / Xóa (nếu có quyền).
 */
export function ExpenseDetail({
  expense,
  houseId,
  meId,
  creatorName,
  onEdit,
  onDeleted,
}: {
  expense: Expense;
  houseId: string;
  meId: string | undefined;
  /** Tên người ghi (lấy từ danh sách thành viên), để hiện "Quân thêm · 04.10 18:20". */
  creatorName: string | undefined;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const remove = useDeleteExpense(houseId);
  const split = SPLIT_META[expense.splitType];
  const payerName = expense.payer.id === meId ? 'Bạn' : firstName(expense.payer.fullName);

  // mutateAsync: khoản vừa xóa biến khỏi danh sách nên chi tiết này có thể bị gỡ trước khi callback của mutate() chạy.
  const doDelete = () =>
    remove.mutateAsync(expense.id).then(
      () => {
        toast(`Đã xóa "${expense.title}".`);
        setConfirming(false);
        onDeleted();
      },
      (e: unknown) => {
        toast(ledgerErrorMessage(e));
        if (isLedgerStale(e)) {
          setConfirming(false);
          onDeleted();
        }
      },
    );

  return (
    <>
      <Receipt className="w-full">
        <div className="flex items-center gap-3">
          <CategoryTile category={expense.category} size={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{expense.title}</p>
            <p className="text-cap text-ink-2">
              {dayMonth(expense.spentAt)} · {payerName} trả
            </p>
          </div>
        </div>
        <div className="my-4 border-t-[1.5px] border-dashed border-line-2" />
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm text-ink-2">Tổng hóa đơn</span>
          <span className="font-mono text-ml text-ink">{formatVnd(expense.totalAmount)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip tone={split.tone} size="sm">
            {split.label}
          </Chip>
          {expense.receiptImageUrl && (
            <Chip tone="outline" size="sm" icon={<ImageIcon />}>
              Có ảnh
            </Chip>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {expense.splits.map((s) => (
            <LedgerRow
              key={s.userId}
              left={
                <>
                  <Avatar name={s.fullName} tone={avatarToneFor(s.userId)} src={s.avatarUrl} size={24} />
                  {s.userId === meId ? 'Bạn' : firstName(s.fullName)}
                </>
              }
              amount={formatVnd(s.amount)}
            />
          ))}
        </div>
        {expense.items.length > 0 && (
          <>
            <div className="my-4 border-t-[1.5px] border-dashed border-line-2" />
            <ExpenseItemsList items={expense.items} totalAmount={expense.totalAmount} people={expense.splits} meId={meId} />
          </>
        )}
        {expense.note && <p className="mt-4 text-sm text-ink-2">{expense.note}</p>}

        {expense.receiptImageUrl && (
          <>
            <div className="my-4 border-t-[1.5px] border-dashed border-line-2" />
            <a
              href={expense.receiptImageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-btn focus-visible:outline-none focus-visible:shadow-focus"
            >
              <img src={expense.receiptImageUrl} alt="Ảnh hóa đơn" className="size-16 shrink-0 rounded-btn-sm border border-line object-cover" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink underline decoration-line-2 underline-offset-2">Ảnh hóa đơn</span>
                <span className="block text-cap text-ink-2">
                  {creatorName ?? 'Thành viên'} thêm · {timeOf(expense.createdAt)}
                </span>
              </span>
            </a>
          </>
        )}

        {expense.canEdit && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="secondary" leftIcon={<Pencil />} onClick={onEdit}>
              Sửa
            </Button>
            <Button variant="dangerSoft" leftIcon={<Trash2 />} onClick={() => setConfirming(true)}>
              Xóa
            </Button>
          </div>
        )}
      </Receipt>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Xóa khoản chi này?"
        description={`"${expense.title}" (${formatVnd(expense.totalAmount)}) sẽ bị xóa khỏi sổ và số dư của mọi người được tính lại.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Giữ lại
          </Button>
          <Button variant="danger" leftIcon={<Trash2 />} loading={remove.isPending} onClick={doDelete}>
            Xóa khoản chi
          </Button>
        </div>
      </Modal>
    </>
  );
}
