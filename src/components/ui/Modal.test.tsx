/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Modal } from './Modal.tsx';

// Vitest thay file .css bằng chuỗi rỗng khi import, nên đọc thẳng từ đĩa.
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

describe('Modal', () => {
  it('gắn lớp nf-modal cho <dialog> để có chuyển động vào/ra', () => {
    const html = renderToStaticMarkup(
      <Modal open={false} onClose={() => {}} title="Thử">
        nội dung
      </Modal>,
    );
    expect(html).toMatch(/<dialog[^>]*class="[^"]*\bnf-modal\b/);
  });

  it('CSS giữ dialog trong top layer tới khi animation ra chạy xong và có trạng thái bắt đầu khi mở', () => {
    expect(css).toMatch(/\.nf-modal[^{]*\{[^}]*transition-behavior:\s*allow-discrete/);
    expect(css).toMatch(/transition-property:[^;]*\boverlay\b/);
    expect(css).toMatch(/@starting-style\s*\{[^@]*\.nf-modal\[open\]/);
  });

  it('dùng token thời lượng, không dịch quá 8px', () => {
    const block = css.slice(css.indexOf('/* Modal'), css.indexOf('/* Hết modal */'));
    expect(block).toContain('var(--dur-base)');
    expect(block).toContain('var(--dur-fast)');
    for (const m of block.matchAll(/translate:\s*0\s+(\d+)px/g)) expect(Number(m[1])).toBeLessThanOrEqual(8);
    expect(block).not.toMatch(/\d+ms/);
  });
});
