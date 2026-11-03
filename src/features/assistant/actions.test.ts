import { describe, expect, it } from 'vitest';
import type { AssistantAction, AssistantMessageDto } from './types.ts';
import { actionRequest } from './actions.ts';

/** Mốc now cố định: 2026-10-25T03:00:00Z = 10:00 Chủ nhật 25.10.2026 giờ VN. */
const NOW = new Date('2026-10-25T03:00:00Z');

const message = (over: Partial<AssistantMessageDto> = {}): AssistantMessageDto => ({
  id: 'm1',
  threadId: 't1',
  role: 'ASSISTANT',
  content: 'Mùi WC thường do ống thoát sàn bị khô…',
  category: 'INCIDENT',
  actions: [],
  createdAt: '2026-10-25T12:02:00+07:00',
  ...over,
});

const reminderAction = (over: Partial<AssistantAction> = {}): AssistantAction => ({
  type: 'CREATE_REMINDER',
  label: 'Nhắc mình tối nay 20:00',
  payload: { title: 'Cọ WC (vòng quay)', remindAt: '2026-10-25T20:00:00+07:00' },
  done: false,
  ...over,
});

describe('actionRequest: CREATE_REMINDER', () => {
  it('đủ payload ở tương lai → lời gọi tạo nhắc kèm sourceMessageId + actionIndex chống bấm đúp', () => {
    const msg = message({ actions: [reminderAction()] });
    expect(actionRequest(msg.actions[0], msg, 0, NOW)).toEqual({
      kind: 'create-reminder',
      sourceMessageId: 'm1',
      actionIndex: 0,
      title: 'Cọ WC (vòng quay)',
      remindAt: '2026-10-25T20:00:00+07:00',
    });
  });

  it('payload thiếu title → dùng nhãn nút làm nội dung nhắc', () => {
    const action = reminderAction({ payload: { remindAt: '2026-10-26T08:00:00+07:00' } });
    const out = actionRequest(action, message(), 2, NOW);
    expect(out).toMatchObject({ kind: 'create-reminder', title: 'Nhắc mình tối nay 20:00', actionIndex: 2 });
  });

  it('thiếu remindAt → invalid-time, KHÔNG trả lời gọi API', () => {
    const action = reminderAction({ payload: { title: 'Cọ WC' } });
    expect(actionRequest(action, message(), 0, NOW)).toEqual({ kind: 'invalid-time' });
  });

  it('remindAt đã qua (hoặc đúng now) → invalid-time, không gọi API', () => {
    const past = reminderAction({ payload: { remindAt: '2026-10-24T20:00:00+07:00' } });
    const exactNow = reminderAction({ payload: { remindAt: '2026-10-25T10:00:00+07:00' } });
    expect(actionRequest(past, message(), 0, NOW)).toEqual({ kind: 'invalid-time' });
    expect(actionRequest(exactNow, message(), 0, NOW)).toEqual({ kind: 'invalid-time' });
  });

  it('remindAt không phải ngày giờ (chuỗi rác) → invalid-time, không gọi API', () => {
    const action = reminderAction({ payload: { remindAt: 'tối nay' } });
    expect(actionRequest(action, message(), 0, NOW)).toEqual({ kind: 'invalid-time' });
  });
});

describe('actionRequest: DRAFT_EXPENSE', () => {
  it('chỉ mở form bản nháp với prefill (title + estimatedAmount), không bao giờ trả lời gọi API ghi dữ liệu', () => {
    const action: AssistantAction = {
      type: 'DRAFT_EXPENSE',
      label: 'Ghi khoản mua: Viên tây bồn cầu ~35.000đ',
      payload: { title: 'Viên tây bồn cầu', estimatedAmount: 35000 },
      done: false,
    };
    const out = actionRequest(action, message(), 0, NOW);
    expect(out).toEqual({
      kind: 'open-expense-draft',
      prefill: { title: 'Viên tây bồn cầu', totalAmount: 35000 },
    });
    expect(JSON.stringify(out)).not.toContain('create-reminder');
  });

  it('payload thiếu title → dùng nhãn nút; thiếu estimatedAmount → totalAmount null', () => {
    const action: AssistantAction = { type: 'DRAFT_EXPENSE', label: 'Ghi khoản mua', payload: {}, done: false };
    expect(actionRequest(action, message(), 1, NOW)).toEqual({
      kind: 'open-expense-draft',
      prefill: { title: 'Ghi khoản mua', totalAmount: null },
    });
  });
});

describe('actionRequest: CREATE_ADHOC_TASK', () => {
  it('tạo việc đột xuất chưa mở trong MVP → locked, không gọi API', () => {
    const action: AssistantAction = { type: 'CREATE_ADHOC_TASK', label: 'Tạo việc đột xuất: Cọ WC', payload: {}, done: false };
    expect(actionRequest(action, message(), 0, NOW)).toEqual({ kind: 'locked' });
  });
});
