import AxeBuilder from '@axe-core/playwright';
import { type APIRequestContext, expect, test as base, type Page } from '@playwright/test';

/**
 * Smoke test chỉ đọc trên dữ liệu seed (Nhà 12A). Không tạo hay sửa dữ liệu, nên chạy được nhiều lần trên dev.
 * Mỗi test tự kiểm: không lỗi JavaScript, không vi phạm CSP.
 */
const API_URL = (process.env.API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
const EMAIL = process.env.DEMO_LOGIN_EMAIL ?? 'hung@nestfair.demo';
const PASSWORD = process.env.DEMO_LOGIN_PASSWORD ?? 'NestFair123';
const HOUSE = process.env.DEMO_HOUSE_NAME ?? 'Nhà 12A';
const SLUG = process.env.DEMO_LISTING_SLUG ?? 'x7Kp2QmA';

declare global {
  interface Window {
    __csp?: string[];
  }
}

const test = base.extend<{ problems: string[] }>({
  problems: async ({ page }, provide) => {
    const problems: string[] = [];
    page.on('pageerror', (e) => problems.push(`JS: ${e.message}`));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => {
        (window.__csp ??= []).push(`CSP ${e.violatedDirective} ← ${e.blockedURI}`);
      });
    });
    await provide(problems);
    const csp = await page.evaluate(() => window.__csp ?? []).catch(() => []);
    expect([...problems, ...csp], 'lỗi trang hoặc vi phạm CSP').toEqual([]);
  },
});

/** Đợi mọi animation hữu hạn chạy xong (bỏ qua animation lặp vô hạn như hiệu ứng lơ lửng). */
async function animationsSettled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

/**
 * Vi phạm a11y mức serious/critical, kèm phần tử để dễ sửa. Đợi animation xong trước: motion vẫn chạy hiệu ứng
 * độ mờ khi giảm chuyển động, đo giữa chừng sẽ ra độ tương phản sai.
 */
async function seriousA11y(page: Page) {
  await animationsSettled(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} → ${n.html.slice(0, 120)}`));
}

/**
 * Đăng nhập qua giao diện, trước đó chọn sẵn nhà demo (tài khoản Hùng ở hai nhà).
 * Gọi API bằng `request` riêng: `page.request` dùng chung cookie với trình duyệt, sẽ đặt sẵn cookie refresh
 * khiến /login tự chuyển vào app trước khi kịp điền form.
 */
async function login(page: Page, request: APIRequestContext) {
  const auth = await request.post(`${API_URL}/api/v1/auth/login`, { data: { email: EMAIL, password: PASSWORD } });
  expect(auth.ok(), 'đăng nhập API bằng tài khoản demo').toBe(true);
  const { accessToken } = (await auth.json()) as { accessToken: string };
  const houses = (await (await request.get(`${API_URL}/api/v1/houses`, { headers: { authorization: `Bearer ${accessToken}` } })).json()) as {
    id: string;
    name: string;
  }[];
  const houseId = houses.find((h) => h.name === HOUSE)?.id;
  expect(houseId, `tài khoản demo có ${HOUSE}`).toBeTruthy();
  await page.addInitScript((id) => localStorage.setItem('nestfair.currentHouseId', id), houseId!);

  await page.goto('/login');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'));
}

test('trang giới thiệu tải được, không lỗi truy cập nghiêm trọng', async ({ page, problems }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  expect(await seriousA11y(page)).toEqual([]);
  expect(problems).toEqual([]);
});

test('đăng nhập rồi đi qua các màn chính', async ({ page, request, problems }) => {
  await login(page, request);
  await expect(page.getByRole('heading', { level: 1, name: /Chào .*Hùng/ })).toBeVisible();
  expect(await seriousA11y(page)).toEqual([]);

  for (const path of ['/chores', '/expenses', '/payments', '/assistant', '/house/listing', '/profile']) {
    await page.goto(path);
    await expect(page.locator('h1').first(), path).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test('tải lại trang vẫn giữ phiên (cookie refresh)', async ({ page, request, problems, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chưa có tên miền: Safari/Firefox chặn cookie khác site (spec deploy mục 6.5)');
  await login(page, request);
  await page.goto('/dashboard');
  // Đợi lần làm mới phiên của lần tải này xong (cookie mới đã về) rồi mới tải lại. Tải lại giữa chừng thì
  // server đã xoay token mà trình duyệt chưa nhận cookie mới, phiên sẽ mất.
  await expect(page.getByRole('heading', { level: 1, name: /Chào/ })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1, name: /Chào/ })).toBeVisible();
  expect(problems).toEqual([]);
});

test('trang tin công khai: không cần đăng nhập, ảnh tải được', async ({ page, problems }) => {
  await page.goto(`/r/${SLUG}`);
  await expect(page.locator('h1').first()).toBeVisible();
  const images = await page.locator('img').evaluateAll((els) => els.map((el) => (el as HTMLImageElement).naturalWidth > 0));
  expect(images.length).toBeGreaterThan(0);
  expect(images.every(Boolean)).toBe(true);
  expect(await seriousA11y(page)).toEqual([]);
  expect(problems).toEqual([]);
});

test('slug sai: trang báo thân thiện, không trắng trang', async ({ page, problems }) => {
  await page.goto('/r/khongTonTai1');
  await expect(page.getByText('Tin không còn khả dụng')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Về NestFair' })).toBeVisible();
  expect(problems).toEqual([]);
});
