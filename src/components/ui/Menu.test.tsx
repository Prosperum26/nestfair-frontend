import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Menu } from './Menu.tsx';

describe('Menu', () => {
  it('rootClassName gắn vào khối bọc ngoài (để khối co lại được trong hàng flex)', () => {
    const html = renderToStaticMarkup(
      <Menu rootClassName="min-w-0" trigger={(p) => <button type="button" {...p}>Mở</button>}>
        {() => null}
      </Menu>,
    );
    expect(html).toMatch(/^<div class="relative min-w-0">/);
  });
});
