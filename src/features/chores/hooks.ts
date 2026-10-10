import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChoreInput, choresApi } from './api.ts';
import type { VerifyDecision } from './types.ts';

export const choreKeys = {
  chores: (houseId: string) => ['chores', houseId] as const,
  assignments: (houseId: string) => ['assignments', houseId] as const,
  week: (houseId: string, weekKey: string) => ['assignments', houseId, weekKey] as const,
};

export function useChores(houseId: string | undefined) {
  return useQuery({
    queryKey: choreKeys.chores(houseId ?? ''),
    queryFn: () => choresApi.listChores(houseId!),
    enabled: !!houseId,
  });
}

export function useAssignments(houseId: string | undefined, weekKey: string) {
  return useQuery({
    queryKey: choreKeys.week(houseId ?? '', weekKey),
    queryFn: () => choresApi.listAssignments(houseId!, weekKey),
    enabled: !!houseId,
  });
}

/** Mọi thay đổi ca trực: tải lại danh sách ca của nhà (mọi tuần đang cache). */
function useInvalidateAssignments(houseId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: choreKeys.assignments(houseId) });
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
  const invalidateAssignments = useInvalidateAssignments(houseId);
  return useMutation({
    mutationFn: ({ choreId, ...body }: { choreId: string } & Partial<ChoreInput> & { isActive?: boolean }) =>
      choresApi.updateChore(houseId, choreId, body),
    onSuccess: () => {
      void invalidateAssignments();
      return queryClient.invalidateQueries({ queryKey: choreKeys.chores(houseId) });
    },
  });
}

export function useShuffle(houseId: string) {
  const invalidate = useInvalidateAssignments(houseId);
  return useMutation({
    mutationFn: (weekKey: string) => choresApi.shuffle(houseId, weekKey),
    onSuccess: invalidate,
  });
}

export function useCheckin(houseId: string) {
  const invalidate = useInvalidateAssignments(houseId);
  return useMutation({
    mutationFn: ({ assignmentId, photo, filename }: { assignmentId: string; photo: Blob; filename: string }) =>
      choresApi.checkin(assignmentId, photo, filename),
    onSuccess: invalidate,
  });
}

export function useVerify(houseId: string) {
  const invalidate = useInvalidateAssignments(houseId);
  return useMutation({
    mutationFn: ({ assignmentId, ...body }: { assignmentId: string; decision: VerifyDecision; reason?: string }) =>
      choresApi.verify(assignmentId, body),
    onSuccess: invalidate,
  });
}
