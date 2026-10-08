import { create } from 'zustand';

const KEY = 'nestfair.currentHouseId';

// localStorage có thể bị chặn (chế độ riêng tư): lỗi thì coi như chưa chọn nhà.
function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
  } catch {
    // bỏ qua
  }
}

/**
 * Nhà đang chọn (house switcher). Chỉ lưu id, không phải dữ liệu nhạy cảm:
 * backend vẫn kiểm tra membership ở mọi request /houses/:houseId/...
 */
interface HouseState {
  selectedHouseId: string | null;
  selectHouse: (id: string | null) => void;
}

export const useHouseStore = create<HouseState>((set) => ({
  selectedHouseId: read(),
  selectHouse: (selectedHouseId) => {
    write(selectedHouseId);
    set({ selectedHouseId });
  },
}));
