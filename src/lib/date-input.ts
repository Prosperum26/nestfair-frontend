/** "2026-10-12" → "12/10/2026". Chuỗi không phải ngày ISO giữ nguyên (người dùng đang gõ dở). */
export function isoToVn(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

/** "12/10/2026" (cũng nhận "-" hoặc "."; ngày/tháng 1 chữ số) → "2026-10-12". Chưa đủ dạng thì trả lại đúng chuỗi gõ. */
export function vnToIso(text: string): string {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text.trim());
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : text;
}

/**
 * Tự chèn dấu "/" khi gõ liền chữ số: "12102026" → "12/10/2026"; "12/102" → "12/10/2".
 * Không đụng vào chuỗi người dùng đã tự gõ dấu phân cách ở chỗ khác (vd. "2/3/2026").
 */
export function autoSlash(text: string): string {
  if (/^\d+$/.test(text)) {
    const d = text.slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  }
  const m = /^(\d{1,2}\/)(\d{2})(\d+)$/.exec(text);
  return m ? `${m[1]}${m[2]}/${m[3].slice(0, 4)}` : text;
}
