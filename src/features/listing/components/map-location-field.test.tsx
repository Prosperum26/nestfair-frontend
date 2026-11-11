import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MapLocationField } from './MapLocationField.tsx';

const MAP = 'https://www.google.com/maps/search/?api=1&query=10.87,106.803';
const render = (value: string, error?: string) =>
  renderToStaticMarkup(<MapLocationField value={value} onChange={() => {}} error={error} />);

describe('MapLocationField', () => {
  it('có ô dán link, nút lấy vị trí hiện tại và lời nhắc làm tròn ~100m', () => {
    const html = render('');
    expect(html).toContain('id="listing-map-url"');
    expect(html).toContain('Lấy vị trí hiện tại');
    expect(html).toContain('100m');
  });

  it('chưa có link thì không có nút xem thử hay nút xóa', () => {
    const html = render('');
    expect(html).not.toContain('Xem thử');
    expect(html).not.toContain('Xóa link');
  });

  it('link hợp lệ: nút xem thử mở tab mới an toàn (noopener noreferrer) và nút xóa link', () => {
    const html = render(MAP);
    expect(html).toContain('Xem thử');
    expect(html).toContain(`href="${MAP.replace(/&/g, '&amp;')}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('Xóa link');
  });

  it('link sai: không có nút xem thử (không đưa link lạ thành thẻ a), hiện lỗi', () => {
    const html = render('https://evil.com/maps', 'Chỉ nhận link Google Maps (bắt đầu bằng https://).');
    expect(html).not.toContain('href="https://evil.com');
    expect(html).toContain('Chỉ nhận link Google Maps');
    expect(html).toContain('Xóa link');
  });
});
