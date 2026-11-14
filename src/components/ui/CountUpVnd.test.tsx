import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountUpVnd } from './CountUpVnd.tsx';

describe('CountUpVnd', () => {
  it('trình đọc màn hình đọc giá trị cuối, phần số đang đếm bị ẩn', () => {
    const html = renderToStaticMarkup(<CountUpVnd value={2280000} />);
    expect(html).toContain('<span class="sr-only">2.280.000đ</span>');
    expect(html).toMatch(/<span aria-hidden="true">[^<]*đ<\/span>/);
  });

  it('signed hiện dấu − cho số âm', () => {
    expect(renderToStaticMarkup(<CountUpVnd value={-170000} signed />)).toContain('<span class="sr-only">−170.000đ</span>');
  });
});
