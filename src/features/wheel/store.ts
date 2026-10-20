import { create } from 'zustand';
import type { ActiveSpin, WheelSpin } from './types.ts';

interface WheelState {
  open: boolean;
  active: ActiveSpin | null;
  openModal: () => void;
  close: () => void;
  /** Nhận một vòng (từ REST hoặc socket); `serverNow` của vòng dùng để đo lệch đồng hồ ngay lúc nhận. */
  show: (spin: WheelSpin, opts?: { open?: boolean }) => void;
  /** Cập nhật trạng thái vòng đang xem (kết quả / bị hủy), giữ lệch đồng hồ cũ. */
  patch: (spinId: string, change: Partial<WheelSpin>) => void;
}

/** Modal vòng quay dùng chung cả app (mở từ Tổng quan, nút nhanh, Việc nhà, toast). */
export const useWheelStore = create<WheelState>((set) => ({
  open: false,
  active: null,
  openModal: () => set({ open: true }),
  close: () => set((s) => ({ open: false, active: s.active?.spin.status === 'SPINNING' ? s.active : null })),
  show: (spin, opts) =>
    set((s) => ({
      open: opts?.open ?? s.open,
      active: { spin, clockOffsetMs: Date.parse(spin.serverNow) - Date.now() },
    })),
  patch: (spinId, change) =>
    set((s) => (s.active && s.active.spin.spinId === spinId ? { active: { ...s.active, spin: { ...s.active.spin, ...change } } } : s)),
}));
