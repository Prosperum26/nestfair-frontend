const WEEKDAYS = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];

const pad = (n: number) => n.toString().padStart(2, '0');

/** "06.10.2026" (Design.md mục 6). */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Overline đầu trang: "THỨ BA · 06.10.2026". */
export function formatDayOverline(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} · ${formatDate(date)}`;
}

/** "Chào buổi sáng / trưa / chiều / tối" theo giờ máy. */
export function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 13) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/** Tên gọi = từ cuối của họ tên: "Trần Minh Hùng" -> "Hùng". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/).at(-1) ?? fullName;
}
