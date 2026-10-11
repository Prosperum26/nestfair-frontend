import { describe, expect, it } from 'vitest';
import { MAX_PROOF_BYTES, MAX_RAW_BYTES, needsConversion, validateCompressed, validateProofImage } from './image-check.ts';

describe('validateProofImage (trước khi nén)', () => {
  it('jpeg, png, webp hợp lệ', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateProofImage({ type, size: 1_000_000 }), type).toBeNull();
    }
  });

  it('HEIC/HEIF của iPhone được nhận để chuyển sang JPEG', () => {
    expect(validateProofImage({ type: 'image/heic', size: 2_000_000 })).toBeNull();
    expect(validateProofImage({ type: 'image/heif', size: 2_000_000 })).toBeNull();
    expect(needsConversion('image/heic')).toBe(true);
    expect(needsConversion('image/jpeg')).toBe(false);
  });

  it('gif và định dạng khác bị từ chối với thông báo tiếng Việt', () => {
    expect(validateProofImage({ type: 'image/gif', size: 1000 })).toBe('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');
    expect(validateProofImage({ type: '', size: 1000 })).toBe('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');
  });

  it('ảnh gốc từ camera (vài MB) vẫn được nhận để nén; quá giới hạn thô thì từ chối', () => {
    expect(validateProofImage({ type: 'image/jpeg', size: MAX_PROOF_BYTES + 1 })).toBeNull();
    expect(validateProofImage({ type: 'image/jpeg', size: MAX_RAW_BYTES })).toBeNull();
    expect(validateProofImage({ type: 'image/jpeg', size: MAX_RAW_BYTES + 1 })).toBe('Ảnh quá lớn, hãy chọn ảnh nhỏ hơn 25MB.');
  });
});

describe('validateCompressed (sau khi nén, đúng quy tắc server)', () => {
  it('đúng 5MB thì nhận, hơn 5MB một byte thì từ chối', () => {
    expect(validateCompressed({ type: 'image/jpeg', size: MAX_PROOF_BYTES })).toBeNull();
    expect(validateCompressed({ type: 'image/jpeg', size: MAX_PROOF_BYTES + 1 })).toBe('Ảnh tối đa 5MB.');
  });

  it('kết quả không phải jpeg/png/webp (nén HEIC thất bại) thì báo hướng dẫn', () => {
    expect(validateCompressed({ type: 'image/heic', size: 1000 })).toContain('HEIC');
  });
});
