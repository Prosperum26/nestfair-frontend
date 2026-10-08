# NestFair Web

Frontend của NestFair (đồ án MSIS207, UIT): React 19 + Vite + TypeScript + Tailwind v4.

## Chạy

Cần backend `nestfair-backend` đang chạy ở cổng 5000 (xem README bên đó).

```bash
npm install
npm run dev        # http://localhost:5173, proxy /api -> http://localhost:5000
```

Dev không cần `.env`. Khi deploy (Vercel) đặt `VITE_API_URL` = origin backend, xem `.env.example`.

## Lệnh

| Lệnh | Việc |
| :--- | :--- |
| `npm run dev` | Dev server |
| `npm run typecheck` / `npm run lint` | tsc, ESLint |
| `npm test` | Vitest (`src/**/*.test.ts`) |
| `npm run build` | Typecheck + build production |

## Cấu trúc

```text
src/
├── main.tsx              khôi phục phiên (POST /auth/refresh) một lần rồi render
├── App.tsx               router + QueryClient + Toaster
├── index.css             token Design.md trong @theme (màu, font, cỡ chữ, bo góc, bóng)
├── components/ui/        Button, Field, Input, PasswordInput, Checkbox, Divider, Logo, Avatar, Receipt, Stamp
├── features/<module>/    api.ts, hooks.ts (TanStack Query), schemas.ts (Zod), components/
├── lib/                  api.ts (fetch + tự refresh khi 401), format.ts (formatVnd), cn.ts
├── stores/               Zustand (auth-store: access token chỉ trong bộ nhớ)
├── routes/               ProtectedRoute, GuestRoute
└── pages/                một file mỗi màn
```

## Quy ước

- **Giao diện theo `Design.md`** (thư mục `docs-references` ngoài repo) và ảnh `preview_png/`. Chỉ dùng màu token (`bg-paper`, `text-ink`, `bg-hl`…); bảng màu mặc định của Tailwind đã bị tắt nên lớp như `bg-blue-500` sẽ không có tác dụng.
- Kiểu chữ: `font-display text-h1`, `text-sm`, `font-mono text-ml` cho số tiền. Tiền định dạng bằng `formatVnd()`.
- Gọi API qua `api()` trong `lib/api.ts` (tự gắn token, tự refresh). Không lưu token vào localStorage.
- Form: React Hook Form + Zod, thông báo lỗi tiếng Việt khớp DTO backend.
- Route cần đăng nhập đặt trong `<ProtectedRoute />` ở `App.tsx`.
