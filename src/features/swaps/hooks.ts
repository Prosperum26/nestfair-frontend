import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { debtApi, swapApi, type CreateSwapBody, type EscalateBody } from './api.ts';
import { swapKeys } from './keys.ts';
import { invalidateSwapData } from './realtime.ts';
import type { Compensation, DebtScope, OptionType, SwapScope } from './types.ts';

/** Ứng viên đổi ca / nhờ trực dùm cho một ca (kèm lý do không chọn được và cảnh báo). */
export function useSwapOptions(houseId: string | undefined, assignmentId: string | undefined, type: OptionType, compensation: Compensation, enabled: boolean) {
  return useQuery({
    queryKey: swapKeys.options(houseId ?? '', assignmentId ?? '', type, compensation),
    queryFn: () => swapApi.options(assignmentId!, type, type === 'COVER' ? compensation : undefined),
    enabled: !!houseId && !!assignmentId && enabled,
    // Ứng viên đổi theo từng lần mở modal: không dùng bản cũ.
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSwapList(houseId: string | undefined, scope: SwapScope, enabled = true) {
  return useQuery({
    queryKey: swapKeys.list(houseId ?? '', scope),
    queryFn: () => swapApi.list(houseId!, scope),
    enabled: !!houseId && enabled,
  });
}

export function useSwapSummary(houseId: string | undefined) {
  return useQuery({ queryKey: swapKeys.summary(houseId ?? ''), queryFn: () => swapApi.summary(houseId!), enabled: !!houseId });
}

/** Sổ nợ ca đã gom theo cặp có hướng (server gom, client chỉ hiển thị). */
export function useDebts(houseId: string | undefined, scope: DebtScope, enabled = true) {
  return useQuery({
    queryKey: swapKeys.debtList(houseId ?? '', scope),
    queryFn: () => debtApi.list(houseId!, scope),
    enabled: !!houseId && enabled,
  });
}

export function usePaybackOptions(houseId: string | undefined, debtId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: swapKeys.paybackOptions(houseId ?? '', debtId ?? ''),
    queryFn: () => debtApi.paybackOptions(debtId!),
    enabled: !!houseId && !!debtId && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Idempotency-Key cho một lần thao tác. Bấm lại / retry mạng dùng lại cùng key (không gửi hai lần);
 * `renew()` sau khi thao tác xong hoặc khi người dùng đổi nội dung (key mới cho lựa chọn mới).
 */
export function useIdempotencyKey(): { current: () => string; renew: () => void } {
  const ref = useRef<string | null>(null);
  const current = useCallback(() => (ref.current ??= crypto.randomUUID()), []);
  const renew = useCallback(() => {
    ref.current = null;
  }, []);
  return { current, renew };
}

/** Mọi mutation đổi ca / nợ ca xong (kể cả lỗi, vì trạng thái có thể đã đổi) đều tải lại yêu cầu, sổ nợ và lịch. */
function useSwapMutation<V, R>(houseId: string | undefined, fn: (v: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSettled: () => {
      if (houseId) invalidateSwapData(queryClient, houseId);
    },
  });
}

export const useCreateSwap = (houseId: string | undefined) =>
  useSwapMutation(houseId, ({ body, key }: { body: CreateSwapBody; key: string }) => swapApi.create(houseId!, body, key));
export const useAcceptSwap = (houseId: string | undefined) => useSwapMutation(houseId, ({ swapId, key }: { swapId: string; key: string }) => swapApi.accept(swapId, key));
export const useRejectSwap = (houseId: string | undefined) => useSwapMutation(houseId, ({ swapId, reason }: { swapId: string; reason?: string }) => swapApi.reject(swapId, reason));
export const useCancelSwap = (houseId: string | undefined) => useSwapMutation(houseId, (swapId: string) => swapApi.cancel(swapId));
export const useEscalateSwap = (houseId: string | undefined) =>
  useSwapMutation(houseId, ({ swapId, body, key }: { swapId: string; body: EscalateBody; key: string }) => swapApi.escalate(swapId, body, key));
export const usePickPayback = (houseId: string | undefined) =>
  useSwapMutation(houseId, ({ debtId, assignmentId, key }: { debtId: string; assignmentId: string; key: string }) => debtApi.payback(debtId, assignmentId, key));
export const useForgiveDebt = (houseId: string | undefined) => useSwapMutation(houseId, (debtId: string) => debtApi.forgive(debtId));
