import { describe, expect, it } from 'vitest';
import { shuffleState } from './shuffle-state.ts';
import type { ScheduleMeta } from './types.ts';

const meta = (over: Partial<ScheduleMeta> = {}): ScheduleMeta => ({
  id: 's1',
  weekKey: '2026-W42',
  weekStart: '2026-10-12',
  status: 'PUBLISHED',
  relaxed: false,
  relaxLevel: 0,
  reasons: [],
  fenceWeeksApplied: 3,
  rerollCount: 0,
  seed: 123,
  generatedBy: 'CRON',
  attempts: 1,
  ...over,
});

const base = { isAdmin: true, inRange: true, hasActivity: false };

describe('shuffleState', () => {
  it('chưa có lịch trong khoảng cho phép: ai cũng thấy "Tạo lịch tuần này"', () => {
    for (const isAdmin of [true, false]) {
      expect(shuffleState({ ...base, isAdmin, schedule: null })).toMatchObject({ kind: 'CREATE', label: 'Tạo lịch tuần này', enabled: true });
    }
  });

  it('lịch EMPTY (vừa thêm việc) cũng cho tạo lại', () => {
    expect(shuffleState({ ...base, schedule: meta({ status: 'EMPTY' }) })).toMatchObject({ kind: 'CREATE', enabled: true });
  });

  it('tuần ngoài khoảng cho phép (quá khứ / quá xa) thì ẩn', () => {
    expect(shuffleState({ ...base, inRange: false, schedule: null })).toEqual({ kind: 'HIDDEN' });
    expect(shuffleState({ ...base, inRange: false, schedule: meta() })).toEqual({ kind: 'HIDDEN' });
  });

  it('đã có lịch: Admin thấy "Xáo lại (còn N lần)", thành viên thường không thấy', () => {
    expect(shuffleState({ ...base, schedule: meta() })).toMatchObject({ kind: 'REROLL', label: 'Xáo lại (còn 2 lần)', enabled: true });
    expect(shuffleState({ ...base, schedule: meta({ rerollCount: 1 }) })).toMatchObject({ label: 'Xáo lại (còn 1 lần)', enabled: true });
    expect(shuffleState({ ...base, isAdmin: false, schedule: meta() })).toEqual({ kind: 'HIDDEN' });
  });

  it('hết lượt: vô hiệu kèm lý do', () => {
    const s = shuffleState({ ...base, schedule: meta({ rerollCount: 2 }) });
    expect(s).toMatchObject({ kind: 'REROLL', enabled: false });
    expect(s.kind === 'HIDDEN' ? '' : s.tooltip).toContain('tối đa 2 lần');
  });

  it('tuần đã bắt đầu (LOCKED): vô hiệu, gợi ý dùng đổi ca / can thiệp từng ca', () => {
    const s = shuffleState({ ...base, schedule: meta({ status: 'LOCKED' }) });
    expect(s).toMatchObject({ kind: 'REROLL', enabled: false });
    expect(s.kind === 'HIDDEN' ? '' : s.tooltip).toContain('đã khóa');
  });

  it('đã có ca nộp/duyệt: vô hiệu kèm lý do', () => {
    const s = shuffleState({ ...base, hasActivity: true, schedule: meta() });
    expect(s).toMatchObject({ kind: 'REROLL', enabled: false });
    expect(s.kind === 'HIDDEN' ? '' : s.tooltip).toContain('nộp hoặc duyệt');
  });
});
