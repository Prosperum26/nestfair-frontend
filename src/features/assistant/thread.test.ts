import { describe, expect, it } from 'vitest';
import type { AssistantCategory, AssistantMessageDto } from './types.ts';
import { categoryLabel, dayDividerLabel, groupMessagesByDay, reminderConfirmation } from './thread.ts';

/**
 * Mốc now cố định: 2026-10-25T03:00:00Z = 10:00 Chủ nhật 25.10.2026 giờ VN.
 * Thời điểm dựng bằng chuỗi UTC/offset tuyệt đối nên test không phụ thuộc múi giờ máy.
 */
const NOW = new Date('2026-10-25T03:00:00Z');

const message = (over: Partial<AssistantMessageDto>): AssistantMessageDto => ({
  id: 'm1',
  threadId: 't1',
  role: 'USER',
  content: 'WC phòng mình có mùi quá, xử lý sao?',
  category: null,
  actions: [],
  createdAt: '2026-10-25T12:02:00+07:00', // 19:02 giờ VN 25.10
  ...over,
});

describe('groupMessagesByDay', () => {
  it('tất cả tin cùng ngày hôm nay → một nhóm, vạch "HÔM NAY · 25.10" theo giờ VN', () => {
    const groups = groupMessagesByDay([message({ id: 'a' }), message({ id: 'b', role: 'ASSISTANT' })], NOW);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('HÔM NAY · 25.10');
    expect(groups[0].messages.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('tin 23:59 và 00:00 hôm sau giờ VN → khác nhóm dù cách nhau 1 phút UTC', () => {
    const groups = groupMessagesByDay(
      [
        message({ id: 'late', createdAt: '2026-10-25T16:59:00Z' }), // 23:59 VN 25.10
        message({ id: 'early', createdAt: '2026-10-25T17:00:00Z' }), // 00:00 VN 26.10
      ],
      NOW,
    );
    expect(groups.map((g) => g.label)).toEqual(['HÔM NAY · 25.10', '26.10.2026']);
    expect(groups[1].messages.map((m) => m.id)).toEqual(['early']);
  });

  it('ngày khác hôm nay → vạch dd.mm.yyyy, kể cả cùng năm', () => {
    const groups = groupMessagesByDay([message({ createdAt: '2026-10-06T12:02:00+07:00' })], NOW);
    expect(groups[0].label).toBe('06.10.2026');
  });

  it('giữ thứ tự cũ → mới, nhóm theo ngày liền kề (trang cũ hơn đứng trước)', () => {
    const groups = groupMessagesByDay(
      [
        message({ id: 'old', createdAt: '2026-10-20T10:00:00+07:00' }),
        message({ id: 'yesterday', createdAt: '2026-10-24T22:00:00+07:00' }),
        message({ id: 'today', createdAt: '2026-10-25T09:00:00+07:00' }),
      ],
      NOW,
    );
    expect(groups.map((g) => g.label)).toEqual(['20.10.2026', '24.10.2026', 'HÔM NAY · 25.10']);
    expect(groups.map((g) => g.messages[0].id)).toEqual(['old', 'yesterday', 'today']);
  });

  it('danh sách rỗng → không có nhóm nào', () => {
    expect(groupMessagesByDay([], NOW)).toEqual([]);
  });

  it('không đổi mảng nhập vào', () => {
    const list = [message({ id: 'a' })];
    groupMessagesByDay(list, NOW);
    expect(list).toHaveLength(1);
  });
});

describe('dayDividerLabel', () => {
  it('hôm nay → "HÔM NAY · dd.mm", ngày khác → dd.mm.yyyy', () => {
    expect(dayDividerLabel(new Date('2026-10-25T16:59:00Z'), NOW)).toBe('HÔM NAY · 25.10');
    expect(dayDividerLabel(new Date('2026-10-06T12:02:00+07:00'), NOW)).toBe('06.10.2026');
  });
});

describe('reminderConfirmation', () => {
  it('xác nhận tạo nhắc theo ảnh 19: "hôm nay 20:00", "ngày mai 08:00"', () => {
    expect(reminderConfirmation({ time: '20:00', day: 'Hôm nay' })).toBe('hôm nay 20:00');
    expect(reminderConfirmation({ time: '08:00', day: 'Ngày mai' })).toBe('ngày mai 08:00');
  });

  it('ngày khác năm nay hoặc khác năm → giữ nhãn ngày, thêm giờ sau dấu phẩy', () => {
    expect(reminderConfirmation({ time: '09:30', day: 'T5 08.10' })).toBe('T5 08.10, 09:30');
    expect(reminderConfirmation({ time: '00:30', day: '21.01.2027' })).toBe('21.01.2027, 00:30');
  });
});

describe('categoryLabel', () => {
  it('nhãn tiếng Việt theo ảnh 19', () => {
    expect(categoryLabel('INCIDENT' satisfies AssistantCategory)).toBe('Sự cố trong phòng');
    expect(categoryLabel('TIP')).toBe('Mẹo');
    expect(categoryLabel('EMOTIONAL')).toBe('Ứng xử');
    expect(categoryLabel('REMINDER')).toBe('Nhắc nhở');
  });

  it('OTHER hoặc chưa phân loại (null) → "Khác"', () => {
    expect(categoryLabel('OTHER')).toBe('Khác');
    expect(categoryLabel(null)).toBe('Khác');
  });
});
