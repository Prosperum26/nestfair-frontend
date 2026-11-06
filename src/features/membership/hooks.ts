import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { choreKeys } from '@/features/chores/hooks.ts';
import { ledgerKeys } from '@/features/expenses/hooks.ts';
import { houseKeys } from '@/features/houses/hooks.ts';
import type { HouseSummary } from '@/features/houses/types.ts';
import { swapKeys } from '@/features/swaps/keys.ts';
import { useHouseStore } from '@/stores/house-store.ts';
import { membershipApi } from './api.ts';
import type { KickInput } from './types.ts';

/** Không đặt dưới ['houses', …]: người vừa bị xóa thì xem trước trả 404, không được tải lại theo danh sách nhà. */
export const membershipKeys = {
  preview: (houseId: string, userId: string) => ['leave-preview', houseId, userId] as const,
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

/** Mình không còn trong nhà này (rời, bị xóa, nhà giải tán): bỏ chọn, bỏ khỏi cache rồi tải lại danh sách nhà. */
export function useDropHouse() {
  const queryClient = useQueryClient();
  const selectHouse = useHouseStore((s) => s.selectHouse);
  return async (houseId: string) => {
    selectHouse(null);
    // Bỏ khỏi cache trước: nếu không, trang chọn lại nhà đó và tải chi tiết bị 403.
    queryClient.setQueryData<HouseSummary[]>(houseKeys.all, (list) => list?.filter((h) => h.id !== houseId));
    queryClient.removeQueries({ queryKey: houseKeys.detail(houseId) });
    await queryClient.invalidateQueries({ queryKey: houseKeys.all });
  };
}

/** Rời nhà: danh sách nhà tải lại sẽ chọn nhà còn lại, hết nhà thì về /onboarding (RequireHouse). */
export function useLeaveHouse(houseId: string) {
  const dropHouse = useDropHouse();
  return useMutation({
    mutationFn: (newAdminUserId?: string) => membershipApi.leave(houseId, newAdminUserId),
    onSuccess: () => dropHouse(houseId),
  });
}

/** Trưởng phòng giải tán nhà: ai cũng rời, nhà biến khỏi danh sách. */
export function useDissolveHouse(houseId: string) {
  const dropHouse = useDropHouse();
  return useMutation({
    mutationFn: (confirmName: string) => membershipApi.dissolve(houseId, confirmName),
    onSuccess: () => dropHouse(houseId),
  });
}

export function useTransferAdmin(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membershipApi.transferAdmin(houseId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: houseKeys.all }),
  });
}
