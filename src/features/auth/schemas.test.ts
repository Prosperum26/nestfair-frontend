import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './schemas.ts';

const valid = {
  fullName: '  Trần Minh Hùng ',
  email: ' Hung.TM@Student.UIT.edu.vn ',
  phone: '0901 234 567',
  password: 'MatKhau123',
  acceptTerms: true,
};

describe('registerSchema', () => {
  it('chuẩn hóa dữ liệu hợp lệ như backend', () => {
    expect(registerSchema.parse(valid)).toEqual({
      fullName: 'Trần Minh Hùng',
      email: 'hung.tm@student.uit.edu.vn',
      phone: '0901234567',
      password: 'MatKhau123',
      acceptTerms: true,
    });
  });

  it.each([
    ['fullName', { fullName: 'A' }, 'Họ và tên cần từ 2 đến 80 ký tự.'],
    ['email', { email: 'abc' }, 'Email không hợp lệ.'],
    ['email', { email: '' }, 'Bạn chưa nhập email.'],
    ['phone', { phone: '12345' }, 'Số điện thoại cần 10 số, bắt đầu bằng 0.'],
    ['password', { password: 'Ab1' }, 'Mật khẩu cần ít nhất 8 ký tự.'],
    ['password', { password: 'matkhau123' }, 'Mật khẩu cần có chữ hoa.'],
    ['password', { password: 'MatKhauDai' }, 'Mật khẩu cần có số.'],
    ['acceptTerms', { acceptTerms: false }, 'Bạn cần đồng ý với điều khoản để tiếp tục.'],
  ])('%s sai: %o', (path, over, message) => {
    const result = registerSchema.safeParse({ ...valid, ...over });
    expect(result.success).toBe(false);
    const issue = result.error!.issues.find((i) => i.path[0] === path);
    expect(issue?.message).toBe(message);
  });
});

describe('loginSchema', () => {
  it('thiếu mật khẩu', () => {
    const result = loginSchema.safeParse({ email: 'a@b.vn', password: '', rememberMe: true });
    expect(result.error?.issues[0].message).toBe('Bạn chưa nhập mật khẩu.');
  });
});
