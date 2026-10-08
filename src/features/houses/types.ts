/** Khớp HouseRole / HouseSummaryDto / HouseDetailDto của backend. */
export type HouseRole = 'ADMIN' | 'ROOMMATE';

export const ROLE_LABELS: Record<HouseRole, string> = {
  ADMIN: 'Trưởng phòng',
  ROOMMATE: 'Thành viên',
};

export interface HouseSummary {
  id: string;
  name: string;
  address: string | null;
  maxMembers: number;
  memberCount: number;
  myRole: HouseRole;
}

export interface HouseMember {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: HouseRole;
  joinedAt: string;
}

export interface HouseDetail {
  id: string;
  name: string;
  address: string | null;
  maxMembers: number;
  rules: string | null;
  inviteCode: string;
  inviteExpiresAt: string;
  createdAt: string;
  myRole: HouseRole;
  members: HouseMember[];
}
