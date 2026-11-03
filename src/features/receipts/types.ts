/** Khớp `POST /houses/:houseId/expenses/scan` của backend (Issue #11). Tiền luôn là số nguyên VNĐ. */
export type ScanFailureReason = 'NOT_A_RECEIPT' | 'UNREADABLE' | 'AI_TIMEOUT' | 'AI_UNAVAILABLE';

export interface DraftItem {
  name: string;
  /** Có thể lẻ (0,5 kg). */
  quantity: number;
  lineTotal: number;
  /** AI không chắc về dòng này: tô vàng và yêu cầu người dùng gán người dùng món. */
  uncertain: boolean;
  note: string | null;
}

export type DraftWarningCode = 'ITEMS_TOTAL_MISMATCH' | 'DATE_MISSING' | 'DATE_IN_FUTURE' | 'DROPPED_ITEMS' | 'AI_NOTE';

export interface DraftWarning {
  code: DraftWarningCode;
  message: string;
}

/** Bản nháp đã hậu kiểm. Chưa phải khoản chi: chỉ thành khoản chi khi người dùng bấm Lưu. */
export interface ReceiptDraft {
  merchant: string;
  /** YYYY-MM-DD hoặc null. */
  purchasedAt: string | null;
  items: DraftItem[];
  total: number;
  warnings: DraftWarning[];
}

export interface ReceiptScanResult {
  scanId: string;
  imageUrl: string;
  latencyMs: number;
  /** DRAFT: có bản nháp. MANUAL: không đọc được, mở form nhập tay (ảnh vẫn dùng được). */
  mode: 'DRAFT' | 'MANUAL';
  reason: ScanFailureReason | null;
  message: string | null;
  draft: ReceiptDraft | null;
}

/** Kết quả quét có bản nháp (nhánh `mode === 'DRAFT'`). */
export type DraftScanResult = ReceiptScanResult & { mode: 'DRAFT'; draft: ReceiptDraft };

export const isDraftResult = (r: ReceiptScanResult): r is DraftScanResult => r.mode === 'DRAFT' && r.draft !== null;
