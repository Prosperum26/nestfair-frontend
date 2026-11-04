import { z } from 'zod';

// Khớp UpdateProfileDto / ChangePasswordDto ở backend để báo lỗi ngay trên form.
const PHONE_MESSAGE = 'Số điện thoại cần 10 số, bắt đầu bằng 0.';
const FULL_NAME_MESSAGE = 'Họ và tên cần từ 2 đến 80 ký tự.';
const ACCOUNT_MESSAGE = 'Số tài khoản cần 6–19 chữ số.';

const stripSpaces = (v: string) => v.replace(/\s+/g, '');

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, FULL_NAME_MESSAGE).max(80, FULL_NAME_MESSAGE),
  /** Để trống = xóa số điện thoại. */
  phone: z
    .string()
    .transform(stripSpaces)
    .pipe(z.string().refine((v) => v === '' || /^0\d{9}$/.test(v), PHONE_MESSAGE)),
});

/** Ngân hàng và STK đi theo cặp: cùng có hoặc cùng trống (backend trả 400 nếu lệch). */
export const bankSchema = z
  .object({
    bankBin: z.string(),
    bankAccount: z
      .string()
      .transform(stripSpaces)
      .pipe(z.string().refine((v) => v === '' || /^\d{6,19}$/.test(v), ACCOUNT_MESSAGE)),
  })
  .superRefine((v, ctx) => {
    if (v.bankBin && !v.bankAccount) ctx.addIssue({ code: 'custom', path: ['bankAccount'], message: 'Hãy nhập số tài khoản.' });
    if (!v.bankBin && v.bankAccount) ctx.addIssue({ code: 'custom', path: ['bankBin'], message: 'Hãy chọn ngân hàng.' });
  });

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Bạn chưa nhập mật khẩu hiện tại.'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu cần ít nhất 8 ký tự.')
      .max(72, 'Mật khẩu tối đa 72 ký tự.')
      .regex(/[A-Z]/, 'Mật khẩu cần có chữ hoa.')
      .regex(/\d/, 'Mật khẩu cần có số.'),
    confirm: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.confirm !== v.newPassword) ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'Mật khẩu nhập lại chưa khớp.' });
    else if (v.newPassword === v.currentPassword) {
      ctx.addIssue({ code: 'custom', path: ['newPassword'], message: 'Mật khẩu mới cần khác mật khẩu hiện tại.' });
    }
  });

export type ProfileFormValues = z.output<typeof profileSchema>;
export type BankFormValues = z.output<typeof bankSchema>;
export type PasswordFormValues = z.output<typeof passwordSchema>;

/** Chuỗi rỗng → null (backend hiểu null là xóa); giá trị còn lại giữ nguyên. */
export function toProfilePayload<T extends Record<string, string>>(values: T): { [K in keyof T]: string | null } {
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])) as { [K in keyof T]: string | null };
}
