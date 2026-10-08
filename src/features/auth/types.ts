/** Khớp PublicUserDto của backend (GET /auth/me, /users/me). */
export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  bankBin: string | null;
  bankAccount: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}
