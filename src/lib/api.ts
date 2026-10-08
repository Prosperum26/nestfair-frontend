/**
 * Placeholder fetch wrapper cho /api/v1.
 * Bước sau: gắn access token từ auth store, gặp 401 thì gọi /auth/refresh một lần rồi thử lại.
 */
export const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? 'Có lỗi xảy ra, thử lại sau.');
    throw new ApiError(res.status, message);
  }
  return body as T;
}
