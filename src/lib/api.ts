import type { AuthResponse } from '@/features/auth/types.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

export const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const NETWORK_ERROR = 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** false: không gắn token, không tự refresh (dùng cho login/register/refresh). */
  auth?: boolean;
}

async function send(path: string, { method = 'GET', body, auth = true }: RequestOptions) {
  const token = auth ? useAuthStore.getState().accessToken : null;
  try {
    return await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR);
  }
}

async function parse<T>(res: Response): Promise<T> {
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    // Lỗi NestJS chuẩn: { statusCode, message: string | string[], error }.
    const message = Array.isArray(data?.message)
      ? data.message[0]
      : (data?.message ?? 'Có lỗi xảy ra, thử lại sau.');
    throw new ApiError(res.status, message);
  }
  return data as T;
}

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await send('/auth/refresh', { method: 'POST', auth: false });
    if (!res.ok) {
      useAuthStore.getState().clearSession();
      return false;
    }
    useAuthStore.getState().setSession(await parse<AuthResponse>(res));
    return true;
  } catch {
    // Mất mạng: không xóa phiên đang có, chỉ báo thất bại.
    if (useAuthStore.getState().status === 'loading') {
      useAuthStore.getState().clearSession();
    }
    return false;
  }
}

/**
 * Đổi refresh token (cookie) lấy access token mới. Mỗi lúc chỉ chạy một lần:
 * - trong tab: các lời gọi đồng thời dùng chung một promise;
 * - giữa các tab: Web Locks xếp hàng, vì token xoay vòng nên hai tab gửi cùng
 *   một cookie thì tab sau sẽ bị 401 và mất phiên.
 */
export function refreshSession(): Promise<boolean> {
  refreshing ??= (
    navigator.locks
      ? navigator.locks.request('nestfair-auth-refresh', doRefresh)
      : doRefresh()
  ).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** Gọi REST /api/v1. Gặp 401 thì refresh một lần rồi thử lại. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await send(path, options);
  if (res.status === 401 && options.auth !== false) {
    if (await refreshSession()) return parse<T>(await send(path, options));
  }
  return parse<T>(res);
}
