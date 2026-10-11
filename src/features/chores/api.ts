import { api } from '@/lib/api.ts';
import type {
  Absence,
  AssignmentStatus,
  Assignment,
  AuditLog,
  Chore,
  ChoreFrequency,
  ChoreSettings,
  HouseBreak,
  OverrideAction,
  PreviewResult,
  RotationMode,
  ShuffleResult,
  VerifyDecision,
  WeekView,
} from './types.ts';

export interface ChoreInput {
  title: string;
  weight: number;
  frequency: ChoreFrequency;
  recurrenceDays?: number[];
  dueTime?: string;
  rotationMode?: RotationMode;
  occurrenceGap?: number;
}

export interface DateRangeInput {
  startDate: string;
  endDate: string;
  reason?: string;
}

const h = (houseId: string) => `/houses/${houseId}`;

export const choresApi = {
  listChores: (houseId: string, includeInactive = false) =>
    api<Chore[]>(`${h(houseId)}/chores${includeInactive ? '?includeInactive=true' : ''}`),
  createChore: (houseId: string, body: ChoreInput) => api<Chore>(`${h(houseId)}/chores`, { method: 'POST', body }),
  updateChore: (houseId: string, choreId: string, body: Partial<ChoreInput> & { isActive?: boolean }) =>
    api<Chore>(`${h(houseId)}/chores/${choreId}`, { method: 'PATCH', body }),

  weekView: (houseId: string, week: string) => api<WeekView>(`${h(houseId)}/assignments?week=${encodeURIComponent(week)}`),
  preview: (houseId: string, weekKey: string) => api<PreviewResult>(`${h(houseId)}/schedules/preview`, { method: 'POST', body: { weekKey } }),
  shuffle: (houseId: string, weekKey: string, mode: 'CREATE' | 'REROLL') =>
    api<ShuffleResult>(`${h(houseId)}/assignments/shuffle`, { method: 'POST', body: { weekKey, mode } }),

  checkin: (assignmentId: string, photo: Blob, filename: string, idempotencyKey: string) => {
    const body = new FormData();
    body.append('photo', photo, filename);
    return api<Assignment>(`/assignments/${assignmentId}/checkin`, { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } });
  },
  verify: (assignmentId: string, body: { decision: VerifyDecision; reason?: string }) =>
    api<Assignment>(`/assignments/${assignmentId}/verify`, { method: 'PATCH', body }),
  appeal: (assignmentId: string) => api<Assignment>(`/assignments/${assignmentId}/appeal`, { method: 'POST', body: {} }),
  override: (assignmentId: string, body: { action: OverrideAction; reason: string; userId?: string }) =>
    api<Assignment>(`/assignments/${assignmentId}/override`, { method: 'PATCH', body }),

  listAbsences: (houseId: string) => api<Absence[]>(`${h(houseId)}/absences`),
  createAbsence: (houseId: string, body: DateRangeInput & { userId?: string }) => api<Absence>(`${h(houseId)}/absences`, { method: 'POST', body }),
  deleteAbsence: (houseId: string, id: string) => api<{ ok: true }>(`${h(houseId)}/absences/${id}`, { method: 'DELETE' }),

  listBreaks: (houseId: string) => api<HouseBreak[]>(`${h(houseId)}/breaks`),
  createBreak: (houseId: string, body: DateRangeInput) => api<HouseBreak>(`${h(houseId)}/breaks`, { method: 'POST', body }),
  deleteBreak: (houseId: string, id: string) => api<{ ok: true }>(`${h(houseId)}/breaks/${id}`, { method: 'DELETE' }),

  getSettings: (houseId: string) => api<ChoreSettings>(`${h(houseId)}/chore-settings`),
  updateSettings: (houseId: string, body: Partial<ChoreSettings>) => api<ChoreSettings>(`${h(houseId)}/chore-settings`, { method: 'PATCH', body }),

  audit: (houseId: string, week?: string) => api<AuditLog[]>(`${h(houseId)}/chore-audit${week ? `?week=${encodeURIComponent(week)}` : ''}`),
};

export type { AssignmentStatus };
