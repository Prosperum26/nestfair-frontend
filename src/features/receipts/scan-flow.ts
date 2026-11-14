import { type DraftScanResult, isDraftResult, type ReceiptScanResult } from './types.ts';

/** Các bước của luồng quét: chọn ảnh → đang quét → (xác nhận | thất bại → nhập tay). */
export type Stage =
  | { kind: 'pick' }
  | { kind: 'scanning'; requestId: number; previewUrl: string; fileName: string; sizeBytes: number }
  | { kind: 'failed'; previewUrl: string; fileName: string; sizeBytes: number; result: ReceiptScanResult | null; message: string }
  | { kind: 'review'; previewUrl: string; fileName: string; sizeBytes: number; result: DraftScanResult };

export type ScanAction =
  | { type: 'started'; requestId: number; previewUrl: string; fileName: string; sizeBytes: number }
  | { type: 'succeeded'; requestId: number; result: ReceiptScanResult }
  | { type: 'errored'; requestId: number; message: string }
  | { type: 'cancelled' }
  | { type: 'reset' };

const DEFAULT_MANUAL_MESSAGE = 'Mình chưa đọc được hóa đơn này. Bạn thử chụp lại hoặc nhập tay nhé.';

/**
 * Máy trạng thái thuần của luồng quét. Mỗi lần gọi server mang một `requestId`; phản hồi chỉ được nhận khi vẫn
 * đang quét đúng lần đó, nên bấm Hủy (hoặc quét lại) rồi phản hồi cũ đến muộn sẽ bị bỏ, không làm màn nhảy bất ngờ.
 */
export function scanFlowReducer(state: Stage, action: ScanAction): Stage {
  switch (action.type) {
    case 'started':
      return { kind: 'scanning', requestId: action.requestId, previewUrl: action.previewUrl, fileName: action.fileName, sizeBytes: action.sizeBytes };
    case 'succeeded': {
      if (state.kind !== 'scanning' || state.requestId !== action.requestId) return state;
      const { previewUrl, fileName, sizeBytes } = state;
      if (isDraftResult(action.result)) return { kind: 'review', previewUrl, fileName, sizeBytes, result: action.result };
      return { kind: 'failed', previewUrl, fileName, sizeBytes, result: action.result, message: action.result.message ?? DEFAULT_MANUAL_MESSAGE };
    }
    case 'errored': {
      if (state.kind !== 'scanning' || state.requestId !== action.requestId) return state;
      const { previewUrl, fileName, sizeBytes } = state;
      return { kind: 'failed', previewUrl, fileName, sizeBytes, result: null, message: action.message };
    }
    case 'cancelled':
      return state.kind === 'scanning' ? { kind: 'pick' } : state;
    case 'reset':
      return { kind: 'pick' };
  }
}
