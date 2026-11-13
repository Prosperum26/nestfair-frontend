import { z } from 'zod';

// Zod v4 thử `new Function` để biên dịch schema nhanh hơn. CSP `script-src 'self'` chặn việc đó và
// báo vi phạm eval dù Zod tự bắt lỗi. Tắt hẳn bước thử; schema của app nhỏ nên không ảnh hưởng tốc độ.
// Phải nạp trước mọi schema được parse lần đầu (import đầu tiên trong main.tsx).
z.config({ jitless: true });
