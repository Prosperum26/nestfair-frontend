import { z } from 'zod';

const REWARD_MESSAGE = 'Quà từ 1.000đ đến 500.000đ.';

/** Quà: số nguyên VNĐ, bội của 1.000, trong [1.000, 500.000] (R-SWAP-14). */
export const rewardAmountSchema = z
  .number({ error: REWARD_MESSAGE })
  .refine((n) => Number.isInteger(n) && n >= 1000 && n <= 500_000 && n % 1000 === 0, REWARD_MESSAGE);

const trimmed = (max: number, message: string) => z.string().trim().max(max, message);
const note200 = trimmed(200, 'Lời nhắn tối đa 200 ký tự.');
const reason200 = trimmed(200, 'Lý do tối đa 200 ký tự.');
const rewardNote100 = trimmed(100, 'Ghi chú quà tối đa 100 ký tự.');
const warnings = z.array(z.enum(['WEIGHT_GAP', 'FENCE_REPEAT', 'OVER_DAILY_CAP', 'CONSECUTIVE_DAY', 'DUE_SOON'])).optional();

/** Body POST /houses/:id/swaps với type EXCHANGE. */
export const createExchangeSchema = z.object({
  fromAssignmentId: z.string().min(1, 'Hãy chọn ca của bạn.'),
  toAssignmentId: z.string().min(1, 'Hãy chọn ca muốn đổi.'),
  note: note200.optional(),
  reason: reason200.optional(),
  acknowledgedWarnings: warnings,
});

/** Body POST /houses/:id/swaps với type COVER. Tiền chỉ đi với quà; làm bù không có tiền. */
export const createCoverSchema = z
  .object({
    fromAssignmentId: z.string().min(1, 'Hãy chọn ca của bạn.'),
    compensation: z.enum(['PAYBACK', 'GIFT']),
    /** Bỏ trống = đăng lên Chợ ca. */
    targetMemberId: z.string().min(1).optional(),
    rewardNote: rewardNote100.optional(),
    rewardAmount: rewardAmountSchema.optional(),
    note: note200.optional(),
    reason: reason200.optional(),
    acknowledgedWarnings: warnings,
  })
  .superRefine((v, ctx) => {
    if (v.compensation === 'PAYBACK' && v.rewardAmount !== undefined) {
      ctx.addIssue({ code: 'custom', path: ['rewardAmount'], message: 'Làm bù thì không kèm tiền.' });
    }
  });

/** Body POST /swaps/:id/escalate. ADD_REWARD cần số tiền hợp lệ hoặc ghi chú quà mới. */
export const escalateSchema = z
  .object({
    action: z.enum(['ADD_REWARD', 'RESEND', 'SELF']),
    rewardAmount: rewardAmountSchema.optional(),
    rewardNote: rewardNote100.optional(),
    targetMemberId: z.string().min(1).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.action === 'ADD_REWARD' && v.rewardAmount === undefined && !v.rewardNote) {
      ctx.addIssue({ code: 'custom', path: ['rewardAmount'], message: 'Hãy nhập số tiền quà hoặc một lời nhắn mới.' });
    }
  });

export type CreateExchangeValues = z.output<typeof createExchangeSchema>;
export type CreateCoverValues = z.output<typeof createCoverSchema>;
export type EscalateValues = z.output<typeof escalateSchema>;
