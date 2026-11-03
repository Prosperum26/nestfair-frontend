export const CONTACT_EMAIL = '24520626@gm.uit.edu.vn';

/** Liên kết mở ứng dụng thư; tiêu đề (nếu có) được mã hóa URL. */
export function contactMailto(subject?: string): string {
  return subject ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` : `mailto:${CONTACT_EMAIL}`;
}
