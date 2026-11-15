# NestFair Web

Frontend của **NestFair**, web-app quản lý ở ghép cho sinh viên. Đồ án cuối kỳ môn MSIS207 (Phát triển ứng dụng web, UIT), nhóm 2 người: Hưng và Thiện.

NestFair giúp một nhà trọ chia việc nhà công bằng, theo dõi chi tiêu chung và tìm thêm người ở ghép. Repo này là giao diện web (SPA); API nằm ở repo [nestfair-backend](https://github.com/Prosperum26/nestfair-backend).

## Tính năng

1. **Việc nhà:** lịch xoay vòng công bằng, Shuffle, Lucky Wheel, check-in bằng ảnh và bạn cùng phòng duyệt; đổi ca, nhờ trực dùm, làm bù hoặc tặng quà, Chợ ca.
2. **Chi tiêu:** chia tiền, Min Cash Flow rút gọn nợ (ví dụ sau rút gọn: Thiện → Mai 380.000đ), thanh toán bằng mã VietQR.
3. **Trợ lý AI phòng trọ:** chat riêng tư, gợi ý xử lý sự cố, tạo nhắc nhở.
4. **OCR hóa đơn:** chụp hóa đơn, xem bản nháp khoản chi, xác nhận rồi mới lưu.
5. **Tìm người ở ghép:** tin đăng, trang công khai `/r/:slug`, poster PNG kèm QR.

Ngoài phạm vi: tách thuế VAT, thanh toán thật, chat giữa thành viên, kiểm duyệt link/QR, bảng xếp hạng / huy hiệu / đổi thưởng, AI Mediator, Harmony Index, PDF report.

## Công nghệ

| Mục | Công nghệ |
| :--- | :--- |
| Nền tảng | React 19, Vite 8, TypeScript 6 |
| Giao diện | Tailwind CSS 4 (token trong `src/index.css`), `lucide-react`, Sonner (toast) |
| Dữ liệu | TanStack Query 5 (server state), Zustand 5 (client state) |
| Form | React Hook Form 7 + Zod 4 |
| Điều hướng | react-router 8 |
| Realtime | `socket.io-client` 4.8 |
| Tiện ích | `qrcode.react` + `html-to-image` (poster), `browser-image-compression`, `canvas-confetti`, `react-markdown`, `motion` 14.6.0 |
| Kiểm thử | Vitest 5, Playwright 1.64 + axe-core, ESLint 10 |

## Chạy trên máy

Yêu cầu: Node 26 (xem `.nvmrc`; `package.json` đặt `>=26 <27`) và backend `nestfair-backend` đang chạy ở cổng 5000 (xem README của repo đó; backend cần Docker cho PostgreSQL).

```bash
npm install
npm run dev        # http://localhost:5173, proxy /api -> http://localhost:5000
npm run build      # typecheck + build production vào dist/
npm run preview    # xem thử bản build
```

Chạy dev không cần `.env`. Dùng tài khoản demo ở mục dưới sau khi seed backend.

### Biến môi trường

| Biến | Ý nghĩa |
| :--- | :--- |
| `VITE_API_URL` | Origin của backend, không có `/api/v1` ở cuối. Để trống khi dev (Vite proxy `/api` sang `localhost:5000`). Khi build deploy, đặt thành URL backend. Biến `VITE_*` nằm trong bundle, không đặt bí mật vào đó. |

## Tài khoản demo

Sau khi chạy `npm run seed` ở backend (nhà **Nhà 12A**, mật khẩu chung `NestFair123`):

| Email | Vai trò |
| :--- | :--- |
| `hung@nestfair.demo` | Trưởng phòng |
| `thien@nestfair.demo` | Thành viên |
| `mai@nestfair.demo` | Thành viên |
| `quan@nestfair.demo` | Thành viên |

Bản dev đã deploy cũng dùng bộ tài khoản này. Backend chạy trên Render Free, ngủ sau 15 phút không có request, nên lần đăng nhập đầu có thể chậm vài chục giây.

## Kiểm thử và chất lượng

| Lệnh | Việc |
| :--- | :--- |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (`src/**/*.test.ts`) |
| `npm run e2e` | Playwright smoke test (`e2e/*.e2e.ts`) kèm kiểm axe, 2 project: desktop 1280 và mobile 390 |

`npm run e2e` đọc dữ liệu seed (Nhà 12A), không tạo hay sửa dữ liệu. Biến đọc từ môi trường: `BASE_URL` (trang web cần kiểm; mặc định `http://localhost:4180`), `API_URL` (mặc định `http://localhost:5000`), `DEMO_LOGIN_EMAIL`, `DEMO_LOGIN_PASSWORD`, `DEMO_HOUSE_NAME`, `DEMO_LISTING_SLUG`. Ví dụ kiểm bản dev (cần cài trình duyệt: `npx playwright install chromium`; ở máy local không đặt `CI` thì cấu hình dùng Microsoft Edge có sẵn):

```bash
BASE_URL=https://nestfair-dev.pages.dev API_URL=https://nestfair-api-dev.onrender.com npm run e2e
```

Chạy như CI trên máy:

```bash
npm ci
npm run typecheck && npm run lint && npm test && npm run build
VITE_API_URL=http://localhost:5000 npm run build   # sinh dist/_headers (CSP) giống production
```

### CI/CD (GitHub Actions, thư mục `.github/workflows/`)

| Workflow | Việc |
| :--- | :--- |
| `ci.yml` | Typecheck, lint, test, build và kiểm `dist/_headers` (CSP). Push vào `dev` hoặc `main` thì gọi `deploy.yml`; sau deploy dev gọi `verify-dev.yml`. |
| `security.yml` | `npm audit` (mức high trở lên), gitleaks, Semgrep, CodeQL; chạy cả theo lịch hằng tuần. |
| `pr-title.yml` | Kiểm tiêu đề PR theo Conventional Commits. |
| `deploy.yml` | Build với `VITE_API_URL` của môi trường, đưa lên Cloudflare Pages, smoke test. |
| `verify-dev.yml` | Sau deploy dev: Playwright smoke test, Lighthouse (cảnh báo, chưa chặn); quét ZAP chạy theo lịch hoặc chạy tay; khi xanh thì mở PR `dev → main`. |

## Cấu trúc thư mục

```text
src/
├── main.tsx              khôi phục phiên (POST /auth/refresh) một lần rồi render
├── App.tsx               router + QueryClient + Toaster
├── index.css             token thiết kế trong @theme (màu, font, cỡ chữ, bo góc, bóng)
├── components/ui/        thành phần giao diện dùng chung (Button, Field, Input, Avatar, Receipt, Stamp...)
├── components/layout/    AppShell (top nav desktop, top bar + tab bar mobile), HouseSwitcher, UserMenu
├── features/<module>/    api.ts, hooks.ts (TanStack Query), schemas.ts (Zod), components/
│                         các module: auth, houses, membership, chores, wheel, swaps, expenses, settlements,
│                         receipts, assistant, reminders, listing, notifications, activity, realtime, dashboard...
├── lib/                  api.ts (fetch + tự refresh khi 401), format.ts (formatVnd), date.ts, socket.ts, vietqr.ts...
├── stores/               Zustand: auth-store (access token chỉ trong bộ nhớ), house-store (nhà đang chọn)
├── routes/               ProtectedRoute, GuestRoute, RequireHouse, HomeRedirect
└── pages/                một file mỗi màn
e2e/                      Playwright smoke test
public/                   favicon, robots.txt, ảnh minh họa seed
```

Luồng điều hướng: `/login` hoặc `/register` → `/`; chưa có nhà thì vào `/onboarding`; có nhà thì vào `/dashboard`. Các màn trong nhà (`/dashboard`, `/chores`, `/expenses`, `/expenses/scan`, `/payments`, `/members`, `/assistant`, `/house`, `/house/listing`, `/profile`) nằm trong `RequireHouse` + `AppShell`. Trang tin công khai `/r/:slug` không cần đăng nhập.

## Giao diện "Sổ Chung"

Giao diện theo concept cuốn sổ chung của nhà trọ. Tài liệu thiết kế (`Design.md`, ảnh `preview_png/`) không nằm trong repo này; token đã được chuyển vào `@theme` trong `src/index.css`. Tailwind v4 không có `tailwind.config`, và bảng màu mặc định đã bị tắt nên lớp như `bg-blue-500` không có tác dụng.

- **Màu:** nền `paper #F6F3EC`, thẻ `surface` viền `line`, chữ `ink #1C2333`, accent bút dạ quang `hl #F5D547`. Số dư luôn có dấu `+` / `−` (U+2212): `mint` là được nhận, `tom` là cần trả.
- **Font:** Fraunces (tiêu đề), Inter (nội dung), JetBrains Mono (mọi số tiền, giờ, mã mời); nạp từ Google Fonts với subset `vietnamese`.
- **Độ nổi:** bóng đặc lệch (ví dụ `3px 3px 0` cho nút accent), không blur shadow, không gradient, không glassmorphism, không emoji trong UI; icon Lucide `stroke-width 2`.
- **Định dạng:** tiền `2.280.000đ` (qua `formatVnd()`), ngày `dd.mm` hoặc `dd.mm.yyyy`, thứ `T2…T7, CN`, giờ 24h.
- **Bố cục:** desktop có top nav và container 1200; mobile (390) có top bar và tab bar dưới `Tổng quan · Việc nhà · [FAB +] · Chi tiêu · Thanh toán`. Không có layout tablet riêng.
- **Quy tắc khác:** tối đa 1 marker bút dạ quang mỗi màn; mọi danh sách có đủ loading (skeleton), trống và lỗi; dùng được ở bề rộng 360px; copy tiếng Việt, xưng "bạn".
- **Animation:** `motion` nạp qua `LazyMotion` và dùng `m.*`; thời lượng và easing lấy từ `src/lib/motion.ts`. Tiền và đổi ca không cập nhật lạc quan.

## Triển khai

Hai môi trường, mỗi môi trường một project Cloudflare Pages riêng (Direct Upload), backend trên Render và database trên Neon:

| | dev | production |
| :--- | :--- | :--- |
| Nhánh | `dev` | `main` |
| Frontend | Cloudflare Pages `nestfair-dev` | Cloudflare Pages `nestfair-prod` |
| Backend | Render `nestfair-api-dev` | Render `nestfair-api-prod` |

Bản dev đang chạy:

- Web: https://nestfair-dev.pages.dev
- API: https://nestfair-api-dev.onrender.com (Swagger: https://nestfair-api-dev.onrender.com/api/docs)

Production và tên miền riêng chưa được thiết lập. Hướng dẫn thiết lập đầy đủ cho cả hai repo nằm trong repo backend: [docs/DEPLOY.md](https://github.com/Prosperum26/nestfair-backend/blob/dev/docs/DEPLOY.md).

## Quy trình Git

- Nhánh: `main` (production) ← `dev` ← `feat/<module>-<mô-tả>`. Không push thẳng `main` hay `dev`.
- Mỗi issue một PR vào `dev`, người còn lại review rồi mới merge.
- Commit và tiêu đề PR theo Conventional Commits có scope module, ví dụ `feat(chores): ...`, `fix(expenses): ...`.

Chi tiết xem [CONTRIBUTING.md](CONTRIBUTING.md).
