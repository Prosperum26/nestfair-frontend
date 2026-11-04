import { describe, expect, it } from 'vitest';
import { DEFAULT_NOTIFICATION_PREFS, resolveNotificationPrefs } from './notification-prefs.ts';

describe('resolveNotificationPrefs (khớp backend)', () => {
  it('null hoặc không phải object thì bật hết', () => {
    expect(resolveNotificationPrefs(null)).toEqual(DEFAULT_NOTIFICATION_PREFS);
    expect(resolveNotificationPrefs(undefined)).toEqual(DEFAULT_NOTIFICATION_PREFS);
    expect(resolveNotificationPrefs('x')).toEqual(DEFAULT_NOTIFICATION_PREFS);
    expect(resolveNotificationPrefs([false])).toEqual(DEFAULT_NOTIFICATION_PREFS);
  });

  it('giữ boolean đã lưu, khóa thiếu hoặc sai kiểu thì bật', () => {
    expect(resolveNotificationPrefs({ choreDigest: false, debtPaid: 'no', other: false })).toEqual({
      expenseCreated: true,
      choreDigest: false,
      debtPaid: true,
    });
  });
});
