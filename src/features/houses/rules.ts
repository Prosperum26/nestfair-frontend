/** Tách nội quy thành từng dòng để hiện danh sách đánh số; bỏ số thứ tự người viết gõ tay ("1.", "2)"). */
export function rulesLines(rules: string | null | undefined): string[] {
  if (!rules) return [];
  return rules
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+\s*[.)]\s*/, '').trim())
    .filter(Boolean);
}
