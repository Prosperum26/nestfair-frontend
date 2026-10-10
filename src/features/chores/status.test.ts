import { describe, expect, it } from 'vitest';
import { STATUS_ORDER, statusChip } from './status.ts';

describe('statusChip', () => {
  it('map status DB sang nhãn tiếng Việt và tone theo AGENTS.md mục 9', () => {
    expect(statusChip('TODO')).toMatchObject({ label: 'Chờ làm', tone: 'neutral' });
    expect(statusChip('PENDING_VERIFY')).toMatchObject({ label: 'Chờ duyệt', tone: 'yellow' });
    expect(statusChip('DONE')).toMatchObject({ label: 'Hoàn thành', tone: 'mint' });
    expect(statusChip('MISSED')).toMatchObject({ label: 'Quá hạn', tone: 'tom' });
    expect(statusChip('REJECTED')).toMatchObject({ label: 'Làm lại', tone: 'tom' });
  });

  it('có đủ 5 status trong thứ tự hiển thị', () => {
    expect([...STATUS_ORDER].sort()).toEqual(['DONE', 'MISSED', 'PENDING_VERIFY', 'REJECTED', 'TODO']);
  });
});
