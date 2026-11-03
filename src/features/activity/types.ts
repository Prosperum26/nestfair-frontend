/** Một mục bảng tin hoạt động (HouseActivity). Câu chữ ghép ở client từ `type + params`. */
export interface Activity {
  id: string;
  type: string;
  /** null = hệ thống (cron). */
  actorUserId: string | null;
  /** Họ tên chụp lúc xảy ra. */
  actorName: string;
  params: Record<string, unknown>;
  createdAt: string;
}
