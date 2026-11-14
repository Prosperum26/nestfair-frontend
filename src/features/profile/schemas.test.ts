import { describe, expect, it } from 'vitest';
import { bankSchema, passwordSchema, profileSchema, toProfilePayload } from './schemas.ts';

describe('profileSchema', () => {
  it('chấp nhận họ tên và SĐT có khoảng trắng, chuẩn hóa về 10 số liền', () => {
    const r = profileSchema.parse({ fullName: '  Trần Minh Hùng ', phone: '0901 234 567' });
    expect(r).toEqual({ fullName: 'Trần Minh Hùng', phone: '0901234567' });
  });

  it('SĐT để trống thì hợp lệ (gửi null để xóa)', () => {
    const r = profileSchema.parse({ fullName: 'Hùng', phone: '' });
    expect(r.phone).toBe('');
    expect(toProfilePayload(r)).toEqual({ fullName: 'Hùng', phone: null });
  });

  it.each([
    ['họ tên quá ngắn', { fullName: 'H', phone: '' }, 'Họ và tên cần từ 2 đến 80 ký tự.'],
    ['họ tên quá dài', { fullName: 'a'.repeat(81), phone: '' }, 'Họ và tên cần từ 2 đến 80 ký tự.'],
    ['SĐT thiếu số', { fullName: 'Hùng', phone: '090123456' }, 'Số điện thoại cần 10 số, bắt đầu bằng 0.'],
    ['SĐT không bắt đầu bằng 0', { fullName: 'Hùng', phone: '1901234567' }, 'Số điện thoại cần 10 số, bắt đầu bằng 0.'],
  ])('%s thì báo lỗi tiếng Việt', (_, input, message) => {
    const r = profileSchema.safeParse(input);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe(message);
  });
});

describe('bankSchema', () => {
  it('cả hai để trống thì hợp lệ và gửi null cả hai (xóa tài khoản)', () => {
    const r = bankSchema.parse({ bankBin: '', bankAccount: '' });
    expect(toProfilePayload(r)).toEqual({ bankBin: null, bankAccount: null });
  });

  it('gỡ khoảng trắng trong STK', () => {
    const r = bankSchema.parse({ bankBin: '970407', bankAccount: '1903 6688 0123' });
    expect(r).toEqual({ bankBin: '970407', bankAccount: '190366880123' });
  });

  it('chọn ngân hàng mà thiếu STK thì lỗi ở ô STK', () => {
    const r = bankSchema.safeParse({ bankBin: '970407', bankAccount: '' });
    expect(r.error?.issues[0]).toMatchObject({ path: ['bankAccount'], message: 'Hãy nhập số tài khoản.' });
  });

  it('nhập STK mà chưa chọn ngân hàng thì lỗi ở ô ngân hàng', () => {
    const r = bankSchema.safeParse({ bankBin: '', bankAccount: '190366880123' });
    expect(r.error?.issues[0]).toMatchObject({ path: ['bankBin'], message: 'Hãy chọn ngân hàng.' });
  });

  it.each(['12345', '12a456789', '1'.repeat(20)])('STK "%s" sai định dạng', (acc) => {
    const r = bankSchema.safeParse({ bankBin: '970407', bankAccount: acc });
    expect(r.error?.issues[0]).toMatchObject({ path: ['bankAccount'], message: 'Số tài khoản cần 6–19 chữ số.' });
  });
});

describe('passwordSchema', () => {
  const ok = { currentPassword: 'MatKhauCu1', newPassword: 'MatKhauMoi2', confirm: 'MatKhauMoi2' };

  it('hợp lệ', () => {
    expect(passwordSchema.safeParse(ok).success).toBe(true);
  });

  it.each([
    ['thiếu mật khẩu hiện tại', { ...ok, currentPassword: '' }, 'currentPassword', 'Bạn chưa nhập mật khẩu hiện tại.'],
    ['mật khẩu mới yếu (không chữ hoa)', { ...ok, newPassword: 'matkhaumoi2', confirm: 'matkhaumoi2' }, 'newPassword', 'Mật khẩu cần có chữ hoa.'],
    ['mật khẩu mới ngắn', { ...ok, newPassword: 'Ab1', confirm: 'Ab1' }, 'newPassword', 'Mật khẩu cần ít nhất 8 ký tự.'],
    ['nhập lại không khớp', { ...ok, confirm: 'KhacHan123' }, 'confirm', 'Mật khẩu nhập lại chưa khớp.'],
    ['trùng mật khẩu cũ', { ...ok, newPassword: 'MatKhauCu1', confirm: 'MatKhauCu1' }, 'newPassword', 'Mật khẩu mới cần khác mật khẩu hiện tại.'],
  ])('%s', (_, input, path, message) => {
    const r = passwordSchema.safeParse(input);
    expect(r.error?.issues[0]).toMatchObject({ path: [path], message });
  });
});
