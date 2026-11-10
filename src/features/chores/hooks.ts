import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { optimisticList, removeById } from '@/lib/optimistic.ts';
import { type ChoreInput, choresApi, type DateRangeInput } from './api.ts';
import { mergeAssignments } from './grouping.ts';
import type { Absence, ChoreSettings, HouseBreak, OverrideAction, VerifyDecision } from './types.ts';
import { shiftWeek, weekKeyOf } from './week.ts';

export const choreKeys = {
  chores: (houseId: string) => ['chores', houseId] as const,
  /** Tiền tố của mọi tuần: invalidate một lần là tải lại hết. */
  assignments: (houseId: string) => ['assignments', houseId] as const,
  week: (houseId: string, weekKey: string) => ['assignments', houseId, weekKey] as const,
  absences: (houseId: string) => ['absences', houseId] as const,
  breaks: (houseId: string) => ['breaks', houseId] as const,
  settings: (houseId: string) => ['chore-settings', houseId] as const,
  audit: (houseId: string) => ['chore-audit', houseId] as const,
};

export function useChores(houseId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: [...choreKeys.chores(houseId ?? ''), includeInactive],
    queryFn: () => choresApi.listChores(houseId!, includeInactive),
    enabled: !!houseId,
  });
}

/** Lịch một tuần kèm scheduleMeta (backend tự sinh bù tuần hiện tại / kế tiếp nếu chưa có). */
export function useWeekView(houseId: string | undefined, weekKey: string, enabled = true) {
  return useQuery({
    queryKey: choreKeys.week(houseId ?? '', weekKey),
    queryFn: () => choresApi.weekView(houseId!, weekKey),
    enabled: !!houseId && enabled,
  });
}

/**
 * Ca dùng cho "hôm nay" và "Chờ bạn duyệt": tuần này, và tuần trước vào T2–T3 (ca vòng quay quay Chủ Nhật
 * có hạn tối đa 48 giờ nên có thể còn mở sang tuần mới).
 */
export function useTodayAssignments(houseId: string | undefined, now: Date = new Date()) {
  const thisWeek = weekKeyOf(now);
  const dow = (new Date(now.getTime() + 7 * 3_600_000).getUTCDay() + 6) % 7; // T2 = 0 (giờ VN)
  const current = useWeekView(houseId, thisWeek);
  const previous = useWeekView(houseId, shiftWeek(thisWeek, -1), dow <= 1);
  return {
    status: current.status,
    assignments: mergeAssignments(previous.data?.assignments, current.data?.assignments),
    refetch: () => Promise.all([current.refetch(), dow <= 1 ? previous.refetch() : null]),
  };
}

export function useChoreSettings(houseId: string | undefined) {
  return useQuery({
    queryKey: choreKeys.settings(houseId ?? ''),
    queryFn: () => choresApi.getSettings(houseId!),
    enabled: !!houseId,
  });
}

export function useAbsences(houseId: string | undefined) {
  return useQuery({ queryKey: choreKeys.absences(houseId ?? ''), queryFn: () => choresApi.listAbsences(houseId!), enabled: !!houseId });
}

export function useBreaks(houseId: string | undefined) {
  return useQuery({ queryKey: choreKeys.breaks(houseId ?? ''), queryFn: () => choresApi.listBreaks(houseId!), enabled: !!houseId });
}

export function useAudit(houseId: string | undefined) {
  return useQuery({ queryKey: choreKeys.audit(houseId ?? ''), queryFn: () => choresApi.audit(houseId!), enabled: !!houseId });
}

/** Mọi thay đổi ca trực: tải lại danh sách ca của nhà (mọi tuần đang cache) và nhật ký. */
function useInvalidateSchedule(houseId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: choreKeys.assignments(houseId) }),
      queryClient.invalidateQueries({ queryKey: choreKeys.audit(houseId) }),
    ]);
}

export function useCreateChore(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChoreInput) => choresApi.createChore(houseId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: choreKeys.chores(houseId) }),
  });
}

export function useUpdateChore(houseId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: ({ choreId, ...body }: { choreId: string } & Partial<ChoreInput> & { isActive?: boolean }) =>
      choresApi.updateChore(houseId, choreId, body),
    onSuccess: () => {
      void invalidate();
      return queryClient.invalidateQueries({ queryKey: choreKeys.chores(houseId) });
    },
  });
}

export function usePreview(houseId: string) {
  return useMutation({ mutationFn: (weekKey: string) => choresApi.preview(houseId, weekKey) });
}

export function useShuffle(houseId: string) {
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: ({ weekKey, mode }: { weekKey: string; mode: 'CREATE' | 'REROLL' }) => choresApi.shuffle(houseId, weekKey, mode),
    onSuccess: invalidate,
  });
}

export function useCheckin(houseId: string) {
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: ({ assignmentId, photo, filename, idempotencyKey }: { assignmentId: string; photo: Blob; filename: string; idempotencyKey: string }) =>
      choresApi.checkin(assignmentId, photo, filename, idempotencyKey),
    onSuccess: invalidate,
  });
}

export function useVerify(houseId: string) {
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: ({ assignmentId, ...body }: { assignmentId: string; decision: VerifyDecision; reason?: string }) => choresApi.verify(assignmentId, body),
    // Cả khi lỗi 409 (có người xử lý trước) cũng tải lại để thấy trạng thái mới.
    onSettled: invalidate,
  });
}

export function useAppeal(houseId: string) {
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({ mutationFn: (assignmentId: string) => choresApi.appeal(assignmentId), onSuccess: invalidate });
}

export function useOverride(houseId: string) {
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: ({ assignmentId, ...body }: { assignmentId: string; action: OverrideAction; reason: string; userId?: string }) =>
      choresApi.override(assignmentId, body),
    onSettled: invalidate,
  });
}

export function useCreateAbsence(houseId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: (body: DateRangeInput & { userId?: string }) => choresApi.createAbsence(houseId, body),
    onSuccess: () => {
      void invalidate();
      return queryClient.invalidateQueries({ queryKey: choreKeys.absences(houseId) });
    },
  });
}

export function useDeleteAbsence(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => choresApi.deleteAbsence(houseId, id),
    ...optimisticList<string, Absence>(queryClient, { queryKey: choreKeys.absences(houseId), apply: (list, id) => removeById(list, id) ?? list, ids: (id) => [id] }),
  });
}

export function useCreateBreak(houseId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSchedule(houseId);
  return useMutation({
    mutationFn: (body: DateRangeInput) => choresApi.createBreak(houseId, body),
    onSuccess: () => {
      void invalidate();
      return queryClient.invalidateQueries({ queryKey: choreKeys.breaks(houseId) });
    },
  });
}

export function useDeleteBreak(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => choresApi.deleteBreak(houseId, id),
    ...optimisticList<string, HouseBreak>(queryClient, { queryKey: choreKeys.breaks(houseId), apply: (list, id) => removeById(list, id) ?? list, ids: (id) => [id] }),
  });
}

export function useUpdateSettings(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ChoreSettings>) => choresApi.updateSettings(houseId, body),
    onSuccess: (data) => queryClient.setQueryData(choreKeys.settings(houseId), data),
  });
}
