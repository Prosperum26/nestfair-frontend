import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { geolocationErrorMessage, isGoogleMapsUrl, MAP_URL_MAX, mapsUrlFromCoords, roundCoord } from './map-location.ts';

describe('isGoogleMapsUrl (cùng luật với backend)', () => {
  it('nhận link Google Maps https: đầy đủ, rút gọn, tọa độ, tên miền .vn', () => {
    for (const ok of [
      'https://www.google.com/maps/place/UIT/@10.870,106.803,17z',
      'https://google.com/maps?q=10.870,106.803',
      'https://maps.google.com/?q=10.870,106.803',
      'https://maps.app.goo.gl/AbCdEf123',
      'https://goo.gl/maps/AbCdEf123',
      'https://www.google.com.vn/maps/place/UIT',
    ]) {
      expect(isGoogleMapsUrl(ok), ok).toBe(true);
    }
  });

  it('từ chối link không phải https hoặc không phải Google Maps', () => {
    for (const bad of [
      'http://www.google.com/maps',
      'javascript:alert(1)',
      'https://www.google.com/search?q=uit',
      'https://google.com.evil.com/maps',
      'https://goo.gl/AbCdEf',
      'https://user:pass@www.google.com/maps',
      'https://www.google.com:8443/maps',
      'https://www.google.com/maps?q=' + 'a'.repeat(MAP_URL_MAX),
      'www.google.com/maps',
      '',
    ]) {
      expect(isGoogleMapsUrl(bad), bad).toBe(false);
    }
  });
});

describe('roundCoord', () => {
  it('làm tròn 3 chữ số thập phân (~100m), không còn số lẻ dư', () => {
    expect(roundCoord(10.870_456)).toBe(10.87);
    expect(roundCoord(106.802_6)).toBe(106.803);
    expect(roundCoord(-33.856_78)).toBe(-33.857);
    expect(roundCoord(0.000_4)).toBe(0);
  });
});

describe('mapsUrlFromCoords', () => {
  it('tạo link tìm kiếm Google Maps từ tọa độ đã làm tròn và link đó qua được luật kiểm', () => {
    const url = mapsUrlFromCoords(10.870_456, 106.802_6);
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=10.87,106.803');
    expect(isGoogleMapsUrl(url)).toBe(true);
  });
});

describe('geolocationErrorMessage', () => {
  it('câu tiếng Việt cho từng mã lỗi của Geolocation API', () => {
    expect(geolocationErrorMessage(1)).toMatch(/quyền vị trí/);
    expect(geolocationErrorMessage(2)).toMatch(/Không xác định được vị trí/);
    expect(geolocationErrorMessage(3)).toMatch(/quá lâu/);
    expect(geolocationErrorMessage('unsupported')).toMatch(/không hỗ trợ/);
  });
});

/** Bảng vector dùng chung với backend (src/modules/listing/algorithms/map-url.vectors.json): hai bên phải trả cùng kết quả. */
describe('isGoogleMapsUrl theo bảng vector dùng chung', () => {
  const vectors = JSON.parse(readFileSync(new URL('./map-url.vectors.json', import.meta.url), 'utf8')) as {
    valid: string[];
    invalid: string[];
  };
  const expand = (v: string) => v.replace('{LONG}', 'a'.repeat(MAP_URL_MAX));

  it.each(vectors.valid)('nhận %s', (v) => {
    expect(isGoogleMapsUrl(expand(v))).toBe(true);
  });

  it.each(vectors.invalid)('từ chối %s', (v) => {
    expect(isGoogleMapsUrl(expand(v))).toBe(false);
  });
});
