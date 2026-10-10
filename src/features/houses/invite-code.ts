export const INVITE_CODE_LENGTH = 6;

/** Link mời: mở ra trang onboarding với mã điền sẵn (chưa đăng nhập thì đăng nhập xong quay lại). */
export function inviteLink(code: string, origin: string = window.location.origin): string {
  return `${origin}/onboarding?code=${encodeURIComponent(code)}`;
}

/** Chỉ giữ chữ và số, in hoa, tối đa 6 ký tự (dán "k7m 2qz" vẫn ra "K7M2QZ"). */
export function sanitizeInviteCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, INVITE_CODE_LENGTH);
}
