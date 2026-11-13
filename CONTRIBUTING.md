# Đóng góp vào nestfair-frontend

## Nhánh và PR
- `main` (production) ← `dev` ← `feat/<module>-<mô-tả>`. Không push thẳng `main` hay `dev`.
- Mỗi issue một PR vào `dev`; người còn lại trong nhóm review rồi mới merge.
- Tiêu đề PR và commit theo Conventional Commits có scope module: `feat(chores): ...`, `fix(expenses): ...`.
- `dev → main` chỉ merge khi bản dev đã deploy và kiểm tra xanh.

## Check bắt buộc trên PR
| Workflow | Kiểm |
|---|---|
| `ci` | typecheck, lint, test, build; kiểm `_headers` (CSP) |
| `security` | `npm audit` (high trở lên), gitleaks, Semgrep, CodeQL (khi repo public) |
| `pr-title` | tiêu đề theo Conventional Commits |

## Chạy như CI trên máy
```bash
npm ci
npm run typecheck && npm run lint && npm test && npm run build
VITE_API_URL=http://localhost:5000 npm run build   # sinh dist/_headers giống production
```

## Bí mật
Không commit `.env`. Biến build (`VITE_*`) nằm trong bundle và ai cũng đọc được: không đặt bí mật vào đó.
