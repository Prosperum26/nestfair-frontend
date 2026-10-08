import { z } from 'zod';

// Khớp RegisterDto / LoginDto ở backend để báo lỗi ngay trên form.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Bạn chưa nhập email.')
  .pipe(z.email('Email không hợp lệ.'));

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ và tên cần từ 2 đến 80 ký tự.')
    .max(80, 'Họ và tên cần từ 2 đến 80 ký tự.'),
  email,
  phone: z
    .string()
    .transform((v) => v.replace(/\s+/g, ''))
    .pipe(z.string().regex(/^0\d{9}$/, 'Số điện thoại cần 10 số, bắt đầu bằng 0.')),
  password: z
    .string()
    .min(8, 'Mật khẩu cần ít nhất 8 ký tự.')
    .max(72, 'Mật khẩu tối đa 72 ký tự.')
    .regex(/[A-Z]/, 'Mật khẩu cần có chữ hoa.')
    .regex(/\d/, 'Mật khẩu cần có số.'),
  acceptTerms: z.boolean().refine((v) => v, 'Bạn cần đồng ý với điều khoản để tiếp tục.'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Bạn chưa nhập mật khẩu.'),
  rememberMe: z.boolean(),
});

export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
export type LoginFormValues = z.output<typeof loginSchema>;
