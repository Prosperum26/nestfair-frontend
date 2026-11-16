import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Assignment } from '../types.ts';
import { UnclaimedList } from './TodayPanel.tsx';

const slot = (over: Partial<Assignment> = {}): Assignment =>
  ({ id: 'a1', choreTitle: 'Mang rác xuống', status: 'UNASSIGNED', assigneeUserId: null, dueAt: '2026-11-15T14:00:00.000Z', ...over }) as Assignment;
const now = new Date('2026-11-15T03:00:00Z');

describe('UnclaimedList', () => {
  it('không có ca thì không hiện gì', () => {
    expect(renderToStaticMarkup(<UnclaimedList items={[]} busyId={null} onClaim={vi.fn()} now={now} />)).toBe('');
  });

  it('hiện tên việc, nút Nhận việc và giờ hạn', () => {
    const html = renderToStaticMarkup(<UnclaimedList items={[slot()]} busyId={null} onClaim={vi.fn()} now={now} />);
    expect(html).toContain('Việc chưa có người nhận');
    expect(html).toContain('Mang rác xuống');
    expect(html).toContain('Nhận việc');
  });

  it('đang nhận một ca thì khóa nút', () => {
    const html = renderToStaticMarkup(<UnclaimedList items={[slot(), slot({ id: 'a2' })]} busyId="a1" onClaim={vi.fn()} now={now} />);
    expect(html.match(/disabled/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
