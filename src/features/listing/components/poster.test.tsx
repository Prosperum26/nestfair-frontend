import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Poster, POSTER_HEIGHT, POSTER_QR_SIZE, POSTER_WIDTH, type PosterProps } from './Poster.tsx';
import { PosterPreview } from './PosterPreview.tsx';

const base: PosterProps = {
  slotsOpen: 1,
  memberCount: 4,
  locationText: 'Hẻm 51 Linh Trung, Thủ Đức',
  genderWanted: 'ANY',
  pricePerPerson: 1_615_000,
  utilitiesIncluded: true,
  coverUrl: 'https://res.cloudinary.com/demo/room.jpg',
  qrValue: 'https://nestfair.app/r/x7Kp2QmA',
  displayUrl: 'nestfair.app/r/x7Kp2QmA',
};
const html = (over: Partial<PosterProps> = {}) => renderToStaticMarkup(<Poster {...base} {...over} />);

describe('Poster', () => {
  it('có giá, tiêu đề, số người, URL hiển thị', () => {
    const out = html();
    expect(out).toContain('1.615.000đ');
    expect(out).toContain('Còn 1 chỗ ở ghép');
    expect(out).toContain('Đang có 4 người');
    expect(out).toContain('nestfair.app/r/x7Kp2QmA');
    expect(out).toContain('Hẻm 51 Linh Trung, Thủ Đức');
    expect(out).toContain('TÌM BẠN Ở GHÉP');
    expect(out).toContain('Quét để xem ảnh, chi phí và lịch trực');
  });

  it('nút gốc có kích thước cố định 1080×1350', () => {
    expect(POSTER_WIDTH).toBe(1080);
    expect(POSTER_HEIGHT).toBe(1350);
    const out = html();
    expect(out).toContain('width:1080px');
    expect(out).toContain('height:1350px');
  });

  it('QR là thẻ svg, cạnh từ 240px trở lên', () => {
    expect(POSTER_QR_SIZE).toBeGreaterThanOrEqual(240);
    const out = html();
    expect(out).toContain('<svg');
    expect(out).toContain(`width="${POSTER_QR_SIZE}"`);
  });

  it('giới tính khác ANY có dòng riêng, ANY thì không', () => {
    expect(html({ genderWanted: 'MALE' })).toContain('Tìm bạn nam');
    expect(html({ genderWanted: 'FEMALE' })).toContain('Tìm bạn nữ');
    const any = html({ genderWanted: 'ANY' });
    expect(any).not.toContain('Tìm bạn nam');
    expect(any).not.toContain('Tìm bạn nữ');
  });

  it('có ảnh bìa thì dùng ảnh cross-origin; không có thì hình minh họa thay thế', () => {
    const withCover = html();
    expect(withCover).toContain('<img');
    expect(withCover).toContain('src="https://res.cloudinary.com/demo/room.jpg"');
    expect(withCover).toContain('crossorigin="anonymous"');
    const without = html({ coverUrl: null });
    expect(without).not.toContain('res.cloudinary.com');
    expect(without).toContain('data-cover-placeholder');
  });

  it('ghi rõ điện nước đã gồm hay chưa gồm', () => {
    expect(html({ utilitiesIncluded: true })).toContain('đã gồm điện nước');
    const no = html({ utilitiesIncluded: false });
    expect(no).toContain('chưa gồm điện nước');
    expect(no).not.toContain('đã gồm điện nước');
  });

  it('đã đủ người thì tiêu đề là "Đã đủ người"', () => {
    expect(html({ slotsOpen: 0 })).toContain('Đã đủ người');
  });

  it('không dùng gradient, blur, filter, mask (làm hỏng html-to-image)', () => {
    const out = html();
    for (const bad of ['gradient', 'blur', 'backdrop-filter', 'filter:', 'mask']) {
      expect(out, bad).not.toContain(bad);
    }
  });
});

describe('PosterPreview', () => {
  it('khung tỷ lệ 4:5 chứa poster', () => {
    const out = renderToStaticMarkup(<PosterPreview {...base} />);
    expect(out).toContain('aspect-ratio:1080 / 1350');
    expect(out).toContain('Còn 1 chỗ ở ghép');
    expect(out).toContain('width:1080px');
  });
});
