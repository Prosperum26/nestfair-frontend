import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store.ts';
import { api, ApiError, refreshSession } from './api.ts';

const user = {
  id: 'u1',
  email: 'hung@uit.edu.vn',
  fullName: 'Trần Minh Hùng',
  phone: null,
  bankBin: null,
  bankAccount: null,
  avatarUrl: null,
  ocrConsentAt: null,
  createdAt: '2026-10-08T00:00:00Z',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

type Route = (init: RequestInit) => Response | Promise<Response>;

/** fetch giả: map "METHOD /path" -> danh sách phản hồi lần lượt. */
function mockFetch(routes: Record<string, Route[]>) {
  const calls: { key: string; auth: string | null }[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? 'GET'} ${url.replace('/api/v1', '')}`;
    const headers = (init.headers ?? {}) as Record<string, string>;
    calls.push({ key, auth: headers.Authorization ?? null });
    const queue = routes[key];
    if (!queue?.length) throw new Error(`Không có route giả cho ${key}`);
    return (queue.length > 1 ? queue.shift()! : queue[0])(init);
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

beforeEach(() => {
  vi.stubGlobal('navigator', {}); // không có Web Locks -> dùng nhánh dự phòng
  useAuthStore.setState({ status: 'authenticated', accessToken: 'old', user });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api', () => {
  it('gắn Bearer token từ store', async () => {
    const calls = mockFetch({ 'GET /auth/me': [() => json(200, user)] });

    await expect(api('/auth/me')).resolves.toEqual(user);
    expect(calls[0].auth).toBe('Bearer old');
  });

  it('gửi FormData nguyên bản, không ép Content-Type JSON (để trình duyệt tự đặt boundary)', async () => {
    let sent: RequestInit | undefined;
    mockFetch({
      'POST /assignments/a1/checkin': [
        (init) => {
          sent = init;
          return json(200, { ok: true });
        },
      ],
    });
    const body = new FormData();
    body.append('photo', new Blob(['x'], { type: 'image/png' }), 'a.png');

    await api('/assignments/a1/checkin', { method: 'POST', body });

    expect(sent?.body).toBe(body);
    expect((sent?.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });

  it('gửi thêm header tùy chọn (Idempotency-Key)', async () => {
    let sent: RequestInit | undefined;
    mockFetch({ 'POST /x': [(init) => ((sent = init), json(200, { ok: true }))] });
    await api('/x', { method: 'POST', body: { a: 1 }, headers: { 'Idempotency-Key': 'k1' } });
    expect((sent?.headers as Record<string, string>)['Idempotency-Key']).toBe('k1');
    expect((sent?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('lỗi từ backend mang theo mã code máy đọc được', async () => {
    mockFetch({ 'POST /y': [() => json(409, { statusCode: 409, message: 'Ca vừa đổi', error: 'Conflict', code: 'ASSIGNMENT_STATE_CHANGED' })] });
    const err = await api('/y', { method: 'POST' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ statusCode: 409, code: 'ASSIGNMENT_STATE_CHANGED', message: 'Ca vừa đổi' });
  });

  it('gặp 401 thì refresh rồi gọi lại với token mới', async () => {
    const calls = mockFetch({
      'GET /auth/me': [() => json(401, { message: 'Unauthorized' }), () => json(200, user)],
      'POST /auth/refresh': [() => json(200, { accessToken: 'new', user })],
    });

    await expect(api('/auth/me')).resolves.toEqual(user);
    expect(calls.map((c) => c.key)).toEqual(['GET /auth/me', 'POST /auth/refresh', 'GET /auth/me']);
    expect(calls[2].auth).toBe('Bearer new');
    expect(useAuthStore.getState().accessToken).toBe('new');
  });

  it('nhiều request cùng 401 chỉ refresh một lần', async () => {
    let refreshCount = 0;
    mockFetch({
      'GET /a': [() => json(401, {}), () => json(200, 'a')],
      'GET /b': [() => json(401, {}), () => json(200, 'b')],
      'POST /auth/refresh': [
        async () => {
          refreshCount++;
          await new Promise((r) => setTimeout(r, 10));
          return json(200, { accessToken: 'new', user });
        },
      ],
    });

    await expect(Promise.all([api('/a'), api('/b')])).resolves.toEqual(['a', 'b']);
    expect(refreshCount).toBe(1);
  });

  it('refresh thất bại thì xóa phiên và ném lỗi 401', async () => {
    mockFetch({
      'GET /auth/me': [() => json(401, { message: 'Unauthorized' })],
      'POST /auth/refresh': [() => json(401, { message: 'Phiên đăng nhập đã hết hạn' })],
    });

    const error = await api('/auth/me').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(401);
    expect(useAuthStore.getState()).toMatchObject({ status: 'anonymous', accessToken: null });
  });

  it('request auth: false không tự refresh (sai mật khẩu giữ nguyên thông báo)', async () => {
    const calls = mockFetch({
      'POST /auth/login': [() => json(401, { message: 'Email hoặc mật khẩu không đúng.' })],
    });

    await expect(
      api('/auth/login', { method: 'POST', body: {}, auth: false }),
    ).rejects.toThrow('Email hoặc mật khẩu không đúng.');
    expect(calls).toHaveLength(1);
  });

  it('lỗi validate dạng mảng thì lấy thông báo đầu tiên', async () => {
    mockFetch({ 'POST /x': [() => json(400, { message: ['Email không hợp lệ.', 'khác'] })] });

    await expect(api('/x', { method: 'POST', body: {} })).rejects.toThrow('Email không hợp lệ.');
  });

  it('mất mạng thì ApiError status 0 với thông báo tiếng Việt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = (await api('/auth/me').catch((e: unknown) => e)) as ApiError;
    expect(error.statusCode).toBe(0);
    expect(error.message).toMatch(/Không kết nối được máy chủ/);
  });
});

describe('refreshSession khi mở app', () => {
  it('có cookie hợp lệ thì vào trạng thái authenticated', async () => {
    useAuthStore.setState({ status: 'loading', accessToken: null, user: null });
    mockFetch({ 'POST /auth/refresh': [() => json(200, { accessToken: 't', user })] });

    await expect(refreshSession()).resolves.toBe(true);
    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', user });
  });

  it('không có cookie thì anonymous', async () => {
    useAuthStore.setState({ status: 'loading', accessToken: null, user: null });
    mockFetch({ 'POST /auth/refresh': [() => json(401, {})] });

    await expect(refreshSession()).resolves.toBe(false);
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('dùng Web Locks khi trình duyệt hỗ trợ', async () => {
    const request = vi.fn((_name: string, cb: () => Promise<boolean>) => cb());
    vi.stubGlobal('navigator', { locks: { request } });
    mockFetch({ 'POST /auth/refresh': [() => json(200, { accessToken: 't', user })] });

    await refreshSession();
    expect(request).toHaveBeenCalledWith('nestfair-auth-refresh', expect.any(Function));
  });
});
