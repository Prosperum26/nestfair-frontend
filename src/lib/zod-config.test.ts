import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import './zod-config.ts';

describe('cấu hình Zod', () => {
  it('jitless: không thử new Function (CSP script-src self sẽ báo vi phạm eval)', () => {
    expect(z.config().jitless).toBe(true);
  });
});
