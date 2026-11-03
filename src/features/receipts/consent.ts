/**
 * Đồng ý gửi ảnh hóa đơn tới Google Gemini (D13). `ocrConsentAt` là mốc server lưu: null = chưa đồng ý.
 * Từ chối trong hộp thoại không lưu gì, nên bấm quét lại sẽ hỏi lại; backend vẫn chặn (403) nếu chưa đồng ý.
 */
export type ConsentStep = 'ask' | 'proceed';

export function nextConsentStep(ocrConsentAt: string | null): ConsentStep {
  return ocrConsentAt === null ? 'ask' : 'proceed';
}

/** Nhãn trạng thái công tắc "Quét hóa đơn bằng AI" ở menu tài khoản. */
export function ocrToggleLabel(ocrConsentAt: string | null): 'Bật' | 'Tắt' {
  return ocrConsentAt === null ? 'Tắt' : 'Bật';
}
