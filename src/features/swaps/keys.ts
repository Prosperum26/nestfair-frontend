import type { Compensation, DebtScope, OptionType, SwapScope } from './types.ts';

/** Khóa truy vấn của đổi ca. Tiền tố `swaps` / `chore-debts` theo nhà: invalidate một lần là tải lại hết. */
export const swapKeys = {
  all: (houseId: string) => ['swaps', houseId] as const,
  list: (houseId: string, scope: SwapScope) => ['swaps', houseId, 'list', scope] as const,
  summary: (houseId: string) => ['swaps', houseId, 'summary'] as const,
  options: (houseId: string, assignmentId: string, type: OptionType, compensation: Compensation = 'GIFT') =>
    ['swaps', houseId, 'options', assignmentId, type, compensation] as const,
  debts: (houseId: string) => ['chore-debts', houseId] as const,
  debtList: (houseId: string, scope: DebtScope) => ['chore-debts', houseId, 'list', scope] as const,
  paybackOptions: (houseId: string, debtId: string) => ['chore-debts', houseId, 'payback-options', debtId] as const,
};
