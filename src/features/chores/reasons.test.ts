import { describe, expect, it } from 'vitest';
import { reasonsFor, reasonText, relaxedWeeks } from './reasons.ts';

describe('relaxedWeeks', () => {
  it('số tuần rào còn áp dụng sau khi nới', () => {
    expect(relaxedWeeks(3, 0)).toBe(3);
    expect(relaxedWeeks(3, 1)).toBe(2);
    expect(relaxedWeeks(3, 2)).toBe(1);
    expect(relaxedWeeks(2, 1)).toBe(1);
    expect(relaxedWeeks(1, 0)).toBe(1);
  });

  it('vượt quá số cấp (phương án ít lặp nhất) thì coi như không còn rào', () => {
    expect(relaxedWeeks(3, 3)).toBe(1);
  });
});

describe('reasonText', () => {
  it('có câu tiếng Việt cho từng mã trong bảng 4.7', () => {
    expect(reasonText('SOLO_HOUSE')).toBe('Nhà chỉ có 1 người nên chưa thể xoay vòng. Mời thêm bạn nhé!');
    expect(reasonText('SMALL_HOUSE')).toBe('Nhà có 2 người nên rào công bằng áp dụng là: không làm cùng việc 2 tuần liên tiếp.');
    expect(reasonText('NO_SOLUTION_MIN_VIOLATION')).toBe('Không có cách xếp thỏa rào; đã chọn phương án ít lặp nhất.');
    expect(reasonText('PINNED_OVERRIDE')).toBe('Ca làm bù được ưu tiên nên vượt rào.');
    expect(reasonText('HOUSE_BREAK')).toBe('Cả nhà vắng nên không có ca trong khoảng này.');
    expect(reasonText('NO_ELIGIBLE_MEMBERS')).toBe('Không còn ai đủ điều kiện, lịch tuần này để trống.');
    expect(reasonText('NO_CHORES')).toBe('Chưa có việc nhà nào đang bật.');
    expect(reasonText('NEW_MEMBER')).toContain('thành viên mới');
    expect(reasonText('MEMBER_ABSENT')).toContain('vắng');
    expect(reasonText('DAILY_CAP_EXCEEDED')).toContain('nhiều ca trong một ngày');
  });

  it('FEW_OPTIONS nêu đúng số tuần đã nới xuống', () => {
    expect(reasonText('FEW_OPTIONS', { fenceWeeksApplied: 3, relaxLevel: 1 })).toBe(
      'Số việc/người khiến không thể giữ đủ rào, hệ thống đã nới xuống 2 tuần.',
    );
    expect(reasonText('FEW_OPTIONS', { fenceWeeksApplied: 3, relaxLevel: 2 })).toContain('nới xuống 1 tuần');
  });

  it('mã lạ trả null (không hiện chuỗi thô cho người dùng)', () => {
    expect(reasonText('SOMETHING_NEW')).toBeNull();
  });
});

describe('reasonsFor', () => {
  it('chuyển cả danh sách, bỏ mã lạ', () => {
    const out = reasonsFor({ reasons: ['SMALL_HOUSE', 'WAT', 'FEW_OPTIONS'], fenceWeeksApplied: 2, relaxLevel: 1 });
    expect(out).toHaveLength(2);
    expect(out[1]).toContain('nới xuống 1 tuần');
  });
});
