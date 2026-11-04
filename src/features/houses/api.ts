import { api } from '@/lib/api.ts';
import type { HouseDetail, HouseSummary } from './types.ts';

export interface CreateHouseInput {
  name: string;
  address?: string;
  maxMembers: number;
}

export interface UpdateHouseInput {
  name?: string;
  /** Chuỗi rỗng để xóa. */
  address?: string;
  maxMembers?: number;
  /** Chuỗi rỗng để xóa. */
  rules?: string;
}

export const housesApi = {
  list: () => api<HouseSummary[]>('/houses'),
  detail: (houseId: string) => api<HouseDetail>(`/houses/${houseId}`),
  create: (body: CreateHouseInput) =>
    api<HouseDetail>('/houses', { method: 'POST', body }),
  join: (inviteCode: string) =>
    api<HouseDetail>('/houses/join', { method: 'POST', body: { inviteCode } }),
  update: (houseId: string, body: UpdateHouseInput) =>
    api<HouseDetail>(`/houses/${houseId}`, { method: 'PATCH', body }),
  regenerateInviteCode: (houseId: string) =>
    api<HouseDetail>(`/houses/${houseId}/invite-code`, { method: 'POST' }),
};
