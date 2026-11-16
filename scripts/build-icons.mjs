// Sinh public/favicon.ico (PNG 16/32/48 gói trong ICO) và public/apple-touch-icon.png (180x180) từ public/favicon.svg.
// Chạy một lần khi đổi logo: `npm run icons`. Kết quả được commit vào public/.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const publicDir = new URL('../public/', import.meta.url);
const svg = readFileSync(new URL('favicon.svg', publicDir), 'utf8');
const INK = '#1C2333';

// Cùng quy ước với playwright.config.ts: local dùng Edge có sẵn, CI dùng Chromium của Playwright.
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'msedge' });
const page = await browser.newPage();

async function render(size, { background } = {}) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:${background ?? 'transparent'}}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  return page.screenshot({ type: 'png', omitBackground: !background, clip: { x: 0, y: 0, width: size, height: size } });
}

const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) pngs.push(await render(size));

// ICO: ICONDIR (6 byte) + mỗi ảnh một ICONDIRENTRY (16 byte) + dữ liệu PNG.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = pngs.map((png, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0);
  entry.writeUInt8(sizes[i], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});
writeFileSync(new URL('favicon.ico', publicDir), Buffer.concat([header, ...entries, ...pngs]));

// iOS tự bo góc và không chấp nhận nền trong suốt, nên nền ink kín.
writeFileSync(new URL('apple-touch-icon.png', publicDir), await render(180, { background: INK }));

await browser.close();
console.log('Đã sinh public/favicon.ico và public/apple-touch-icon.png');
