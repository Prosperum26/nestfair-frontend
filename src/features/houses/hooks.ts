import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHouseStore } from '@/stores/house-store.ts';
import { type CreateHouseInput, housesApi } from './api.ts';
import { pickCurrentHouse } from './current-house.ts';
import type { HouseDetail } from './types.ts';

export const houseKeys = {
  all: ['houses'] as const,
  detail: (houseId: string) => ['houses', houseId] as const,
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

export function useJoinHouse() {
  const enter = useEnterHouse();
  return useMutation({
    mutationFn: (inviteCode: string) => housesApi.join(inviteCode),
    onSuccess: enter,
  });
}
