/** Khớp PublicUserDto của backend (GET /auth/me, /users/me). */
export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  bankBin: string | null;
  bankAccount: string | null;
  avatarUrl: string | null;
  /** Lúc người dùng đồng ý gửi ảnh hóa đơn tới Google Gemini. null = chưa đồng ý (quét OCR bị chặn). */
  ocrConsentAt: string | null;
  /** Lúc đồng ý gửi nội dung chat tới Gemini cho Trợ lý AI. null = chưa đồng ý (chat bị chặn). */
  assistantConsentAt: string | null;
  /** Công tắc thông báo; null = chưa chỉnh (bật hết). Đọc qua `resolveNotificationPrefs`. */
  notificationPrefs: unknown;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}
