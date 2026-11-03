import { z } from 'zod';
import { formatVnd } from '@/lib/format.ts';
import { CATEGORIES } from './category.ts';
import { previewSplit } from './split-preview.ts';

/** Trần một khoản chi, khớp MAX_AMOUNT backend. */
export const MAX_AMOUNT = 1_000_000_000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Ngày thật dạng YYYY-MM-DD (loại 2026-02-30). */
export const isRealDate = (d: string) => {
  if (!DATE_ONLY.test(d)) return false;
  const date = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === d;
};

/**
 * Schema form thêm/sửa khoản chi (khớp CreateExpenseDto backend). Cần danh sách thành viên theo thứ tự
 * để kiểm tra tổng các phần y như backend, và `today` (YYYY-MM-DD) để chặn ngày tương lai.
 */
export function expenseFormSchema(memberIds: readonly string[], today: string) {
  return z
    .object({
      title: z.string().trim().min(1, 'Nhập tên khoản chi.').max(80, 'Tên khoản chi tối đa 80 ký tự.'),
      date: z
        .string()
        .refine(isRealDate, 'Nhập ngày đúng dạng dd/mm/yyyy.')
        .refine((d) => d <= today, 'Ngày chi không được ở tương lai.'),
      totalAmount: z
        .number({ error: 'Nhập số tiền.' })
        .int('Số tiền phải là số nguyên VNĐ.')
        .min(1, 'Số tiền phải lớn hơn 0.')
        .max(MAX_AMOUNT, `Số tiền tối đa ${formatVnd(MAX_AMOUNT)}.`)
        .nullable()
        .refine((v) => v !== null, 'Nhập số tiền.'),
      payerId: z.string().min(1, 'Chọn người trả.'),
      category: z.enum(CATEGORIES),
      splitType: z.enum(['EQUAL', 'CUSTOM', 'EXACT']),
      participants: z.array(z.string()),
      exact: z.record(z.string(), z.number().int().min(0).nullable()),
      note: z.string().max(200, 'Ghi chú tối đa 200 ký tự.'),
      receiptImageUrl: z.string().nullable(),
    })
    .superRefine((v, ctx) => {
      if (v.splitType !== 'EQUAL' && v.participants.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['participants'], message: 'Chọn ít nhất một người cùng chịu khoản chi.' });
        return;
      }
      if (v.splitType === 'EXACT' && v.totalAmount) {
        const { diff } = previewSplit({ ...v, total: v.totalAmount, memberIds });
        if (diff !== 0) {
          ctx.addIssue({ code: 'custom', path: ['exact'], message: 'Tổng các phần phải bằng số tiền hóa đơn thì mới lưu được.' });
        }
      }
    });
}
