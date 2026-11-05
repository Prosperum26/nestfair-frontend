import { api } from '@/lib/api.ts';
import type { KickInput, LeavePreview, RemoveMemberResult } from './types.ts';

export const membershipApi = {
  preview: (houseId: string, userId: string) => api<LeavePreview>(`/houses/${houseId}/members/${userId}/leave-preview`),
  leave: (houseId: string, newAdminUserId?: string) =>
    api<RemoveMemberResult>(`/houses/${houseId}/leave`, { method: 'POST', body: { newAdminUserId } }),
  kick: (houseId: string, userId: string, body: KickInput) =>
    api<RemoveMemberResult>(`/houses/${houseId}/members/${userId}`, { method: 'DELETE', body }),
  transferAdmin: (houseId: string, userId: string) =>
    api<{ adminUserId: string }>(`/houses/${houseId}/transfer-admin`, { method: 'POST', body: { userId } }),
};
