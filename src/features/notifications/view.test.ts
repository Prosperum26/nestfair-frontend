import { describe, expect, it } from 'vitest';
import type { NotificationDto } from './types.ts';
import { applyRead, NOTIFICATION_EVENTS, notificationView } from './view.ts';

const base = { id: 'n1', houseId: 'h1', readAt: null, createdAt: '2026-11-11T08:00:00.000Z' };
const of = (type: string, params: Record<string, unknown>) => ({ ...base, type, params }) as NotificationDto;

describe('notificationView', () => {
  it('khoản chi mới: ai thêm khoản gì, phần của bạn bao nhiêu, bấm sang Chi tiêu', () => {
    expect(notificationView(of('EXPENSE_CREATED', { expenseId: 'e1', title: 'Tiền điện', payerName: 'Quân', share: 210_000 }))).toEqual({
      kind: 'expense',
      title: 'Quân trả “Tiền điện”',
      detail: 'Phần của bạn',
      amount: 210_000,
      to: '/expenses',
    });
  });

  it('họ tên đầy đủ từ server được rút về tên gọi như các màn khác', () => {
    expect(notificationView(of('EXPENSE_CREATED', { expenseId: 'e1', title: 'Nước uống', payerName: 'Trần Minh Hùng', share: 20_000 }))?.title).toBe('Hùng trả “Nước uống”');
    expect(notificationView(of('DEBT_PAID', { settlementId: 's1', fromName: 'Lê Thiện', amount: 1000 }))?.title).toBe('Thiện báo đã chuyển tiền cho bạn');
  });

  it('báo đã trả nợ: ai chuyển, bao nhiêu, bấm sang Thanh toán để xác nhận', () => {
    expect(notificationView(of('DEBT_PAID', { settlementId: 's1', fromName: 'Hùng', amount: 170_000 }))).toEqual({
      kind: 'debt',
      title: 'Hùng báo đã chuyển tiền cho bạn',
      detail: 'Chờ bạn xác nhận',
      amount: 170_000,
      to: '/payments',
    });
  });

  it('nhắc nhở tới giờ: tiêu đề nhắc, không có số tiền, bấm sang Trợ lý', () => {
    expect(notificationView(of('REMINDER_DUE', { reminderId: 'r1', title: 'Đổ rác tối nay' }))).toEqual({
      kind: 'reminder',
      title: 'Đổ rác tối nay',
      detail: 'Nhắc nhở',
      amount: null,
      to: '/assistant',
    });
  });

  it('loại lạ hoặc thiếu dữ liệu thì bỏ qua (null), không ném lỗi', () => {
    expect(notificationView(of('SOMETHING_NEW', {}))).toBeNull();
    expect(notificationView(of('EXPENSE_CREATED', { title: 'Tiền điện' }))).toBeNull();
    expect(notificationView(of('DEBT_PAID', { fromName: 'Hùng', amount: '170000' }))).toBeNull();
    expect(notificationView({ ...base, type: 'REMINDER_DUE', params: null } as unknown as NotificationDto)).toBeNull();
  });

  it('tiền luôn là số nguyên: số lẻ từ server bị coi là dữ liệu sai', () => {
    expect(notificationView(of('DEBT_PAID', { settlementId: 's1', fromName: 'Hùng', amount: 1.5 }))).toBeNull();
  });
});

describe('NOTIFICATION_EVENTS', () => {
  it('tải lại chuông theo các sự kiện socket đã có trong đặc tả, không thêm sự kiện mới', () => {
    expect(NOTIFICATION_EVENTS.house).toEqual(['expense:new', 'settlement:requested']);
    expect(NOTIFICATION_EVENTS.user).toEqual(['reminder:due']);
  });
});

describe('applyRead', () => {
  const list = {
    items: [
      { ...base, id: 'a', type: 'REMINDER_DUE' as const, params: { reminderId: 'r', title: 'A' } },
      { ...base, id: 'b', type: 'REMINDER_DUE' as const, params: { reminderId: 'r', title: 'B' }, readAt: '2026-11-10T00:00:00.000Z' },
      { ...base, id: 'c', type: 'REMINDER_DUE' as const, params: { reminderId: 'r', title: 'C' } },
    ],
    unreadCount: 5,
  };
  const NOW = '2026-11-11T09:00:00.000Z';

  it('đọc một thông báo: chỉ dòng đó đổi, số chưa đọc giảm 1', () => {
    const next = applyRead(list, 'a', NOW);
    expect(next.items.map((n) => n.readAt)).toEqual([NOW, '2026-11-10T00:00:00.000Z', null]);
    expect(next.unreadCount).toBe(4);
    expect(list.items[0].readAt).toBeNull();
  });

  it('thông báo đã đọc rồi hoặc không có trong danh sách: không đổi gì', () => {
    expect(applyRead(list, 'b', NOW)).toEqual(list);
    expect(applyRead(list, 'zzz', NOW)).toEqual(list);
  });

  it('đọc tất cả: mọi dòng chưa đọc có readAt, số chưa đọc về 0, dòng đã đọc giữ thời điểm cũ', () => {
    const next = applyRead(list, 'all', NOW);
    expect(next.items.map((n) => n.readAt)).toEqual([NOW, '2026-11-10T00:00:00.000Z', NOW]);
    expect(next.unreadCount).toBe(0);
  });
});
