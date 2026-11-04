import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHouseStore } from '@/stores/house-store.ts';
import { type CreateHouseInput, type UpdateHouseInput, housesApi } from './api.ts';
import { pickCurrentHouse } from './current-house.ts';
import type { RuleProposalInput } from './rule-proposals.ts';
import type { HouseDetail } from './types.ts';

export const houseKeys = {
  all: ['houses'] as const,
  detail: (houseId: string) => ['houses', houseId] as const,
  ruleProposals: (houseId: string) => ['houses', houseId, 'rule-proposals'] as const,
};

export function useMyHouses() {
  return useQuery({ queryKey: houseKeys.all, queryFn: housesApi.list });
}

/** Nhà đang xem trong app (dùng bên trong RequireHouse nên luôn có). */
export function useCurrentHouse() {
  const houses = useMyHouses();
  const selectedHouseId = useHouseStore((s) => s.selectedHouseId);
  return {
    ...houses,
    house: houses.data ? pickCurrentHouse(houses.data, selectedHouseId) : null,
  };
}

export function useHouseDetail(houseId: string | undefined) {
  return useQuery({
    queryKey: houseKeys.detail(houseId ?? ''),
    queryFn: () => housesApi.detail(houseId!),
    enabled: !!houseId,
  });
}

/** Sau khi tạo / vào nhà: chọn nhà đó, cache chi tiết, tải lại danh sách. */
function useEnterHouse() {
  const queryClient = useQueryClient();
  const selectHouse = useHouseStore((s) => s.selectHouse);
  return (house: HouseDetail) => {
    selectHouse(house.id);
    queryClient.setQueryData(houseKeys.detail(house.id), house);
    return queryClient.invalidateQueries({ queryKey: houseKeys.all, exact: true });
  };
}

export function useCreateHouse() {
  const enter = useEnterHouse();
  return useMutation({
    mutationFn: (input: CreateHouseInput) => housesApi.create(input),
    onSuccess: enter,
  });
}

/** Trưởng phòng làm mới mã mời: cập nhật cache chi tiết nhà bằng mã mới. */
export function useRegenerateInviteCode(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => housesApi.regenerateInviteCode(houseId),
    onSuccess: (house) => queryClient.setQueryData(houseKeys.detail(house.id), house),
  });
}

/** Trưởng phòng sửa thông tin / nội quy: cập nhật cache chi tiết, tải lại danh sách nhà (tên, sức chứa). */
export function useUpdateHouse(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateHouseInput) => housesApi.update(houseId, input),
    onSuccess: (house) => {
      queryClient.setQueryData(houseKeys.detail(house.id), house);
      return queryClient.invalidateQueries({ queryKey: houseKeys.all, exact: true });
    },
  });
}

export function useJoinHouse() {
  const enter = useEnterHouse();
  return useMutation({
    mutationFn: (inviteCode: string) => housesApi.join(inviteCode),
    onSuccess: enter,
  });
}

export function useRuleProposals(houseId: string | undefined) {
  return useQuery({
    queryKey: houseKeys.ruleProposals(houseId ?? ''),
    queryFn: () => housesApi.ruleProposals(houseId!),
    enabled: !!houseId,
  });
}

/** Sau mọi thao tác đề xuất: tải lại danh sách đề xuất và chi tiết nhà (nội quy có thể đã đổi). */
function useRefreshRules(houseId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: houseKeys.detail(houseId) });
}

export function useProposeRule(houseId: string) {
  const refresh = useRefreshRules(houseId);
  return useMutation({ mutationFn: (input: RuleProposalInput) => housesApi.proposeRule(houseId, input), onSuccess: refresh });
}

export function useApproveRule(houseId: string) {
  const refresh = useRefreshRules(houseId);
  return useMutation({ mutationFn: (id: string) => housesApi.approveRule(houseId, id), onSettled: refresh });
}

export function useRejectRule(houseId: string) {
  const refresh = useRefreshRules(houseId);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => housesApi.rejectRule(houseId, id, reason),
    onSettled: refresh,
  });
}

export function useWithdrawRule(houseId: string) {
  const refresh = useRefreshRules(houseId);
  return useMutation({ mutationFn: (id: string) => housesApi.withdrawRule(houseId, id), onSettled: refresh });
}
