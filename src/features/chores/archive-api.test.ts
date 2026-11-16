import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api.ts';
import { choresApi } from './api.ts';

vi.mock('@/lib/api.ts', () => ({ api: vi.fn() }));

const mocked = vi.mocked(api);
const H = 'house-1';
const C = 'chore-1';

describe('choresApi: lưu trữ việc nhà', () => {
  beforeEach(() => {
    mocked.mockReset();
    mocked.mockResolvedValue(undefined as never);
  });

  it('archiveChore gọi DELETE đúng URL', async () => {
    await choresApi.archiveChore(H, C);
    expect(mocked).toHaveBeenCalledWith(`/houses/${H}/chores/${C}`, { method: 'DELETE' });
  });

  it('restoreChore gọi POST .../restore', async () => {
    await choresApi.restoreChore(H, C);
    expect(mocked).toHaveBeenCalledWith(`/houses/${H}/chores/${C}/restore`, { method: 'POST' });
  });

  it('purgeChore gọi DELETE .../permanent', async () => {
    await choresApi.purgeChore(H, C);
    expect(mocked).toHaveBeenCalledWith(`/houses/${H}/chores/${C}/permanent`, { method: 'DELETE' });
  });

  it('listArchived thêm ?archived=true', async () => {
    await choresApi.listArchived(H);
    expect(mocked).toHaveBeenCalledWith(`/houses/${H}/chores?archived=true`);
  });

  it('claim gọi POST /assignments/:id/claim', async () => {
    await choresApi.claim('a-1');
    expect(mocked).toHaveBeenCalledWith('/assignments/a-1/claim', { method: 'POST' });
  });
});
