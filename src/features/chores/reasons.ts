import type { ScheduleMeta } from './types.ts';

/**
 * Số tuần rào còn áp dụng sau khi nới. Khớp backend: các cấp nhìn lại `unique([W−1, 1, 0])` (giảm dần, ≤ W−1);
 * cấp `relaxLevel` nhìn lại `lookback` tuần liền trước nghĩa là rào còn `lookback + 1` tuần ("1 tuần" = không còn rào).
 */
export function relaxedWeeks(fenceWeeksApplied: number, relaxLevel: number): number {
  const levels = [...new Set([fenceWeeksApplied - 1, 1, 0])].filter((l) => l <= fenceWeeksApplied - 1).sort((a, b) => b - a);
  return (levels[relaxLevel] ?? 0) + 1;
}

type Ctx = Pick<ScheduleMeta, 'fenceWeeksApplied' | 'relaxLevel'>;

/** Câu tiếng Việt cho mã lý do (đặc tả bảng 4.7). Mã lạ → null để không hiện chuỗi thô. */
export function reasonText(code: string, ctx?: Ctx): string | null {
  switch (code) {
    case 'SOLO_HOUSE':
      return 'Nhà chỉ có 1 người nên chưa thể xoay vòng. Mời thêm bạn nhé!';
    case 'SMALL_HOUSE':
      return 'Nhà có 2 người nên rào công bằng áp dụng là: không làm cùng việc 2 tuần liên tiếp.';
    case 'FEW_OPTIONS':
      return `Số việc/người khiến không thể giữ đủ rào, hệ thống đã nới xuống ${ctx ? relaxedWeeks(ctx.fenceWeeksApplied, ctx.relaxLevel) : 1} tuần.`;
    case 'NO_SOLUTION_MIN_VIOLATION':
      return 'Không có cách xếp thỏa rào; đã chọn phương án ít lặp nhất.';
    case 'PINNED_OVERRIDE':
      return 'Ca làm bù được ưu tiên nên vượt rào.';
    case 'MEMBER_ABSENT':
      return 'Có thành viên vắng nên được bỏ qua ở những ngày vắng.';
    case 'NEW_MEMBER':
      return 'Có thành viên mới vào, tải khởi điểm tính theo trung bình nhà.';
    case 'HOUSE_BREAK':
      return 'Cả nhà vắng nên không có ca trong khoảng này.';
    case 'NO_ELIGIBLE_MEMBERS':
      return 'Không còn ai đủ điều kiện, lịch tuần này để trống.';
    case 'NO_CHORES':
      return 'Chưa có việc nhà nào đang bật.';
    case 'DAILY_CAP_EXCEEDED':
      return 'Có người phải nhận nhiều ca trong một ngày vì không còn ai khác.';
    default:
      return null;
  }
}

/** Danh sách câu lý do của một lịch (bỏ mã lạ). */
export function reasonsFor(meta: Pick<ScheduleMeta, 'reasons' | 'fenceWeeksApplied' | 'relaxLevel'>): string[] {
  return meta.reasons.map((r) => reasonText(r, meta)).filter((t): t is string => t !== null);
}
