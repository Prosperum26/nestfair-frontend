import { describe, expect, it } from 'vitest';
import { canExportPoster, needsWarmup, posterFilename } from './poster-export.ts';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
  ipadSafari:
    'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  chromeWindows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  edgeWindows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
};

describe('canExportPoster', () => {
  it('chỉ cho xuất khi tin đang OPEN (QR của tin chưa đăng là liên kết chết)', () => {
    expect(canExportPoster('OPEN')).toBe(true);
    expect(canExportPoster('DRAFT')).toBe(false);
    expect(canExportPoster('CLOSED')).toBe(false);
    expect(canExportPoster(null)).toBe(false);
  });
});

describe('posterFilename', () => {
  it('nestfair-poster-<slug>.png', () => {
    expect(posterFilename('x7Kp2QmA')).toBe('nestfair-poster-x7Kp2QmA.png');
  });
});

describe('needsWarmup (Safari / iOS xuất hai lần, lần đầu bỏ đi)', () => {
  it.each([
    ['iPhone Safari', UA.iphoneSafari],
    ['iPhone Chrome (vẫn là WebKit)', UA.iphoneChrome],
    ['iPad Safari', UA.ipadSafari],
    ['Safari macOS', UA.macSafari],
  ])('%s -> true', (_name, ua) => {
    expect(needsWarmup(ua)).toBe(true);
  });

  it.each([
    ['Chrome Windows', UA.chromeWindows],
    ['Edge Windows', UA.edgeWindows],
    ['Chrome Android', UA.androidChrome],
    ['Firefox', UA.firefox],
    ['chuỗi rỗng', ''],
  ])('%s -> false', (_name, ua) => {
    expect(needsWarmup(ua)).toBe(false);
  });
});
