import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NotificationDto } from '../types.ts';
import { NotificationPanel } from './NotificationPanel.tsx';

const NOW = new Date('2026-11-11T05:00:00.000Z');
const n = (id: string, type: string, params: Record<string, unknown>, readAt: string | null = null): NotificationDto =>
  ({ id, houseId: 'h1', type, params, readAt, createdAt: '2026-11-11T02:30:00.000Z' }) as NotificationDto;

const items = [
  n('a', 'EXPENSE_CREATED', { expenseId: 'e1', title: 'Tiền điện', payerName: 'Quân', share: 210_000 }),
  n('b', 'DEBT_PAID', { settlementId: 's1', fromName: 'Hùng', amount: 170_000 }, '2026-11-11T03:00:00.000Z'),
  n('c', 'REMINDER_DUE', { reminderId: 'r1', title: 'Đổ rác tối nay' }),
];

const render = (props: Partial<Parameters<typeof NotificationPanel>[0]>) =>
  renderToStaticMarkup(
    <NotificationPanel status="ready" items={[]} unreadCount={0} now={NOW} onOpen={() => {}} onReadAll={() => {}} onRetry={() => {}} {...props} />,
  );

describe('NotificationPanel', () => {
  it('đang tải: khung skeleton, chưa có dòng nào', () => {
    const html = render({ status: 'loading' });
    expect(html).toContain('animate-pulse');
    expect(html).not.toContain('<li');
  });

  it('lỗi: câu báo lỗi và nút Thử lại', () => {
    const html = render({ status: 'error' });
    expect(html).toContain('Không tải được thông báo');
    expect(html).toContain('Thử lại');
  });

  it('trống: lời nhắn thân thiện, không có nút đánh dấu', () => {
    const html = render({});
    expect(html).toContain('Chưa có thông báo nào');
    expect(html).not.toContain('Đánh dấu đã đọc');
  });

  it('có thông báo: ghép câu đúng, tiền định dạng 210.000đ bằng font mono, giờ theo nhà', () => {
    const html = render({ items, unreadCount: 2 });
    expect(html.match(/<li/g)).toHaveLength(3);
    expect(html).toContain('Quân trả “Tiền điện”');
    expect(html).toMatch(/font-mono[^>]*>210\.000đ/);
    expect(html).toContain('Hùng báo đã chuyển tiền cho bạn');
    expect(html).toMatch(/font-mono[^>]*>170\.000đ/);
    expect(html).toContain('Đổ rác tối nay');
    // 02:30Z = 09:30 giờ nhà, cùng ngày nên chỉ hiện giờ.
    expect(html).toContain('09:30');
  });

  it('dòng chưa đọc có chấm và nhãn cho trình đọc màn hình; dòng đã đọc thì không', () => {
    const html = render({ items, unreadCount: 2 });
    expect(html.match(/Chưa đọc/g)).toHaveLength(2);
    expect(html.match(/bg-tom-v/g)).toHaveLength(2);
  });

  it('còn tin chưa đọc thì có nút Đánh dấu đã đọc tất cả; hết thì ẩn', () => {
    expect(render({ items, unreadCount: 2 })).toContain('Đánh dấu đã đọc tất cả');
    expect(render({ items: [items[1]], unreadCount: 0 })).not.toContain('Đánh dấu đã đọc tất cả');
  });

  it('loại thông báo lạ bị bỏ qua, các dòng khác vẫn hiện; toàn loại lạ thì coi như trống', () => {
    const odd = n('z', 'SOMETHING_NEW', {});
    expect(render({ items: [odd, items[2]], unreadCount: 1 }).match(/<li/g)).toHaveLength(1);
    expect(render({ items: [odd], unreadCount: 1 })).toContain('Chưa có thông báo nào');
  });

  it('không có emoji trong bảng', () => {
    expect(render({ items, unreadCount: 2 })).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
