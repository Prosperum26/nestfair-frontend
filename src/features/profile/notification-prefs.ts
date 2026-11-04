export const NOTIFICATION_KEYS = ['expenseCreated', 'choreDigest', 'debtPaid'] as const;

export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];
export type NotificationPrefs = Record<NotificationKey, boolean>;

/** Chưa chỉnh gì (backend trả null) thì bật hết. */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  expenseCreated: true,
  choreDigest: true,
  debtPaid: true,
};

/** Đọc `user.notificationPrefs` từ backend (khớp `resolveNotificationPrefs` ở backend). */
export function resolveNotificationPrefs(raw: unknown): NotificationPrefs {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out = { ...DEFAULT_NOTIFICATION_PREFS };
  for (const key of NOTIFICATION_KEYS) {
    if (typeof source[key] === 'boolean') out[key] = source[key];
  }
  return out;
}
