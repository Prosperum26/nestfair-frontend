export type ChoresView = 'calendar' | 'kanban' | 'market';

const KEY = 'nestfair.choresView';

// localStorage có thể bị chặn (chế độ riêng tư): lỗi thì dùng mặc định.
export function readView(): ChoresView {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'kanban' ? value : 'calendar';
  } catch {
    return 'calendar';
  }
}

/** Chợ ca là tab tạm (mở bằng `?view=market`), không lưu làm mặc định. */
export function writeView(view: ChoresView) {
  if (view === 'market') return;
  try {
    localStorage.setItem(KEY, view);
  } catch {
    // bỏ qua
  }
}
