import { Bell, ChevronRight, Plus } from 'lucide-react';
import { Suspense, lazy, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { AssistantConsentDialog } from '@/features/assistant/components/AssistantConsentDialog.tsx';
import { ChatThread } from '@/features/assistant/components/ChatThread.tsx';
import { Composer } from '@/features/assistant/components/Composer.tsx';
import { ContextCard } from '@/features/assistant/components/ContextCard.tsx';
import { QuickChips } from '@/features/assistant/components/QuickChips.tsx';
import { AssistantQuotaError, assistantErrorMessage } from '@/features/assistant/errors.ts';
import { useSendMessage } from '@/features/assistant/hooks.ts';
import type { AssistantConsentUser } from '@/features/assistant/types.ts';
import { markDraftDone } from '@/features/assistant/draft-done.ts';
import type { ExpensePrefill } from '@/features/expenses/components/ExpenseFormModal.tsx';
import { ExpenseFormModal } from '@/features/expenses/components/ExpenseFormModal.tsx';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { Modal } from '@/components/ui/Modal.tsx';
import { nextReminders, reminderWhen } from '@/features/reminders/format.ts';
import { useReminders } from '@/features/reminders/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

// Panel nhắc chỉ mở từ banner mobile; lazy để không đè nặng bundle của trang chat.
const RemindersPanel = lazy(() => import('@/features/reminders/components/RemindersPanel.tsx').then((m) => ({ default: m.RemindersPanel })));

function PanelFallback() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:p-6" aria-busy="true" aria-label="Đang tải nhắc nhở">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-[52px] w-full rounded-btn-sm" />
      <Skeleton className="h-[52px] w-full rounded-btn-sm" />
      <Skeleton className="h-[52px] w-full rounded-btn-sm" />
    </div>
  );
}

/**
 * Màn "Trợ lý phòng trọ" (preview 19): chat riêng tư bên trái (vạch ngày, bong bóng, nút hành
 * động, chip gợi ý, ô gửi), cột phải gồm RemindersPanel + thẻ "Trợ lý dựa vào". Mobile: một
 * cột, banner vàng mở panel nhắc trong modal. Luồng gửi đi qua cổng đồng ý D5; lỗi hạn mức 429
 * hiện nhẹ nhàng trong chat và khóa ô nhập (D9); AI không tự ghi — nút hành động mới gọi API.
 */
export function AssistantPage() {
  const { house } = useCurrentHouse();
  const detail = useHouseDetail(house?.id);
  const user = useAuthStore((s) => s.user);
  const send = useSendMessage(house?.id ?? '');

  // Thread đang xem: undefined = mới nhất; "Cuộc trò chuyện mới" bỏ threadId và bỏ qua lịch sử
  // (chưa gửi tin nào thì không tải gì, tin đầu tiên trả về threadId mới).
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [skipHistory, setSkipHistory] = useState(false);
  const [draft, setDraft] = useState('');
  const [quotaLocked, setQuotaLocked] = useState(false);
  const [systemNote, setSystemNote] = useState<string | null>(null);

  // Cổng đồng ý D5: tin gõ lúc chưa đồng ý giữ lại, "Đồng ý" thì gửi tiếp.
  const [consentOpen, setConsentOpen] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);

  // Bản nháp chi tiêu (DRAFT_EXPENSE): chỉ mở form, người dùng bấm Lưu mới tạo khoản.
  const [expenseDraft, setExpenseDraft] = useState<{ prefill: ExpensePrefill; key: string } | null>(null);

  const [bannerOpen, setBannerOpen] = useState(false);

  const reminders = useReminders('upcoming');
  const nearest = useMemo(() => nextReminders(reminders.data ?? [], 1)[0], [reminders.data]);
  const nearestWhen = nearest ? reminderWhen(nearest.remindAt, new Date()) : null;

  // Thành viên theo thứ tự vào nhà (không sửa khoản cũ nên không cần gộp người đã rời).
  const members = useMemo(
    () => (detail.data?.members ?? []).map((m) => ({ id: m.userId, fullName: m.fullName, avatarUrl: m.avatarUrl })),
    [detail.data],
  );
  const assistantConsentAt = user ? ((user as AssistantConsentUser).assistantConsentAt ?? null) : null;

  const doSend = (text: string) => {
    setSystemNote(null);
    send.mutate(
      { content: text, threadId },
      {
        onSuccess: (result) => {
          setDraft('');
          setThreadId(result.threadId);
          setSkipHistory(false);
          if (result.remaining <= 0) {
            setQuotaLocked(true);
            setSystemNote('Hôm nay bạn đã hỏi đủ 30 câu rồi. Mai mình trò chuyện tiếp nhé.');
          }
        },
        onError: (error) => {
          // Giữ nguyên bản nháp (draft không bị xóa) để người dùng gửi lại.
          if (error instanceof AssistantQuotaError) {
            setQuotaLocked(true);
            setSystemNote(assistantErrorMessage(error));
          } else {
            setSystemNote(null);
          }
        },
      },
    );
  };

  const submit = (text: string) => {
    if (assistantConsentAt === null) {
      setPendingText(text);
      setConsentOpen(true);
      return;
    }
    doSend(text);
  };

  const startNewThread = () => {
    setThreadId(undefined);
    setSkipHistory(true);
    setDraft('');
    setSystemNote(null);
  };

  if (!house) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải trợ lý">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[480px] w-full rounded-card" />
      </div>
    );
  }

  const bannerLabel =
    nearest && nearestWhen
      ? `${(reminders.data ?? []).length} nhắc nhở · gần nhất ${nearestWhen.time} ${nearestWhen.day === 'Hôm nay' ? 'hôm nay' : nearestWhen.day.toLowerCase()}`
      : null;

  return (
    <>
      <PageHeader
        overline="Riêng tư · Chỉ mình bạn thấy"
        title="Trợ lý phòng trọ"
        description="Hỏi về sự cố trong phòng, mẹo vặt, cách nói chuyện với bạn cùng phòng. Trợ lý gợi ý, bạn tự quyết."
        actions={
          <Button variant="secondary" leftIcon={<Plus />} onClick={startNewThread} disabled={send.isPending}>
            Cuộc trò chuyện mới
          </Button>
        }
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col">
          {/* Banner nhắc nhở (chỉ mobile, ảnh 19): mở RemindersPanel trong modal. */}
          {bannerLabel && (
            <button
              type="button"
              onClick={() => setBannerOpen(true)}
              className="mb-4 flex items-center gap-3 rounded-btn bg-hl-soft px-4 py-3 text-left focus-visible:outline-none focus-visible:shadow-focus lg:hidden"
            >
              <Bell className="size-4 shrink-0 text-ink" aria-hidden />
              <span className="flex-1 text-sm font-medium text-ink">{bannerLabel}</span>
              <ChevronRight className="size-4 shrink-0 text-ink-2" aria-hidden />
            </button>
          )}

          <div className="rounded-card border border-line bg-paper">
            <ChatThread
              houseId={house.id}
              threadId={threadId}
              skipHistory={skipHistory}
              sending={send.isPending}
              systemNote={systemNote}
              onDraftExpense={(prefill, key) => setExpenseDraft({ prefill, key })}
            />
            <div className="flex flex-col gap-3 px-4 pb-5 sm:px-6">
              <QuickChips disabled={quotaLocked || send.isPending} onPick={submit} />
              <Composer
                value={draft}
                onChange={setDraft}
                onSend={submit}
                sending={send.isPending}
                disabled={quotaLocked}
                lockNote={quotaLocked ? 'Hẹn bạn vào ngày mai' : null}
              />
            </div>
          </div>

          {/* Mobile: thẻ ngữ cảnh xếp dưới chat. */}
          <ContextCard className="mt-6 lg:hidden" />
        </div>

        {/* Desktop: cột phải — panel nhắc + thẻ ngữ cảnh. */}
        <aside className="hidden flex-col gap-6 lg:flex">
          <Suspense fallback={<PanelFallback />}>
            <RemindersPanel />
          </Suspense>
          <ContextCard />
        </aside>
      </div>

      <Suspense fallback={null}>
        <Modal open={bannerOpen} onClose={() => setBannerOpen(false)} title="Nhắc nhở của tôi" className="lg:hidden">
          <RemindersPanel className="border-0 p-0" />
        </Modal>
      </Suspense>

      <AssistantConsentDialog
        open={consentOpen}
        onAgree={() => {
          setConsentOpen(false);
          if (pendingText !== null) {
            const text = pendingText;
            setPendingText(null);
            doSend(text);
          }
        }}
        onDecline={() => {
          setConsentOpen(false);
          setPendingText(null);
        }}
      />

      <ExpenseFormModal
        open={expenseDraft !== null}
        houseId={house.id}
        houseName={house.name}
        members={members}
        meId={user?.id}
        expense={null}
        prefill={expenseDraft?.prefill}
        onClose={() => setExpenseDraft(null)}
        onSaved={() => {
          if (expenseDraft) markDraftDone(expenseDraft.key);
          setExpenseDraft(null);
        }}
      />
    </>
  );
}
