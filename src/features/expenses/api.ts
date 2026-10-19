import { api } from '@/lib/api.ts';
import type { Expense, ExpenseFilters, ExpenseInput, ExpenseSummary } from './types.ts';

const h = (houseId: string) => `/houses/${houseId}/expenses`;

function query(filters: ExpenseFilters): string {
  const params = new URLSearchParams({ month: filters.month });
  if (filters.payerId) params.set('payerId', filters.payerId);
  if (filters.category) params.set('category', filters.category);
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  return params.toString();
}

export const expensesApi = {
  list: (houseId: string, filters: ExpenseFilters) => api<Expense[]>(`${h(houseId)}?${query(filters)}`),
  summary: (houseId: string, month: string) => api<ExpenseSummary>(`${h(houseId)}/summary?month=${encodeURIComponent(month)}`),
  get: (houseId: string, id: string) => api<Expense>(`${h(houseId)}/${id}`),
  create: (houseId: string, body: ExpenseInput) => api<Expense>(h(houseId), { method: 'POST', body }),
  update: (houseId: string, id: string, body: Partial<ExpenseInput>) => api<Expense>(`${h(houseId)}/${id}`, { method: 'PATCH', body }),
  remove: (houseId: string, id: string) => api<{ ok: true }>(`${h(houseId)}/${id}`, { method: 'DELETE' }),
  uploadReceipt: (houseId: string, photo: Blob, filename: string) => {
    const body = new FormData();
    body.append('photo', photo, filename);
    return api<{ url: string }>(`${h(houseId)}/receipt-image`, { method: 'POST', body });
  },
};
