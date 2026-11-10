import { z } from 'zod';

const REWARD_MESSAGE = 'Quà từ 1.000đ đến 500.000đ.';

/** Quà: số nguyên VNĐ, bội của 1.000, trong [1.000, 500.000] (R-SWAP-14). */
export const rewardAmountSchema = z
  .number({ error: REWARD_MESSAGE })
  .refine((n) => Number.isInteger(n) && n >= 1000 && n <= 500_000 && n % 1000 === 0, REWARD_MESSAGE);
