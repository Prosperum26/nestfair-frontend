export type ChoresView = 'calendar' | 'kanban' | 'market';

const KEY = 'nestfair.choresView';

// localStorage có thể bị chặn (chế độ riêng tư): lỗi thì dùng mặc định.
export function readView(): ChoresView {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'kanban' || value === 'market' ? value : 'calendar';
  } catch {
    return 'calendar';
  }
}

export function writeView(view: ChoresView) {
  try {
    localStorage.setItem(KEY, view);
  } catch {
    // bỏ qua
  }
}
