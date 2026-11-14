import { describe, expect, it, vi } from 'vitest';
import { RESYNC, type RealtimeHandler } from '@/features/realtime/hub.ts';
import { bindChoreRealtime, CHORE_EVENTS, createChangeHandler, SCHEDULE_CHANGE_EVENTS } from './realtime.ts';

/** subscribe giả: lưu handler để test tự bắn sự kiện. */
function fakeSubscribe() {
  const handlers = new Map<string, Set<RealtimeHandler>>();
  const subscribe = (event: string, handler: RealtimeHandler) => {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
    return () => handlers.get(event)!.delete(handler);
  };
  const fire = (event: string) =>
    handlers.get(event)?.forEach((h) => h({ eventId: 'e', type: event, houseId: 'h1', occurredAt: '', actor: null, payload: {} }));
  const count = () => [...handlers.values()].reduce((n, s) => n + s.size, 0);
  return { subscribe, fire, count };
}

describe('bindChoreRealtime', () => {
  it('đủ 6 event việc nhà, kết quả / hủy vòng quay và nối lại làm tải lại; event khác thì không', () => {
    expect([...CHORE_EVENTS].sort()).toEqual([
      'chore:cancelled',
      'chore:missed',
      'chore:reassigned',
      'chore:shuffled',
      'chore:submitted',
      'chore:verified',
    ]);
    const { subscribe, fire } = fakeSubscribe();
    const onChange = vi.fn();
    bindChoreRealtime(subscribe, onChange);
    for (const ev of CHORE_EVENTS) fire(ev);
    fire('wheel:result');
    fire('wheel:voided');
    fire(RESYNC);
    expect(onChange).toHaveBeenCalledTimes(9);
    fire('expense:new');
    fire('wheel:spinning');
    expect(onChange).toHaveBeenCalledTimes(9);
  });

  it('hủy bind gỡ hết handler', () => {
    const { subscribe, fire, count } = fakeSubscribe();
    const onChange = vi.fn();
    const unbind = bindChoreRealtime(subscribe, onChange);
    expect(count()).toBe(SCHEDULE_CHANGE_EVENTS.length);
    unbind();
    expect(count()).toBe(0);
    fire('chore:shuffled');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('createChangeHandler', () => {
  it('không mở modal: tải lại ngay', () => {
    const invalidate = vi.fn();
    const markStale = vi.fn();
    createChangeHandler({ isModalOpen: () => false, invalidate, markStale })();
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(markStale).not.toHaveBeenCalled();
  });

  it('đang mở modal: KHÔNG tải lại (tránh đóng/đổi modal đột ngột), chỉ đánh dấu cần tải lại', () => {
    const invalidate = vi.fn();
    const markStale = vi.fn();
    createChangeHandler({ isModalOpen: () => true, invalidate, markStale })();
    expect(invalidate).not.toHaveBeenCalled();
    expect(markStale).toHaveBeenCalledTimes(1);
  });

  it('đọc trạng thái modal tại thời điểm có sự kiện (không chốt lúc tạo)', () => {
    let open = false;
    const invalidate = vi.fn();
    const markStale = vi.fn();
    const handle = createChangeHandler({ isModalOpen: () => open, invalidate, markStale });
    handle();
    open = true;
    handle();
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(markStale).toHaveBeenCalledTimes(1);
  });
});
