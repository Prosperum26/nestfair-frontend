import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistantKeys } from '@/features/assistant/hooks.ts';
import { remindersApi } from './api.ts';
import type { ReminderInput, ReminderPatch, ReminderState } from './types.ts';

/** GET /reminders là nhắc của chính người gọi (không theo nhà) nên key chỉ cần state. */
export const reminderKeys = {
  all: ['reminders'] as const,
  list: (state: ReminderState) => ['reminders', 'list', state] as const,
};

/** Nhắc của tôi; đổi state giữ danh sách cũ trong lúc tải để list không nhảy về skeleton. */
export function useReminders(state: ReminderState = 'upcoming') {
  return useQuery({
    queryKey: reminderKeys.list(state),
    queryFn: () => remindersApi.list({ state }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReminderInput) => remindersApi.create(body),
    onSuccess: async (_reminder, body) => {
      await queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      // Nhắc sinh từ nút hành động của trợ lý: tin nhắn đó đổi done=true nên tải lại cả chat.
      if (body.sourceMessageId) await queryClient.invalidateQueries({ queryKey: assistantKeys.all });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReminderPatch }) => remindersApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all }),
  });
}
