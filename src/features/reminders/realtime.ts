import { useQueryClient } from '@tanstack/react-query';
import { createElement, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import { assistantKeys } from '@/features/assistant/hooks.ts';
import { bindUserEvents, type SocketLike } from '@/lib/realtime.ts';
import { getSocket } from '@/lib/socket.ts';
import { reminderKeys } from './hooks.ts';

/** Backend phát vào room `user:<userId>` khi nhắc việc đến hạn (Issue #12, AGENTS.md mục 5). */
const REMINDER_EVENTS = ['reminder:due'] as const;

/** Payload `reminder:due` theo đặc tả; thiếu trường / không phải object thì hook bỏ qua êm. */
function isReminderDuePayload(payload: unknown): payload is { reminderId: string; title: string } {
  if (typeof payload !== 'object' || payload === null) return false;
  const { reminderId, title } = payload as Record<string, unknown>;
  return typeof reminderId === 'string' && typeof title === 'string';
}

/**
 * Nghe `reminder:due` cho cả app (gắn một lần trong AppShell): toast tiêu đề nhắc kèm nút "Xem" sang
 * Trợ lý. Socket chỉ nhận broadcast — danh sách nhắc và tin nhắn luôn tải lại qua REST, kể cả sau khi
 * nối lại (toast có thể lỡ nhưng nhắc đã phát vẫn xem được trong chat như tin SYSTEM).
 */
export function useReminderRealtime() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    return bindUserEvents(getSocket() as unknown as SocketLike, REMINDER_EVENTS, (event, payload) => {
      const refetch = () => {
        void queryClient.invalidateQueries({ queryKey: reminderKeys.all });
        void queryClient.invalidateQueries({ queryKey: assistantKeys.all });
      };

      if (event === 'reconnect') return refetch();
      // Payload sai kiểu: bỏ qua êm, không ném lỗi (lọc kiểu đặt ở hook, bindUserEvents pass nguyên).
      if (event !== 'reminder:due' || !isReminderDuePayload(payload)) return;

      // Toast Design.md mục 3: style chung đã có ở <Toaster> (nền ink, bóng 3/3 hl); ở đây thêm icon
      // check màu hl và action "Xem" (sms gạch chân màu hl), đủ ~9 giây để đọc.
      toast(payload.title, {
        duration: 9000,
        icon: createElement(CircleCheck, { className: 'size-[18px] shrink-0 text-hl', 'aria-hidden': true }),
        classNames: { actionButton: 'text-sm font-semibold text-hl underline underline-offset-2' },
        action: { label: 'Xem', onClick: () => navigate('/assistant') },
      });
      refetch();
    });
  }, [queryClient, navigate]);
}
