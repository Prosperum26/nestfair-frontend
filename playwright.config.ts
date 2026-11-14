import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke test chạy trên bản đã deploy (dev) hoặc `vite preview` ở máy.
 * BASE_URL: trang web; API_URL: backend (để chọn đúng nhà trước khi vào app).
 * File test tên *.e2e.ts để Vitest (mẫu *.test/*.spec) không nhặt nhầm.
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  // Server free (Render, Neon) có thể đang ngủ: lần đầu chậm.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4180',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    // Tắt hiệu ứng (app tôn trọng prefers-reduced-motion): axe không đo nhầm độ tương phản lúc chữ đang mờ dần.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Ở máy dùng Edge có sẵn; CI cài Chromium bằng `npx playwright install --with-deps chromium`.
    ...(process.env.CI ? {} : { channel: 'msedge' }),
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
