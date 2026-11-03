/** SĐT lưu dạng 0xxxxxxxxx (L6); bỏ khoảng trắng phòng khi nhận chuỗi chưa chuẩn hóa. */
const digitsOf = (phone: string) => phone.replace(/\s+/g, '');

export const zaloLink = (phone: string) => `https://zalo.me/${digitsOf(phone)}`;

export const telLink = (phone: string) => `tel:${digitsOf(phone)}`;

/** "0901234567" -> "0901 234 567". Không đủ 10 số thì hiện nguyên. */
export function displayPhone(phone: string): string {
  const p = digitsOf(phone);
  return /^\d{10}$/.test(p) ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : phone;
}
