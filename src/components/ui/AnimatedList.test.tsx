import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MotionProvider } from '@/components/MotionProvider.tsx';
import { AnimatedList } from './AnimatedList.tsx';
import { InView, InViewItem, Reveal } from './Reveal.tsx';

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
});

describe('InView', () => {
  it('nhóm <ul> hiện lần lượt từng <li>, giữ nguyên nội dung', () => {
    const html = render(
      <InView as="ul" stagger className="grid">
        <InViewItem as="li">Chia tiền</InViewItem>
        <InViewItem as="li">Việc nhà</InViewItem>
      </InView>,
    );
    expect(html.startsWith('<ul class="grid"')).toBe(true);
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('Việc nhà');
  });

  it('chưa cuộn tới thì khối đang ẩn (chờ vào khung nhìn)', () => {
    expect(render(<InView>Hỏi đáp</InView>)).toContain('opacity:0');
  });
});

describe('Reveal', () => {
  it('giữ nguyên nội dung bên trong', () => {
    expect(render(<Reveal>Số dư của bạn</Reveal>)).toContain('Số dư của bạn');
  });
});
