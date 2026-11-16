import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Chore } from '../types.ts';
import { ArchivedChoresView } from './ArchivedChores.tsx';

const chore = (over: Partial<Chore> = {}): Chore => ({
  id: 'c1',
  title: 'Dọn bếp',
  weight: 2,
  frequency: 'DAILY',
  recurrenceDays: [1, 2, 3, 4, 5, 6, 7],
  dueTime: '21:00',
  rotationMode: 'PER_OCCURRENCE',
  occurrenceGap: 1,
  isActive: false,
  archivedAt: '2026-11-15T10:00:00.000Z',
  canPurge: false,
  ...over,
});

const noop = vi.fn();
const view = (props: Partial<React.ComponentProps<typeof ArchivedChoresView>>) =>
  renderToStaticMarkup(<ArchivedChoresView status="ready" chores={[]} busyId={null} onRetry={noop} onRestore={noop} onPurge={noop} {...props} />);

describe('ArchivedChoresView', () => {
  it('hiện skeleton có role status khi đang tải', () => {
    const html = view({ status: 'loading' });
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
  });

  it("hiện EmptyState 'Chưa có việc nào được lưu trữ'", () => {
    expect(view({ chores: [] })).toContain('Chưa có việc nào được lưu trữ');
  });

  it('hiện lỗi và nút thử lại', () => {
    const html = view({ status: 'error', error: 'Mất mạng' });
    expect(html).toContain('Mất mạng');
    expect(html).toContain('Thử lại');
  });

  it('mỗi dòng có Khôi phục; Xóa vĩnh viễn chỉ hiện khi canPurge = true', () => {
    const html = view({ chores: [chore({ id: 'a', title: 'Có thể xóa', canPurge: true }), chore({ id: 'b', title: 'Có lịch sử', canPurge: false })] });
    expect(html.match(/Khôi phục/g)).toHaveLength(2);
    expect(html.match(/Xóa vĩnh viễn/g)).toHaveLength(1);
  });

  it('không hiện dấu hiệu emoji và dùng tên việc', () => {
    const html = view({ chores: [chore()] });
    expect(html).toContain('Dọn bếp');
    expect(html).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
