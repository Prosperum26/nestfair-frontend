import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MotionProvider } from '@/components/MotionProvider.tsx';
import { AnimatedList } from './AnimatedList.tsx';
import { shouldUseLayout } from './list-layout.ts';
import { Reveal } from './Reveal.tsx';

const items = [
  { id: 'a', label: 'Tiền điện' },
  { id: 'b', label: 'Tiền nước' },
  { id: 'c', label: 'Internet' },
];

const render = (node: React.ReactNode) => renderToStaticMarkup(<MotionProvider>{node}</MotionProvider>);

describe('AnimatedList', () => {
  it('render đủ item theo đúng thứ tự trong <ul>/<li>', () => {
    const html = render(<AnimatedList as="ul" items={items} getKey={(i) => i.id} render={(i) => i.label} />);
    expect(html.startsWith('<ul')).toBe(true);
    expect(html.match(/<li/g)).toHaveLength(3);
    expect(html.indexOf('Tiền điện')).toBeLessThan(html.indexOf('Tiền nước'));
    expect(html.indexOf('Tiền nước')).toBeLessThan(html.indexOf('Internet'));
  });

  it('mặc định là <div> và item là <div>', () => {
    const html = render(<AnimatedList items={items} getKey={(i) => i.id} render={(i) => i.label} />);
    expect(html.startsWith('<div')).toBe(true);
    expect(html).not.toContain('<li');
  });

  it('tắt layout animation khi danh sách dài hơn 50', () => {
    expect(shouldUseLayout(50)).toBe(true);
    expect(shouldUseLayout(51)).toBe(false);
  });
});

describe('Reveal', () => {
  it('giữ nguyên nội dung bên trong', () => {
    expect(render(<Reveal>Số dư của bạn</Reveal>)).toContain('Số dư của bạn');
  });
});
