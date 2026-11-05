import { z } from 'zod';
import type { Tone } from '@/components/ui/tones.ts';
import { ApiError } from '@/lib/api.ts';
import type { RuleProposal, RuleProposalKind, RuleProposalStatus } from './types.ts';

const MAX = 200;
const optionalText = z
  .string()
  .trim()
  .max(MAX, `Lý do tối đa ${MAX} ký tự.`)
  .transform((v) => v || undefined);

/** Form đề xuất; khớp CreateRuleProposalDto backend. REMOVE bỏ `content` khi gửi. */
export const ruleProposalSchema = z
  .object({
    kind: z.enum(['ADD', 'EDIT', 'REMOVE']),
    targetText: z.string().optional(),
    content: z.string().trim().max(MAX, `Nội dung tối đa ${MAX} ký tự.`),
    reason: optionalText,
  })
  .superRefine((v, ctx) => {
    if (v.kind === 'REMOVE') return;
    if (!v.content) {
      ctx.addIssue({
        code: 'custom',
        path: ['content'],
        message: v.kind === 'ADD' ? 'Nhập nội dung điều muốn thêm.' : 'Nhập nội dung mới cho điều này.',
      });
    } else if (v.kind === 'EDIT' && v.content === v.targetText) {
      ctx.addIssue({ code: 'custom', path: ['content'], message: 'Nội dung mới giống hệt điều cũ.' });
    }
  })
  .transform((v) => ({ ...v, content: v.kind === 'REMOVE' ? undefined : v.content }));

export type RuleProposalFormInput = z.input<typeof ruleProposalSchema>;
export type RuleProposalInput = z.output<typeof ruleProposalSchema>;

const TITLES: Record<RuleProposalKind, string> = {
  ADD: 'Thêm điều mới',
  EDIT: 'Sửa một điều',
  REMOVE: 'Bỏ một điều',
};

export const proposalTitle = (p: Pick<RuleProposal, 'kind'>) => TITLES[p.kind];

const STATUS: Record<RuleProposalStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Chờ duyệt', tone: 'yellow' },
  APPROVED: { label: 'Đã áp dụng', tone: 'mint' },
  REJECTED: { label: 'Bị từ chối', tone: 'tom' },
  WITHDRAWN: { label: 'Đã rút lại', tone: 'neutral' },
};

export const proposalStatusChip = (status: RuleProposalStatus) => STATUS[status];

/** Lỗi nghiệp vụ (có mã) đã có câu tiếng Việt từ backend; lỗi khác dùng câu chung. */
export function proposalErrorMessage(error: unknown): string {
  if (error instanceof ApiError && (error.code || error.statusCode < 500)) return error.message;
  return 'Không gửi được, thử lại sau ít phút.';
}
