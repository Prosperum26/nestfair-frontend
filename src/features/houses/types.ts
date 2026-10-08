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
  /** Mã BIN + 4 số cuối STK; backend không trả STK đầy đủ ở đây. */
  bankBin: string | null;
  bankAccountLast4: string | null;
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
