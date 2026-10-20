import { api } from '@/lib/api.ts';
import type { ReceiptScanResult } from './types.ts';

export const receiptsApi = {
  /** Ảnh nên được nén trước (`prepareImage`). Backend trả bản nháp, không tạo khoản chi. */
  scan: (houseId: string, photo: Blob, filename: string) => {
    const body = new FormData();
    body.append('photo', photo, filename);
    return api<ReceiptScanResult>(`/houses/${houseId}/expenses/scan`, { method: 'POST', body });
  },
};
