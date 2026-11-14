import { describe, expect, it } from 'vitest';
import { activityLine, activityTime } from './text.ts';
import type { Activity } from './types.ts';

const a = (type: string, params: Record<string, unknown> = {}, actor: { id: string | null; name: string } = { id: 'u-mai', name: 'Phạm Ngọc Mai' }): Activity => ({
  id: 'x',
  type,
  actorUserId: actor.id,
  actorName: actor.name,
  params,
  createdAt: '2026-10-21T13:15:00.000Z',
});
const hung = { id: 'u-hung', name: 'Trần Minh Hùng' };
const text = (x: Activity, me?: string) => activityLine(x, me).text;

describe('activityLine', () => {
  it('rời nhà và bị trưởng phòng xóa khỏi nhà', () => {
    expect(text(a('member.left', { userId: 'u-mai', name: 'Phạm Ngọc Mai', kicked: false }))).toBe('Mai đã rời nhà');
    const kicked = a('member.left', { userId: 'u-quan', name: 'Nguyễn Minh Quân', kicked: true }, hung);
    expect(text(kicked)).toBe('Hùng đã xóa Quân khỏi nhà');
    expect(text(kicked, 'u-hung')).toBe('Bạn đã xóa Quân khỏi nhà');
  });

  it('check-in dùng tên gọi và ngoặc kép quanh tên việc', () => {
    expect(text(a('chore.submitted', { choreTitle: 'Rửa chén tối' }))).toBe('Mai vừa nộp ảnh “Rửa chén tối”');
  });

  it('người xem là người gây ra / người được nhắc thì thay bằng Bạn / bạn', () => {
    const x = a('chore.verified', { choreTitle: 'Đổ rác', targetUserId: 'u-mai', targetName: 'Phạm Ngọc Mai' }, hung);
    expect(text(x)).toBe('Hùng đã duyệt ca “Đổ rác” của Mai');
    expect(text(x, 'u-mai')).toBe('Hùng đã duyệt ca “Đổ rác” của bạn');
    expect(text(x, 'u-hung')).toBe('Bạn đã duyệt ca “Đổ rác” của Mai');
  });

  it('làm lại không bao giờ kèm lý do', () => {
    const x = a('chore.rejected', { choreTitle: 'Đổ rác', targetName: 'Mai', reason: 'ảnh mờ' }, hung);
    expect(text(x)).toBe('Hùng yêu cầu Mai làm lại ca “Đổ rác”');
  });

  it('bỏ ca: một ca ghi tên việc, nhiều ca ghi số ca', () => {
    expect(text(a('chore.missed', { count: 1, choreTitle: 'Cọ WC' }, { id: 'u-quan', name: 'Quân' }))).toBe('Quân bỏ ca “Cọ WC”');
    expect(text(a('chore.missed', { count: 2, choreTitle: 'Cọ WC' }, { id: 'u-quan', name: 'Quân' }))).toBe('Quân bỏ 2 ca');
  });

  it('lịch tuần do hệ thống / do người tạo / xáo lại', () => {
    expect(text(a('schedule.generated', { weekKey: '2026-W44' }, { id: null, name: 'NestFair' }))).toBe('Lịch tuần W44 đã được tạo');
    expect(text(a('schedule.generated', { weekKey: '2026-W44' }, hung))).toBe('Hùng đã tạo lịch tuần W44');
    expect(text(a('schedule.rerolled', { weekKey: '2026-W44' }, hung))).toBe('Hùng đã xáo lại lịch tuần W44');
  });

  it('nghỉ cả nhà gộp số ca bị hủy; khai vắng hộ người khác', () => {
    expect(text(a('break.created', { startDate: '2026-10-23', endDate: '2026-10-25', cancelled: 9 }, hung))).toBe(
      'Hùng khai nghỉ cả nhà 23.10–25.10 (9 ca bị hủy)',
    );
    expect(text(a('absence.created', { targetUserId: 'u-mai', targetName: 'Mai', startDate: '2026-10-23', endDate: '2026-10-24' }))).toBe(
      'Mai khai vắng 23.10–24.10',
    );
    expect(text(a('absence.created', { targetUserId: 'u-mai', targetName: 'Mai', startDate: '2026-10-23', endDate: '2026-10-23' }, hung))).toBe(
      'Hùng khai vắng cho Mai 23.10',
    );
  });

  it('vòng quay ghi rõ ai tham gia, ai trúng, người quay không tham gia', () => {
    const x = a(
      'wheel.result',
      {
        taskTitle: 'Mua nước bình 20L',
        participantIds: ['u-hung', 'u-mai', 'u-quan'],
        participantNames: ['Trần Minh Hùng', 'Phạm Ngọc Mai', 'Nguyễn Minh Quân'],
        winnerUserId: 'u-quan',
        winnerName: 'Nguyễn Minh Quân',
      },
      { id: 'u-thien', name: 'Lê Đức Thiện' },
    );
    expect(text(x)).toBe('Thiện quay “Mua nước bình 20L” với Hùng, Mai, Quân (Thiện không tham gia) · Quân trúng');
    expect(text(x, 'u-quan')).toBe('Thiện quay “Mua nước bình 20L” với Hùng, Mai, bạn (Thiện không tham gia) · Bạn trúng');
  });

  it('mẫu sẵn cho đổi ca / chi tiêu không ghi số tiền quà', () => {
    expect(text(a('swap.accepted', { choreTitle: 'Lau nhà', targetName: 'Thiện', withGift: true, rewardAmount: 30000 }))).toBe(
      'Mai nhận trực dùm ca “Lau nhà” của Thiện kèm quà',
    );
    expect(text(a('expense.created', { title: 'Bách Hóa Xanh', amount: 245000 }, { id: 't', name: 'Thiện' }))).toBe(
      'Thiện vừa thêm khoản “Bách Hóa Xanh” 245.000đ',
    );
  });

  it('tên quá 24 ký tự bị cắt; loại lạ vẫn có câu mặc định', () => {
    const long = { id: 'z', name: 'Nguyễn Văn Aaaaaaaaaaaaaaaaaaaaaaaaaaaaa' };
    expect(text(a('member.joined', {}, long))).toMatch(/^A{1}a{22}… vừa vào nhà$/);
    expect(text(a('something.new'))).toBe('Mai có hoạt động mới');
  });
});

describe('activityTime', () => {
  it('cùng ngày HH:mm, khác ngày dd.mm HH:mm', () => {
    const at = '2026-10-21T20:15:00+07:00';
    expect(activityTime(at, new Date('2026-10-21T23:00:00+07:00'))).toBe('20:15');
    expect(activityTime(at, new Date('2026-10-22T08:00:00+07:00'))).toBe('21.10 20:15');
  });
});
