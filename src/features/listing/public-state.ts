import { ApiError } from '@/lib/api.ts';
import { formatDate } from '@/lib/date.ts';
import type { OtherFee, PublicListing, UtilitiesSummary } from './types.ts';

export type PublicViewState = 'loading' | 'error' | 'notfound' | 'full' | 'closed' | 'open';

/**
 * Trạng thái hiển thị của trang công khai. Còn dữ liệu cũ thì ưu tiên dữ liệu (làm tươi lỗi không được
 * làm trang nháy sang màn lỗi); 404 là kết quả đúng của slug sai / tin tạm ẩn, không phải lỗi mạng.
 */
export function publicViewState({
  error,
  data,
}: {
  isLoading: boolean;
  error: unknown;
  data: PublicListing | undefined;
}): PublicViewState {
  if (data) {
    if (data.status === 'OPEN') return 'open';
    return data.closeReason === 'FULL' ? 'full' : 'closed';
  }
  if (error) return error instanceof ApiError && error.statusCode === 404 ? 'notfound' : 'error';
  // Chưa có dữ liệu và chưa có lỗi (đang tải, hoặc truy vấn chờ slug): vẫn là khung chờ.
  return 'loading';
}

/** "Đã gồm tiền thuê, điện nước trung bình, wifi và gửi xe." (chưa có dữ liệu điện nước thì nói rõ là chưa gồm). */
export function priceNote({ utilities, otherFees }: { utilities: UtilitiesSummary | null; otherFees: readonly OtherFee[] }): string {
  const parts = ['tiền thuê', ...(utilities ? ['điện nước trung bình'] : []), ...otherFees.map((f) => f.name.trim().toLowerCase())];
  const joined = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} và ${parts[parts.length - 1]}` : parts[0];
  return `Đã gồm ${joined}.${utilities ? '' : ' Chưa gồm điện nước vì nhà chưa có dữ liệu.'}`;
}

/** "ĐĂNG 04.10.2026"; chưa có ngày đăng thì null. */
export function publishedOverline(publishedAt: string | null): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  return Number.isNaN(date.getTime()) ? null : `ĐĂNG ${formatDate(date)}`;
}
