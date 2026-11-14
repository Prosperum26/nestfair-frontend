import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bindHouseEvents, type SocketLike } from '@/lib/realtime.ts';
import { getSocket } from '@/lib/socket.ts';
import { ledgerKeys } from './hooks.ts';

/** Event sổ chi & thanh toán do backend phát vào room nhà (README backend, Issue #9). */
export const LEDGER_EVENTS = [
  'expense:new',
  'expense:updated',
  'expense:deleted',
  'settlement:requested',
  'settlement:cancelled',
  'debt:settled',
] as const;

/** Bạn cùng phòng ghi khoản chi / báo chuyển / xác nhận: tải lại sổ chi và kế hoạch thanh toán. */
export function useLedgerRealtime(houseId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!houseId) return;
    return bindHouseEvents(getSocket() as unknown as SocketLike, houseId, LEDGER_EVENTS, () => {
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.expenses(houseId) });
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.settlements(houseId) });
    });
  }, [houseId, queryClient]);
}
