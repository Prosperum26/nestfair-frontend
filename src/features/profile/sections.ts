import { Bell, Home, Landmark, Lock, UserRound, type LucideIcon } from 'lucide-react';

export type ProfileTab = 'info' | 'bank' | 'notifications' | 'security';

export interface ProfileSectionMeta {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Tab mobile chứa mục này; desktop hiện tất cả mục. */
  tab: ProfileTab;
}

/** Thứ tự mục trên trang hồ sơ (Design.md 12_Ho_So) và thanh điều hướng bên trái. */
export const PROFILE_SECTIONS: ProfileSectionMeta[] = [
  { id: 'profile-info', label: 'Thông tin cá nhân', icon: UserRound, tab: 'info' },
  { id: 'profile-bank', label: 'Tài khoản nhận tiền', icon: Landmark, tab: 'bank' },
  { id: 'profile-notifications', label: 'Thông báo', icon: Bell, tab: 'notifications' },
  { id: 'profile-security', label: 'Bảo mật', icon: Lock, tab: 'security' },
  { id: 'profile-houses', label: 'Nhà của tôi', icon: Home, tab: 'info' },
];

export const PROFILE_TABS: { value: ProfileTab; label: string }[] = [
  { value: 'info', label: 'Cá nhân' },
  { value: 'bank', label: 'Ngân hàng' },
  { value: 'notifications', label: 'Thông báo' },
  { value: 'security', label: 'Bảo mật' },
];
