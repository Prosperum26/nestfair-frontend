/**
 * Chỉ nhận đường dẫn nội bộ (bắt đầu bằng một `/`) để chuyển hướng sau đăng nhập.
 * Chặn `//host`, `/\host` (trình duyệt hiểu là host khác), scheme lạ và ký tự điều khiển.
 */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 512) return null;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}
