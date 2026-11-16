/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = (path: string) => new URL(`../${path}`, import.meta.url);
const text = (path: string) => readFileSync(root(path), 'utf8');

describe('favicon NestFair', () => {
  it('index.html chứa link icon svg, ico, apple-touch-icon và theme-color #F6F3EC', () => {
    const html = text('index.html');
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    expect(html).toContain('<link rel="icon" href="/favicon.ico" sizes="48x48" />');
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
    expect(html).toContain('<meta name="theme-color" content="#F6F3EC" />');
  });

  it('favicon.svg dùng màu ink #1C2333 và highlight #F5D547, không còn màu tím #863bff', () => {
    const svg = text('public/favicon.svg').toLowerCase();
    expect(svg).toContain('#1c2333');
    expect(svg).toContain('#f5d547');
    expect(svg).not.toContain('#863bff');
  });

  it('favicon.ico là file ICO hợp lệ với 3 kích thước', () => {
    const ico = readFileSync(root('public/favicon.ico'));
    expect([...ico.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    expect(ico.readUInt16LE(4)).toBe(3);
  });

  it('apple-touch-icon.png là PNG 180x180', () => {
    const png = readFileSync(root('public/apple-touch-icon.png'));
    expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });
});
