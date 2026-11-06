export type HouseTab = 'house' | 'chores';

/** Tab của trang Cài đặt nhà. Thành viên thường chỉ có "Việc nhà" (khai vắng, nhật ký); trưởng phòng có cả hai. */
export function parseHouseTab(raw: string | null, isAdmin: boolean): HouseTab {
  if (!isAdmin) return 'chores';
  return raw === 'chores' ? 'chores' : 'house';
}

/** Mục của thanh chọn tab; rỗng nghĩa là không hiện thanh (chỉ có một tab). */
export function houseTabOptions(isAdmin: boolean): { value: HouseTab; label: string }[] {
  return isAdmin
    ? [
        { value: 'house', label: 'Nhà' },
        { value: 'chores', label: 'Việc nhà' },
      ]
    : [];
}
