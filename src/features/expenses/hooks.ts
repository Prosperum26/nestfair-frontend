import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '@/features/settlements/api.ts';
import type { SettlementInput } from '@/features/settlements/types.ts';
import { expensesApi } from './api.ts';
import type { ExpenseFilters, ExpenseInput } from './types.ts';

/** Tiền tố theo nhà: invalidate tiền tố là tải lại mọi tháng / bộ lọc đang cache. */
export const ledgerKeys = {
  expenses: (houseId: string) => ['expenses', houseId] as const,
  list: (houseId: string, filters: ExpenseFilters) => ['expenses', houseId, 'list', filters] as const,
  summary: (houseId: string, month: string) => ['expenses', houseId, 'summary', month] as const,
  settlements: (houseId: string) => ['settlements', houseId] as const,
  plan: (houseId: string) => ['settlements', houseId, 'plan'] as const,
  history: (houseId: string, month: string | undefined, scope: 'all' | 'mine') => ['settlements', houseId, 'history', month ?? 'all', scope] as const,
  paymentInfo: (houseId: string, userId: string) => ['settlements', houseId, 'payment-info', userId] as const,
};

export function useExpenses(houseId: string | undefined, filters: ExpenseFilters) {
  return useQuery({
    queryKey: ledgerKeys.list(houseId ?? '', filters),
    queryFn: () => expensesApi.list(houseId!, filters),
    enabled: !!houseId,
    // Đổi tháng / bộ lọc: giữ danh sách cũ trong lúc tải để bảng không nhảy về skeleton.
    placeholderData: keepPreviousData,
  });
}

export function useExpenseSummary(houseId: string | undefined, month: string) {
  return useQuery({
    queryKey: ledgerKeys.summary(houseId ?? '', month),
    queryFn: () => expensesApi.summary(houseId!, month),
    enabled: !!houseId,
    placeholderData: keepPreviousData,
  });
}

export function useSettlementPlan(houseId: string | undefined) {
  return useQuery({ queryKey: ledgerKeys.plan(houseId ?? ''), queryFn: () => settlementsApi.plan(houseId!), enabled: !!houseId });
}

export function useSettlementHistory(houseId: string | undefined, month: string | undefined, scope: 'all' | 'mine') {
  return useQuery({
    queryKey: ledgerKeys.history(houseId ?? '', month, scope),
    queryFn: () => settlementsApi.list(houseId!, { month, scope }),
    enabled: !!houseId,
    placeholderData: keepPreviousData,
  });
}

/** STK đầy đủ của người nhận: chỉ tải khi mở modal VietQR. Thiếu tài khoản thì backend trả 404, không thử lại. */
export function usePaymentInfo(houseId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ledgerKeys.paymentInfo(houseId ?? '', userId ?? ''),
    queryFn: () => settlementsApi.paymentInfo(houseId!, userId!),
    enabled: !!houseId && !!userId,
    retry: false,
  });
}

/** Khoản chi và thanh toán liên quan nhau (số dư, kế hoạch): mọi thay đổi tải lại cả hai. */
export function useInvalidateLedger(houseId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ledgerKeys.expenses(houseId) }),
      queryClient.invalidateQueries({ queryKey: ledgerKeys.settlements(houseId) }),
    ]);
}

export function useCreateExpense(houseId: string) {
  const invalidate = useInvalidateLedger(houseId);
  return useMutation({ mutationFn: (body: ExpenseInput) => expensesApi.create(houseId, body), onSuccess: invalidate });
}

export function useUpdateExpense(houseId: string) {
  const invalidate = useInvalidateLedger(houseId);
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ExpenseInput> }) => expensesApi.update(houseId, id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteExpense(houseId: string) {
  const invalidate = useInvalidateLedger(houseId);
  return useMutation({ mutationFn: (id: string) => expensesApi.remove(houseId, id), onSuccess: invalidate });
}

export function useReportTransfer(houseId: string) {
  const invalidate = useInvalidateLedger(houseId);
  return useMutation({ mutationFn: (body: SettlementInput) => settlementsApi.create(houseId, body), onSuccess: invalidate });
}

export function useConfirmSettlement(houseId: string) {
  const invalidate = useInvalidateLedger(houseId);
  return useMutation({ mutationFn: (id: string) => settlementsApi.confirm(houseId, id), onSettled: invalidate });
}

export function useCancelSettlement(houseId: string) {
  const invalidate = useInvalidateLedger(houseId);
  return useMutation({ mutationFn: (id: string) => settlementsApi.cancel(houseId, id), onSettled: invalidate });
}
