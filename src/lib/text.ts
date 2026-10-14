/** Bỏ dấu tiếng Việt và viết hoa: "Nguyễn Minh Quân" → "NGUYEN MINH QUAN" (giữ nguyên ký tự khác). */
export function toAsciiUpper(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

/**
 * Tên chủ tài khoản kiểu ngân hàng (khớp backend `toBankAccountName`): bỏ dấu, viết hoa,
 * chỉ chữ/số và một khoảng trắng giữa các từ.
 */
export function toBankAccountName(fullName: string): string {
  return toAsciiUpper(fullName)
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** STK dễ đọc: nhóm 4 chữ số, "0123456789" → "0123 4567 89". */
export function groupAccount(account: string): string {
  return account.replace(/(.{4})(?=.)/g, '$1 ');
}
