import { api } from '@/lib/api.ts';
import type { HouseDetail, HouseSummary } from './types.ts';

export interface CreateHouseInput {
  name: string;
  address?: string;
  maxMembers: number;
}

export const housesApi = {
  list: () => api<HouseSummary[]>('/houses'),
  detail: (houseId: string) => api<HouseDetail>(`/houses/${houseId}`),
  create: (body: CreateHouseInput) =>
    api<HouseDetail>('/houses', { method: 'POST', body }),
  join: (inviteCode: string) =>
    api<HouseDetail>('/houses/join', { method: 'POST', body: { inviteCode } }),
  regenerateInviteCode: (houseId: string) =>
    api<HouseDetail>(`/houses/${houseId}/invite-code`, { method: 'POST' }),
};
