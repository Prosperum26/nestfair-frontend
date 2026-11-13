import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, pagesHeadersFile, securityHeaders } from './security-headers.ts';

const directives = (csp: string) =>
  Object.fromEntries(
    csp
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...values] = d.split(/\s+/);
        return [name, values];
      }),
  );

describe('contentSecurityPolicy', () => {
  const csp = directives(contentSecurityPolicy({ apiOrigin: 'https://api.nestfair.vn', https: true }));

  it('chỉ chạy script của chính site: không inline, không eval, không CDN', () => {
    expect(csp['script-src']).toEqual(["'self'"]);
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['object-src']).toEqual(["'none'"]);
  });

  it('không cho nhúng vào iframe, khóa base-uri và form-action', () => {
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(csp['base-uri']).toEqual(["'self'"]);
    expect(csp['form-action']).toEqual(["'self'"]);
  });

  it('gọi được API và Socket.IO (wss) ở origin khác', () => {
    expect(csp['connect-src']).toEqual(expect.arrayContaining(["'self'", 'https://api.nestfair.vn', 'wss://api.nestfair.vn']));
  });

  it('ảnh: Cloudinary, VietQR, avatar Google, data/blob (poster, xem trước ảnh)', () => {
    expect(csp['img-src']).toEqual(
      expect.arrayContaining(["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://img.vietqr.io', 'https://*.googleusercontent.com']),
    );
  });

  it('font Google và worker nén ảnh (blob) được phép', () => {
    expect(csp['font-src']).toEqual(expect.arrayContaining(['https://fonts.gstatic.com']));
    expect(csp['style-src']).toEqual(expect.arrayContaining(['https://fonts.googleapis.com']));
    expect(csp['worker-src']).toEqual(["'self'", 'blob:']);
  });

  it('production https: nâng mọi request http lên https', () => {
    expect(csp['upgrade-insecure-requests']).toEqual([]);
  });

  it('không có API riêng (cùng origin, dev proxy): connect-src chỉ self + dịch vụ ảnh, không upgrade trên http', () => {
    const local = directives(contentSecurityPolicy({ https: false }));
    expect(local['connect-src']).not.toEqual(expect.arrayContaining([expect.stringMatching(/^wss:/)]));
    expect(local['upgrade-insecure-requests']).toBeUndefined();
  });

  it('API http (máy dev) thì socket dùng ws://', () => {
    const local = directives(contentSecurityPolicy({ apiOrigin: 'http://localhost:5000', https: false }));
    expect(local['connect-src']).toEqual(expect.arrayContaining(['http://localhost:5000', 'ws://localhost:5000']));
  });

  it('apiOrigin không phải origin hợp lệ thì báo lỗi lúc build', () => {
    expect(() => contentSecurityPolicy({ apiOrigin: 'api.nestfair.vn', https: true })).toThrow();
    expect(() => contentSecurityPolicy({ apiOrigin: "https://x.vn; script-src 'unsafe-inline'", https: true })).toThrow();
  });
});

describe('securityHeaders', () => {
  it('đủ header chuẩn; HSTS chỉ khi https', () => {
    const h = securityHeaders({ apiOrigin: 'https://api.nestfair.vn', https: true });
    expect(h).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
    expect(h['Strict-Transport-Security']).toMatch(/max-age=31536000/);
    expect(h['Permissions-Policy']).toContain('geolocation=(self)');
    expect(h['Permissions-Policy']).toContain('camera=()');
    expect(securityHeaders({ https: false })['Strict-Transport-Security']).toBeUndefined();
  });
});

describe('pagesHeadersFile', () => {
  const file = pagesHeadersFile({ apiOrigin: 'https://api.nestfair.vn', https: true });

  it('áp header cho mọi đường dẫn theo cú pháp _headers của Cloudflare Pages', () => {
    expect(file).toMatch(/^\/\*\n {2}Content-Security-Policy: default-src 'self'/m);
    expect(file).toContain('\n  X-Frame-Options: DENY');
  });

  it('asset có hash cache lâu dài', () => {
    expect(file).toMatch(/\/assets\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/);
  });
});
