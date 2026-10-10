import { api } from '@/lib/api.ts';
import type { Assignment, Chore, ShuffleResult, VerifyDecision } from './types.ts';

export interface ChoreInput {
  title: string;
  weight: number;
}

export const choresApi = {
  listChores: (houseId: string, includeInactive = false) =>
    api<Chore[]>(`/houses/${houseId}/chores${includeInactive ? '?includeInactive=true' : ''}`),
  createChore: (houseId: string, body: ChoreInput) =>
    api<Chore>(`/houses/${houseId}/chores`, { method: 'POST', body }),
  updateChore: (houseId: string, choreId: string, body: Partial<ChoreInput> & { isActive?: boolean }) =>
    api<Chore>(`/houses/${houseId}/chores/${choreId}`, { method: 'PATCH', body }),

  listAssignments: (houseId: string, weekKey: string) =>
    api<Assignment[]>(`/houses/${houseId}/assignments?weekKey=${encodeURIComponent(weekKey)}`),
  shuffle: (houseId: string, weekKey: string) =>
    api<ShuffleResult>(`/houses/${houseId}/assignments/shuffle`, { method: 'POST', body: { weekKey } }),

  checkin: (assignmentId: string, photo: Blob, filename: string) => {
    const body = new FormData();
    body.append('photo', photo, filename);
    return api<Assignment>(`/assignments/${assignmentId}/checkin`, { method: 'POST', body });
  },
  verify: (assignmentId: string, body: { decision: VerifyDecision; reason?: string }) =>
    api<Assignment>(`/assignments/${assignmentId}/verify`, { method: 'PATCH', body }),
};
