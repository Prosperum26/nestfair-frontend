import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { choreKeys } from '@/features/chores/hooks.ts';
import { ledgerKeys } from '@/features/expenses/hooks.ts';
import { houseKeys } from '@/features/houses/hooks.ts';
import { swapKeys } from '@/features/swaps/keys.ts';
import { useHouseStore } from '@/stores/house-store.ts';
import { membershipApi } from './api.ts';
import type { KickInput } from './types.ts';

export const membershipKeys = {
  preview: (houseId: string, userId: string) => ['houses', houseId, 'leave-preview', userId] as const,
};

/** Số dư, ca sắp tới… để dựng hộp thoại. Luôn tải mới khi mở (số dư có thể vừa đổi). */
export function useLeavePreview(houseId: string, userId: string | undefined) {
  return useQuery({
    queryKey: membershipKeys.preview(houseId, userId ?? ''),
    queryFn: () => membershipApi.preview(houseId, userId!),
    enabled: !!userId,
    staleTime: 0,
    retry: false,
  });
}

/** Một người rời đi làm đổi số dư, lịch trực, đổi ca và danh sách thành viên của cả nhà. */
export function useInvalidateAfterMemberChange() {
  const queryClient = useQueryClient();
  return (houseId: string) =>
    Promise.all(
      [houseKeys.all, ledgerKeys.expenses(houseId), ledgerKeys.settlements(houseId), choreKeys.assignments(houseId), swapKeys.all(houseId), swapKeys.debts(houseId)].map(
        (queryKey) => queryClient.invalidateQueries({ queryKey }),
      ),
    );
}

export function useKickMember(houseId: string) {
  const invalidate = useInvalidateAfterMemberChange();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: KickInput }) => membershipApi.kick(houseId, userId, body),
    onSuccess: () => invalidate(houseId),
  });
}

/** Rời nhà: bỏ chọn nhà này; danh sách nhà tải lại sẽ chọn nhà còn lại, hết nhà thì về /onboarding (RequireHouse). */
export function useLeaveHouse(houseId: string) {
  const queryClient = useQueryClient();
  const selectHouse = useHouseStore((s) => s.selectHouse);
  return useMutation({
    mutationFn: (newAdminUserId?: string) => membershipApi.leave(houseId, newAdminUserId),
    onSuccess: async () => {
      selectHouse(null);
      queryClient.removeQueries({ queryKey: houseKeys.detail(houseId) });
      await queryClient.invalidateQueries({ queryKey: houseKeys.all });
    },
  });
}

export function useTransferAdmin(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membershipApi.transferAdmin(houseId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: houseKeys.all }),
  });
}
