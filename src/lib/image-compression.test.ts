import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: unknown[][] = [];
vi.mock('browser-image-compression', () => ({
  default: (...args: unknown[]) => {
    calls.push(args);
    return Promise.resolve(args[0]);
  },
}));

const { compressImage } = await import('./image-compression.ts');

describe('compressImage', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('web worker nạp thư viện từ chính site (CSP script-src self), không từ CDN', async () => {
    const file = new File([new Uint8Array([1])], 'a.jpg', { type: 'image/jpeg' });
    await compressImage(file, { maxSizeMB: 1, useWebWorker: true });
    const options = calls[0][1] as { libURL?: string; maxSizeMB?: number };
    expect(options.maxSizeMB).toBe(1);
    expect(options.libURL).toMatch(/^\/.*browser-image-compression.*\.js$/);
    expect(options.libURL).not.toMatch(/jsdelivr|^https?:/);
  });
});
