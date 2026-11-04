import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Gallery } from './Gallery.tsx';

const p = (id: string) => ({ id, url: `https://img.test/${id}.jpg` });

describe('Gallery', () => {
  const photos = { BEDROOM: [p('b1'), p('b2')], BATHROOM: [p('w1')], LIVING: [p('l1')] };

  it('ảnh lớn là ảnh đầu tiên, alt có nghĩa, chip chỉ số 1 / 4', () => {
    const html = renderToStaticMarkup(<Gallery photos={photos} />);
    expect(html).toContain('src="https://img.test/b1.jpg"');
    expect(html).toContain('alt="Phòng ngủ 1"');
    expect(html).toContain('1 / 4');
  });

  it('có thẻ nhóm kèm số ảnh; hàng ảnh nhỏ chỉ có ảnh của nhóm đang chọn và tải lười', () => {
    const html = renderToStaticMarkup(<Gallery photos={photos} />);
    expect(html).toContain('Phòng ngủ 2');
    expect(html).toContain('Vệ sinh 1');
    expect(html).toContain('Sinh hoạt 1');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('Xem ảnh Phòng ngủ 2');
    expect(html).not.toContain('Xem ảnh Phòng vệ sinh 1');
  });

  it('có nút trước và sau khi có hơn một ảnh', () => {
    const html = renderToStaticMarkup(<Gallery photos={photos} />);
    expect(html).toContain('aria-label="Ảnh trước"');
    expect(html).toContain('aria-label="Ảnh sau"');
  });

  it('chỉ một ảnh thì không có nút trước/sau và không có thẻ nhóm', () => {
    const html = renderToStaticMarkup(<Gallery photos={{ BEDROOM: [p('b1')], BATHROOM: [], LIVING: [] }} />);
    expect(html).not.toContain('Ảnh trước');
    expect(html).not.toContain('radiogroup');
    expect(html).toContain('1 / 1');
  });

  it('không có ảnh nào thì hiện hình minh họa thay thế, không có thẻ img', () => {
    const html = renderToStaticMarkup(<Gallery photos={{ BEDROOM: [], BATHROOM: [], LIVING: [] }} />);
    expect(html).toContain('data-gallery-placeholder');
    expect(html).not.toContain('<img');
  });
});
