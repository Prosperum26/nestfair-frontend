import { Banknote, Bell, CircleCheck, Lock, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { assistantErrorMessage } from '../errors.ts';
import { reminderWhen, type ReminderWhen } from '@/features/reminders/format.ts';
import { useCreateReminder } from '@/features/reminders/hooks.ts';
import type { ExpensePrefill } from '@/features/expenses/components/ExpenseFormModal.tsx';
import type { AssistantMessageDto } from '../types.ts';
import { actionRequest } from '../actions.ts';
import { reminderConfirmation } from '../thread.ts';
import { draftKey, useDraftDoneKeys } from '../draft-done.ts';

/** Nút hành động: viền line-2, nền surface, icon 16 trái, chữ btns. KHÔNG dùng nút accent vàng — CTA chính của màn là ô gửi. */
const BUTTON_CLS =
  'inline-flex h-9 max-sm:h-11 items-center gap-2 rounded-btn border border-line-2 bg-surface px-3.5 text-btns text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:size-4';

/**
 * Khối nút hành động dưới tin trợ lý (ảnh 19): tiêu đề "Gợi ý · bấm để làm, trợ lý không tự ghi"
 * + một nút cho từng gợi ý. Bấm nút MỚI có lời gọi API (AI không tự ghi):
 * - CREATE_REMINDER → POST /reminders kèm sourceMessageId/actionIndex; 409 → "Bạn đã tạo nhắc nhở này rồi";
 *   thành công → ghi chú xác nhận "Đã tạo nhắc nhở <thời điểm>"; remindAt thiếu / quá khứ → không gọi API.
 * - DRAFT_EXPENSE → mở ExpenseFormModal với prefill (người dùng bấm Lưu mới tạo khoản chi).
 * - CREATE_ADHOC_TASK → nút khóa "Sắp có".
 */
export function ActionButtons({
  message,
  houseId,
  onDraftExpense,
}: {
  message: AssistantMessageDto;
  houseId: string;
  onDraftExpense: (prefill: ExpensePrefill, key: string) => void;
}) {
  const create = useCreateReminder();
  const expenseDone = useDraftDoneKeys();
  // Server đã đánh dấu done (CREATE_REMINDER đã bấm trước đó) + những nút vừa bấm thành công trong phiên này.
  const [localDone, setLocalDone] = useState<number[]>([]);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ReminderWhen | null>(null);

  const requests = useMemo(() => message.actions.map((action, index) => actionRequest(action, message, index)), [message]);

  const press = (index: number) => {
    const request = requests[index];
    setError(null);
    switch (request.kind) {
      case 'invalid-time':
        setError('Giờ nhắc đã qua hoặc thiếu, bạn nhập lại giờ khác nhé.');
        return;
      case 'open-expense-draft':
        onDraftExpense(request.prefill, draftKey(message.id, index));
        return;
      case 'locked':
        setError('Tạo việc đột xuất sắp có, hiện hãy tự thêm vào lịch nhé.');
        return;
      case 'create-reminder':
        setPendingIndex(index);
        create.mutate(
          {
            houseId,
            title: request.title,
            remindAt: request.remindAt,
            sourceMessageId: request.sourceMessageId,
            actionIndex: request.actionIndex,
          },
          {
            onSuccess: (reminder) => {
              setLocalDone((prev) => [...prev, index]);
              setPendingIndex(null);
              setConfirmed(reminderWhen(reminder.remindAt, new Date()));
            },
            onError: (e) => {
              setPendingIndex(null);
              setError(assistantErrorMessage(e));
            },
          },
        );
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-cap text-ink-2">Gợi ý · bấm để làm, trợ lý không tự ghi</p>
      <div className="flex flex-col items-start gap-1.5">
        {message.actions.map((action, index) => {
          const request = requests[index];
          const done = action.done || localDone.includes(index) || expenseDone.includes(draftKey(message.id, index));
          if (request.kind === 'locked') {
            return (
              <button key={index} type="button" disabled className={BUTTON_CLS} aria-label="Tính năng sắp có">
                <Lock className="text-ink-2" aria-hidden />
                Sắp có
              </button>
            );
          }
          return (
            <button
              key={index}
              type="button"
              disabled={done || pendingIndex === index || create.isPending}
              aria-busy={pendingIndex === index || undefined}
              onClick={() => press(index)}
              className={BUTTON_CLS}
            >
              {done ? (
                <CircleCheck className="text-mint" aria-hidden />
              ) : request.kind === 'open-expense-draft' ? (
                <Banknote aria-hidden />
              ) : (
                <Bell aria-hidden />
              )}
              {action.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-cap text-tom">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {confirmed && (
        <p role="status" className="inline-flex items-center gap-1.5 rounded-full bg-mint-bg px-3 py-1.5 text-cap font-medium text-mint">
          <CircleCheck className="size-3.5 shrink-0" aria-hidden />
          Đã tạo nhắc nhở {reminderConfirmation(confirmed)}
        </p>
      )}
    </div>
  );
}
