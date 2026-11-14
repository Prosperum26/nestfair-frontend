import { ApiError } from '@/lib/api.ts';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';

/** Mã lỗi hồ sơ (users, đổi mật khẩu) → câu tiếng Việt; mã khác dùng chung bảng lỗi upload ảnh / sổ chi. */
const MESSAGES: Record<string, string> = {
  WRONG_PASSWORD: 'Mật khẩu hiện tại chưa đúng.',
  SAME_PASSWORD: 'Mật khẩu mới cần khác mật khẩu hiện tại.',
  PASSWORD_NOT_SET: 'Tài khoản này đăng nhập bằng Google nên chưa có mật khẩu để đổi.',
  AVATAR_REQUIRED: 'Hãy chọn ảnh đại diện.',
};

export function profileErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return ledgerErrorMessage(error);
}
