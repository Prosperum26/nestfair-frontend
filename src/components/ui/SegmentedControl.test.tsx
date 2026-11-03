import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SegmentedControl } from './SegmentedControl.tsx';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

describe('SegmentedControl', () => {
  it('mặc định cao 36px (h-9), không đổi so với các nơi đang dùng', () => {
    const html = renderToStaticMarkup(<SegmentedControl label="x" options={options} value="a" onChange={() => {}} />);
    expect(html).toContain('h-9');
    expect(html).not.toContain('h-11');
  });

  it('size="lg" cao 44px (h-11) cho vùng bấm trên mobile', () => {
    const html = renderToStaticMarkup(<SegmentedControl label="x" size="lg" options={options} value="a" onChange={() => {}} />);
    expect(html).toContain('h-11');
    expect(html).not.toContain('h-9');
  });
});
