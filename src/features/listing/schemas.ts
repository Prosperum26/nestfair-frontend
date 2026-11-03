import { z } from 'zod';
import { formatVnd } from '@/lib/format.ts';

/** Giới hạn khớp UpsertListingDto backend (B4) và CHECK trong DB (B1). */
export const MAX_RENT = 50_000_000;
export const MAX_FEE = 10_000_000;
export const MAX_OTHER_FEES = 8;

const otherFeeSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên khoản phí.').max(40, 'Tên khoản phí tối đa 40 ký tự.'),
  // Ô tiền cho phép trống khi đang nhập (null); trống lúc gửi thì báo "Nhập số tiền.".
  amount: z
    .number()
    .int('Số tiền phải là số nguyên VNĐ.')
    .min(0, 'Số tiền không được âm.')
    .max(MAX_FEE, `Mỗi khoản phí tối đa ${formatVnd(MAX_FEE)}.`)
    .nullable()
    .pipe(z.number({ error: 'Nhập số tiền.' })),
});

/** Schema form tin đăng (khớp UpsertListingDto). SĐT bỏ khoảng trắng rồi phải có dạng 0xxxxxxxxx. */
export const listingFormSchema = z.object({
  locationText: z.string().trim().min(3, 'Nhập vị trí, tối thiểu 3 ký tự.').max(120, 'Vị trí tối đa 120 ký tự.'),
  genderWanted: z.enum(['MALE', 'FEMALE', 'ANY'], { error: 'Chọn giới tính cần tìm.' }),
  rentPerMonth: z
    .number()
    .int('Tiền thuê phải là số nguyên VNĐ.')
    .min(1, 'Tiền thuê phải lớn hơn 0.')
    .max(MAX_RENT, `Tiền thuê tối đa ${formatVnd(MAX_RENT)}.`)
    .nullable()
    .pipe(z.number({ error: 'Nhập tiền thuê mỗi người.' })),
  otherFees: z.array(otherFeeSchema).max(MAX_OTHER_FEES, `Tối đa ${MAX_OTHER_FEES} khoản phí khác.`),
  description: z.string().max(1000, 'Mô tả tối đa 1000 ký tự.'),
  roommateExpectations: z.string().max(500, 'Mong muốn tối đa 500 ký tự.'),
  contactPhone: z
    .string()
    .transform((v) => v.replace(/\s+/g, ''))
    .pipe(z.string().regex(/^0\d{9}$/, 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.')),
  showChoreSchedule: z.boolean(),
});

export type ListingFormValues = z.input<typeof listingFormSchema>;
export type ListingFormOutput = z.output<typeof listingFormSchema>;
