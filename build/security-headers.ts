import type { Plugin } from 'vite';

/**
 * Header bảo mật của frontend: một nguồn duy nhất cho file `_headers` của Cloudflare Pages (lúc build)
 * và cho `vite preview` (thử trên máy giống production). Không áp cho `vite dev` vì HMR cần script inline.
 */
export interface HeaderOptions {
  /** Origin backend (VITE_API_URL), vd. https://api.nestfair.vn. Trống = API cùng origin. */
  apiOrigin?: string;
  /** Site chạy https (production): bật HSTS và upgrade-insecure-requests. */
  https: boolean;
}

function checkedOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`VITE_API_URL không phải origin hợp lệ: ${value}`);
  }
  if (!/^https?:$/.test(url.protocol) || url.origin !== value.replace(/\/+$/, '')) {
    throw new Error(`VITE_API_URL phải là origin http(s) không có đường dẫn: ${value}`);
  }
  return url.origin;
}

export function contentSecurityPolicy({ apiOrigin, https }: HeaderOptions): string {
  const api = apiOrigin ? checkedOrigin(apiOrigin) : undefined;
  const socket = api?.replace(/^http/, 'ws');
  const images = ['https://res.cloudinary.com', 'https://img.vietqr.io'];
  const directives: [string, string[]][] = [
    ['default-src', ["'self'"]],
    ['script-src', ["'self'"]],
    // 'unsafe-inline' cho style: Sonner và motion chèn <style>/style lúc chạy. Script vẫn chặn inline.
    ['style-src', ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']],
    ['font-src', ["'self'", 'data:', 'https://fonts.gstatic.com']],
    ['img-src', ["'self'", 'data:', 'blob:', ...images, 'https://*.googleusercontent.com']],
    // html-to-image tải lại font, CSS và ảnh để nhúng vào poster PNG.
    [
      'connect-src',
      ["'self'", ...(api ? [api, socket!] : []), ...images, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    ],
    // browser-image-compression tạo worker từ Blob.
    ['worker-src', ["'self'", 'blob:']],
    ['media-src', ["'self'", 'data:', 'blob:']],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
    ['frame-ancestors', ["'none'"]],
  ];
  if (https) directives.push(['upgrade-insecure-requests', []]);
  return directives.map(([name, values]) => [name, ...values].join(' ')).join('; ');
}

export function securityHeaders(options: HeaderOptions): Record<string, string> {
  return {
    'Content-Security-Policy': contentSecurityPolicy(options),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    // Chỉ form tin đăng dùng vị trí; ảnh chụp đi qua <input type=file>, không cần quyền camera.
    'Permissions-Policy': 'geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
    ...(options.https ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {}),
  };
}

/** Nội dung file `_headers` (Cloudflare Pages): header cho mọi trang, cache lâu dài cho asset có hash. */
export function pagesHeadersFile(options: HeaderOptions): string {
  const lines = Object.entries(securityHeaders(options)).map(([k, v]) => `  ${k}: ${v}`);
  return ['/*', ...lines, '', '/assets/*', '  Cache-Control: public, max-age=31536000, immutable', ''].join('\n');
}

/** Phát `_headers` vào dist khi build, và gắn cùng header cho `vite preview`. */
export function securityHeadersPlugin(apiOrigin: string | undefined): Plugin {
  return {
    name: 'nestfair-security-headers',
    apply: (_config, env) => env.command === 'build' || env.isPreview === true,
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '_headers', source: pagesHeadersFile({ apiOrigin, https: true }) });
    },
    configurePreviewServer(server) {
      const headers = securityHeaders({ apiOrigin, https: false });
      server.middlewares.use((_req, res, next) => {
        for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
        next();
      });
    },
  };
}
