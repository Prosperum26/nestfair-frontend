import {
  ArrowLeftRight,
  House,
  ListChecks,
  type LucideIcon,
  Megaphone,
  Receipt,
  Sparkles,
  Users,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/** Menu top nav desktop (Design.md mục 5). Icon theo bảng map mục 2.4. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Tổng quan', icon: House },
  { to: '/chores', label: 'Việc nhà', icon: ListChecks },
  { to: '/expenses', label: 'Chi tiêu', icon: Receipt },
  { to: '/payments', label: 'Thanh toán', icon: ArrowLeftRight },
  { to: '/members', label: 'Thành viên', icon: Users },
  { to: '/assistant', label: 'Trợ lý', icon: Sparkles },
  { to: '/house/listing', label: 'Tin đăng', icon: Megaphone },
];

/** Tab bar mobile: Tổng quan · Việc nhà · [FAB] · Chi tiêu · Thanh toán. */
export const TAB_ITEMS: NavItem[] = [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3]];

/** Tiêu đề top bar mobile theo route. */
export const PAGE_TITLES: Record<string, string> = {
  ...Object.fromEntries(NAV_ITEMS.map((i) => [i.to, i.label])),
  '/profile': 'Hồ sơ',
  '/house': 'Cài đặt nhà',
};
