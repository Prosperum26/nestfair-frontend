import { z } from 'zod';
import { CATEGORIES } from '@/features/expenses/category.ts';
import { isRealDate, MAX_AMOUNT } from '@/features/expenses/schemas.ts';
import { spentAtOf } from '@/features/expenses/split-preview.ts';
import type { ExpenseCategory, ExpenseInput } from '@/features/expenses/types.ts';
import { formatVnd } from '@/lib/format.ts';
import { previewItemized } from './itemized.ts';
import type { ReceiptDraft } from './types.ts';

/** Khớp ArrayMaxSize của `items` trong CreateExpenseDto backend. */
const MAX_ITEMS = 100;

export interface ReviewItem {
  name: string;
  quantity: number;
  /** null khi người dùng đang xóa ô để nhập lại. */
  lineTotal: number | null;
  userIds: string[];
  uncertain: boolean;
  note: string | null;
}

export interface ReviewFormValues {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  totalAmount: number | null;
  payerId: string;
  category: ExpenseCategory;
  note: string;
  items: ReviewItem[];
}

/** Bản nháp OCR → giá trị ban đầu của form xác nhận. Món AI không chắc để trống người dùng: buộc phải chọn (D11). */
export function draftToReviewValues(
  draft: ReceiptDraft,
  ctx: { memberIds: readonly string[]; meId: string | undefined; today: string },
): ReviewFormValues {
  const { memberIds, meId, today } = ctx;
  // Form không cho ngày tương lai, nên ngày thiếu hoặc vượt hôm nay thì lấy hôm nay.
  const date = draft.purchasedAt && draft.purchasedAt <= today ? draft.purchasedAt : today;
  return {
    title: draft.merchant,
    date,
    totalAmount: draft.total,
    payerId: meId && memberIds.includes(meId) ? meId : (memberIds[0] ?? ''),
    category: 'FOOD',
    note: '',
    items: draft.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
      userIds: i.uncertain ? [] : [...memberIds],
      uncertain: i.uncertain,
      note: i.note,
    })),
  };
}

/** Ô nào tô vàng từ cảnh báo của bản nháp (món dùng thẳng `item.uncertain`). */
export function receiptFlags(draft: ReceiptDraft): { total: boolean; date: boolean } {
  const has = (...codes: string[]) => draft.warnings.some((w) => codes.includes(w.code));
  return { total: has('ITEMS_TOTAL_MISMATCH'), date: has('DATE_MISSING', 'DATE_IN_FUTURE') };
}

const money = (label: string) =>
  z
    .number({ error: `Nhập ${label}.` })
    .int(`${label[0].toUpperCase()}${label.slice(1)} phải là số nguyên VNĐ.`)
    .min(1, `${label[0].toUpperCase()}${label.slice(1)} phải lớn hơn 0.`)
    .max(MAX_AMOUNT, `${label[0].toUpperCase()}${label.slice(1)} tối đa ${formatVnd(MAX_AMOUNT)}.`)
    .nullable()
    .refine((v) => v !== null, `Nhập ${label}.`);

/**
 * Schema form xác nhận hóa đơn quét. Cần `today` (YYYY-MM-DD) để chặn ngày tương lai. Tổng các món lệch tổng
 * hóa đơn vẫn hợp lệ: phần chênh (giảm giá, phí) được chia theo tỷ lệ tiền món, y như backend.
 */
export function receiptReviewSchema(memberIds: readonly string[], today: string) {
  return z
    .object({
      title: z.string().trim().min(1, 'Nhập tên cửa hàng hoặc khoản chi.').max(80, 'Tên khoản chi tối đa 80 ký tự.'),
      date: z
        .string()
        .refine(isRealDate, 'Nhập ngày đúng dạng dd/mm/yyyy.')
        .refine((d) => d <= today, 'Ngày chi không được ở tương lai.'),
      totalAmount: money('số tiền'),
      payerId: z.string().min(1, 'Chọn người trả.'),
      category: z.enum(CATEGORIES),
      note: z.string().max(200, 'Ghi chú tối đa 200 ký tự.'),
      items: z
        .array(
          z.object({
            name: z.string().trim().min(1, 'Nhập tên món.').max(80, 'Tên món tối đa 80 ký tự.'),
            quantity: z.number(),
            lineTotal: money('tiền món'),
            userIds: z.array(z.string()).min(1, 'Chọn ít nhất một người cho món này.'),
            uncertain: z.boolean(),
            note: z.string().nullable(),
          }),
        )
        .min(1, 'Cần ít nhất một món.')
        .max(MAX_ITEMS, `Tối đa ${MAX_ITEMS} món.`),
    })
    .superRefine((v, ctx) => {
      if (!v.totalAmount || v.items.length === 0) return;
      const p = previewItemized({ total: v.totalAmount, items: v.items, memberIds });
      // Lỗi từng món đã báo ở chỗ của nó; chỉ báo chung khi mọi món hợp lệ mà tổng vẫn không khớp.
      if (!p.ok && p.invalid.length === 0 && p.unassigned.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['items'], message: 'Tổng các phần chưa khớp tổng hóa đơn.' });
      }
    });
}

type ValidatedReview = Omit<ReviewFormValues, 'totalAmount' | 'items'> & {
  totalAmount: number;
  items: (Omit<ReviewItem, 'lineTotal'> & { lineTotal: number })[];
};

/** Giá trị form (đã qua schema) → body `POST /expenses` kiểu ITEMIZED. `scanId = null` khi engine OCR không đi qua backend. */
/**
 * Món của màn xem lại → danh sách món đi theo sang form chia kiểu khác (chỉ tên + tiền):
 * bỏ món chưa có tên hoặc tiền không dương, cắt khoảng trắng, tối đa 100 món như backend.
 */
export function prefillItemsFromReview(items: readonly { name: string; lineTotal: number | null }[]): { name: string; lineTotal: number }[] {
  return items
    .map((i) => ({ name: i.name.trim(), lineTotal: i.lineTotal }))
    .filter((i): i is { name: string; lineTotal: number } => i.name !== '' && i.lineTotal !== null && i.lineTotal > 0)
    .slice(0, 100);
}

export function toItemizedInput(v: ValidatedReview, scan: { scanId: string | null; imageUrl: string }): ExpenseInput {
  return {
    title: v.title.trim(),
    category: v.category,
    totalAmount: v.totalAmount,
    payerId: v.payerId,
    splitType: 'ITEMIZED',
    items: v.items.map((i) => ({ name: i.name.trim(), lineTotal: i.lineTotal, userIds: i.userIds })),
    ...(scan.scanId ? { receiptScanId: scan.scanId } : {}),
    spentAt: spentAtOf(v.date),
    note: v.note.trim() || null,
    receiptImageUrl: scan.imageUrl,
  };
}
