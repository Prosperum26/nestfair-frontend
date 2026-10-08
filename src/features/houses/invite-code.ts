export const INVITE_CODE_LENGTH = 6;

/** Chỉ giữ chữ và số, in hoa, tối đa 6 ký tự (dán "k7m 2qz" vẫn ra "K7M2QZ"). */
export function sanitizeInviteCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, INVITE_CODE_LENGTH);
}
