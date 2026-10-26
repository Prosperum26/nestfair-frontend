import { ChevronUp, Sparkles, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import type { ExpensePrefill } from '@/features/expenses/components/ExpenseFormModal.tsx';
import { useAssistantMessages } from '../hooks.ts';
import type { AssistantMessageDto } from '../types.ts';
import { groupMessagesByDay } from '../thread.ts';
import { ActionButtons } from './ActionButtons.tsx';
import { MessageBubble } from './MessageBubble.tsx';

/** Vạch ngày giữa thread: dòng kẻ line hai bên + nhãn mono viết hoa ("HÔM NAY · 06.10"). */
function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" aria-hidden />
      <span className="font-mono text-over uppercase text-ink-2">{label}</span>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải hội thoại">
      <Skeleton className="mx-auto h-4 w-40" />
      <Skeleton className="ml-auto h-14 w-3/5 rounded-card" />
      <Skeleton className="h-24 w-4/5 rounded-card" />
      <Skeleton className="ml-auto h-14 w-1/2 rounded-card" />
    </div>
  );
}

/** Trợ lý "đang suy nghĩ": chờ POST trả về cả tin người gửi + tin trợ lý nên chen dòng chờ ở cuối thread. */
function ThinkingRow() {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3" aria-live="polite" role="status">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-hl text-ink" aria-hidden>
        <Sparkles className="size-4" />
      </span>
      <p className="animate-pulse rounded-card rounded-bl-chip border border-line bg-surface px-4 py-3 text-b text-ink-2">
        Trợ lý đang soạn trả lời…
      </p>
    </div>
  );
}

/**
 * Vùng cuộn danh sách tin (ảnh 19): vạch ngày theo giờ VN, tin cũ → mới, nút "Tải tin cũ hơn"
 * theo nextCursor, `aria-live` cho tin mới và ghi chú hệ thống (hết hạn mức) chèn cuối thread.
 * Cần `houseId` + thread hiện tại; `skipHistory` khi đang ở cuộc trò chuyện mới chưa có tin.
 */
export function ChatThread({
  houseId,
  threadId,
  skipHistory,
  sending,
  systemNote,
  onDraftExpense,
}: {
  houseId: string;
  /** undefined = thread mới nhất; cuộc trò chuyện mới chưa gửi tin thì dùng skipHistory. */
  threadId?: string;
  skipHistory?: boolean;
  /** Đang chờ POST /assistant/messages → hiện trạng thái trợ lý đang suy nghĩ. */
  sending: boolean;
  /** Ghi chú hệ thống cuối thread (vd. "Hôm nay bạn đã hỏi đủ 30 câu rồi…"). */
  systemNote: string | null;
  onDraftExpense: (prefill: ExpensePrefill) => void;
}) {
  const thread = useAssistantMessages(houseId, threadId, !skipHistory);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages: AssistantMessageDto[] = thread.data ? thread.data.pages.flatMap((page) => page.items) : [];
  const groups = groupMessagesByDay(messages, new Date());

  // Tin mới / trạng thái chờ xuất hiện thì cuộn xuống đáy cho người dùng thấy ngay.
  const bottomKey = `${messages.length}-${sending}-${systemNote ? 1 : 0}`;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [bottomKey]);

  return (
    <div ref={scrollRef} className="h-[min(58dvh,560px)] min-h-[320px] overflow-y-auto px-4 py-5 sm:px-6">
      {thread.isPending ? (
        <ThreadSkeleton />
      ) : thread.isError ? (
        <EmptyState
          icon={<TriangleAlert />}
          tone="tom"
          title="Chưa tải được hội thoại"
          description="Kiểm tra kết nối mạng rồi thử lại nhé."
          action={
            <Button variant="secondary" onClick={() => void thread.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : (
        <>
          {thread.hasNextPage && (
            <div className="mb-4 flex flex-col items-center gap-1">
              <Button variant="secondary" size="sm" leftIcon={<ChevronUp />} loading={thread.isFetchingNextPage} onClick={() => void thread.fetchNextPage()}>
                Tải tin cũ hơn
              </Button>
              {thread.isFetchNextPageError && (
                <p role="alert" className="text-cap text-tom">
                  Chưa tải được tin cũ hơn, thử lại nhé.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-5" aria-live="polite">
            {groups.length === 0 ? (
              <>
                <DayDivider label={groupMessagesByDay([ AssistantMessageStub ], new Date())[0].label} />
                <div className="flex flex-col items-center gap-1 py-6 text-center">
                  <p className="text-h4 text-ink">Bắt đầu trò chuyện</p>
                  <p className="max-w-[320px] text-sm text-ink-2">Hỏi về sự cố trong phòng, mẹo vặt, hoặc nhờ trợ lý tạo nhắc nhở giúp bạn.</p>
                </div>
              </>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="flex flex-col gap-5">
                  <DayDivider label={group.label} />
                  {group.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      actions={
                        message.role === 'ASSISTANT' && message.actions.length > 0 ? (
                          <ActionButtons message={message} houseId={houseId} onDraftExpense={onDraftExpense} />
                        ) : undefined
                      }
                    />
                  ))}
                </div>
              ))
            )}

            {sending && <ThinkingRow />}
            {systemNote && (
              <p role="status" className="mx-auto max-w-[92%] rounded-full bg-paper-2 px-4 py-2 text-center text-cap text-ink-2">
                {systemNote}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const AssistantMessageStub: AssistantMessageDto = {
  id: 'today-stub',
  threadId: '',
  role: 'ASSISTANT',
  content: '',
  category: null,
  actions: [],
  createdAt: new Date().toISOString(),
};
