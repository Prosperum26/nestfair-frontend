import { describe, expect, it } from 'vitest';
import { statusChip } from './status.ts';

describe('statusChip', () => {
  it('map status DB sang nhãn tiếng Việt và tone theo AGENTS.md mục 9', () => {
    expect(statusChip('TODO')).toMatchObject({ label: 'Chờ làm', tone: 'neutral' });
    expect(statusChip('PENDING_VERIFY')).toMatchObject({ label: 'Chờ duyệt', tone: 'yellow' });
    expect(statusChip('DONE')).toMatchObject({ label: 'Hoàn thành', tone: 'mint' });
    expect(statusChip('MISSED')).toMatchObject({ label: 'Quá hạn', tone: 'tom' });
    expect(statusChip('REJECTED')).toMatchObject({ label: 'Làm lại', tone: 'tom' });
    expect(statusChip('CANCELLED')).toMatchObject({ label: 'Đã hủy', tone: 'neutral' });
    expect(statusChip('UNASSIGNED')).toMatchObject({ label: 'Chưa có người', tone: 'yellow' });
  });
});
