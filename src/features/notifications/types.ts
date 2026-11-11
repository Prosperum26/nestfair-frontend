export type NotificationType = 'EXPENSE_CREATED' | 'DEBT_PAID' | 'REMINDER_DUE';

/** Một thông báo cá nhân (GET /notifications). `params` do client ghép thành câu. */
export interface NotificationDto {
  id: string;
  houseId: string;
  type: NotificationType;
  params: Record<string, string | number>;
  /** null = chưa đọc. */
  readAt: string | null;
  createdAt: string;
}

export interface NotificationList {
  items: NotificationDto[];
  /** Số chưa đọc, không bị giới hạn bởi `limit`. */
  unreadCount: number;
}
