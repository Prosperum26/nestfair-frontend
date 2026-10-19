import { describe, expect, it } from 'vitest';
import { buildTransferContent, buildVietQrPayload, crc16ccitt, parseTlv } from './vietqr.ts';

describe('crc16ccitt (CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF)', () => {
  it('vector chuẩn "123456789" → 29B1', () => {
    expect(crc16ccitt('123456789')).toBe('29B1');
  });
  it('chuỗi rỗng → FFFF; luôn 4 ký tự hex in hoa', () => {
    expect(crc16ccitt('')).toBe('FFFF');
    expect(crc16ccitt('A')).toMatch(/^[0-9A-F]{4}$/);
  });
});

describe('buildVietQrPayload (EMVCo / Napas 247)', () => {
  const mb = { bin: '970422', account: '0801234566789', amount: 170_000, content: 'NF12A HUNG TRA QUAN T10' };

  it('đúng cấu trúc TLV: version, QR động, Napas GUID, BIN + STK, chuyển nhanh tới tài khoản, VND, số tiền, VN, nội dung', () => {
    const payload = buildVietQrPayload(mb);
    const top = parseTlv(payload);
    expect(top.get('00')).toBe('01');
    expect(top.get('01')).toBe('12');
    expect(top.get('53')).toBe('704');
    expect(top.get('54')).toBe('170000');
    expect(top.get('58')).toBe('VN');

    const merchant = parseTlv(top.get('38')!);
    expect(merchant.get('00')).toBe('A000000727');
    expect(merchant.get('02')).toBe('QRIBFTTA');
    const beneficiary = parseTlv(merchant.get('01')!);
    expect(beneficiary.get('00')).toBe('970422');
    expect(beneficiary.get('01')).toBe('0801234566789');

    expect(parseTlv(top.get('62')!).get('08')).toBe('NF12A HUNG TRA QUAN T10');
  });

  it('thứ tự trường đúng chuẩn và kết thúc bằng 6304 + CRC của toàn bộ phần trước', () => {
    const payload = buildVietQrPayload(mb);
    expect([...parseTlv(payload).keys()]).toEqual(['00', '01', '38', '53', '54', '58', '62', '63']);
    const body = payload.slice(0, -4);
    expect(body.endsWith('6304')).toBe(true);
    expect(payload.slice(-4)).toBe(crc16ccitt(body));
  });

  it('chuỗi cố định cho tài khoản mẫu (khóa định dạng, đổi một byte là test đỏ)', () => {
    expect(buildVietQrPayload({ bin: '970436', account: '0071000444456', amount: 380_000, content: 'NF12A THIEN TRA MAI T10' })).toBe(
      '00020101021238570010A00000072701270006970436011300710004444560208QRIBFTTA530370454063800005802VN62270823NF12A THIEN TRA MAI T106304' +
        crc16ccitt(
          '00020101021238570010A00000072701270006970436011300710004444560208QRIBFTTA530370454063800005802VN62270823NF12A THIEN TRA MAI T106304',
        ),
    );
  });

  // Vector công bố trong README thư viện vietnam-qr-pay (npm), độc lập với code này.
  it('khớp vector công bố: QR tĩnh ACB 257678859', () => {
    expect(buildVietQrPayload({ bin: '970416', account: '257678859' })).toBe(
      '00020101021138530010A0000007270123000697041601092576788590208QRIBFTTA53037045802VN6304AE9F',
    );
  });

  // Sinh bằng vietnam-qr-pay@npm (QRPay.initVietQR) với dữ liệu seed Nhà 12A: phải trùng từng ký tự.
  it.each([
    [
      { bin: '970422', account: '0801234566789', amount: 170_000, content: 'NF12A HUNG TRA QUAN T10' },
      '00020101021238570010A00000072701270006970422011308012345667890208QRIBFTTA530370454061700005802VN62270823NF12A HUNG TRA QUAN T10630415EA',
    ],
    [
      { bin: '970436', account: '0071000444456', amount: 380_000, content: 'NF12A THIEN TRA MAI T10' },
      '00020101021238570010A00000072701270006970436011300710004444560208QRIBFTTA530370454063800005802VN62270823NF12A THIEN TRA MAI T106304FCE8',
    ],
    [{ bin: '970407', account: '19036780123' }, '00020101021138550010A000000727012500069704070111190367801230208QRIBFTTA53037045802VN63049E4B'],
  ])('khớp thư viện tham chiếu %#', (input, expected) => {
    expect(buildVietQrPayload(input)).toBe(expected);
  });

  it('khớp CRC của vector công bố: QR động 10.000đ "Chuyen tien"', () => {
    const published =
      '00020101021238530010A0000007270123000697041601092576788590208QRIBFTTA53037045405100005802VN62150811Chuyen tien630453E6';
    expect(crc16ccitt(published.slice(0, -4))).toBe('53E6');
    // Cùng đầu vào thì cấu trúc của mình chỉ khác ở nội dung (mình viết hoa) nên phần trước trường 62 trùng khớp.
    const mine = buildVietQrPayload({ bin: '970416', account: '257678859', amount: 10_000, content: 'Chuyen tien' });
    expect(mine.split('6215')[0]).toBe(published.split('6215')[0]);
  });

  it('không có số tiền → QR tĩnh (01 = 11), bỏ trường 54; không có nội dung → bỏ trường 62', () => {
    const top = parseTlv(buildVietQrPayload({ bin: '970407', account: '19036780123' }));
    expect(top.get('01')).toBe('11');
    expect(top.has('54')).toBe(false);
    expect(top.has('62')).toBe(false);
  });

  it('nội dung được làm sạch: bỏ dấu, viết hoa, chỉ chữ/số/khoảng trắng, tối đa 25 ký tự', () => {
    const top = parseTlv(buildVietQrPayload({ ...mb, content: 'Tiền điện tháng 10 của nhà mình nè!!' }));
    const content = parseTlv(top.get('62')!).get('08')!;
    expect(content).toBe('TIEN DIEN THANG 10 CUA NH');
    expect(content.length).toBeLessThanOrEqual(25);
  });

  it.each([
    [{ ...mb, bin: '97042' }, /BIN/],
    [{ ...mb, account: '12 34' }, /tài khoản/],
    [{ ...mb, account: '1'.repeat(20) }, /tài khoản/],
    [{ ...mb, amount: 0 }, /Số tiền/],
    [{ ...mb, amount: 1000.5 }, /Số tiền/],
  ])('từ chối đầu vào sai %#', (input, message) => {
    expect(() => buildVietQrPayload(input)).toThrow(message);
  });
});

describe('buildTransferContent', () => {
  it('mẫu thiết kế: NF12A HUNG TRA QUAN T10', () => {
    expect(buildTransferContent({ houseName: 'Nhà 12A', fromName: 'Trần Minh Hùng', toName: 'Nguyễn Minh Quân', month: 10 })).toBe(
      'NF12A HUNG TRA QUAN T10',
    );
  });

  it('mã nhà: bỏ chữ "Nhà"/"Phòng", bỏ khoảng trắng, tối đa 6 ký tự', () => {
    expect(buildTransferContent({ houseName: 'Phòng 404 KTX', fromName: 'Thiện', toName: 'Mai', month: 9 })).toBe('NF404KTX THIEN TRA MAI T9');
    expect(buildTransferContent({ houseName: 'Chung cư Sunrise', fromName: 'Lan', toName: 'Huệ', month: 1 })).toBe('NFCHUNGC LAN TRA HUE T1');
  });

  it('luôn ≤ 25 ký tự: bỏ mã nhà trước, rồi mới cắt tên', () => {
    const long = buildTransferContent({ houseName: 'Nhà 12A', fromName: 'Nguyễn Thị Phương Khánh', toName: 'Trần Bảo Ngọc Trâm', month: 12 });
    expect(long.length).toBeLessThanOrEqual(25);
    expect(long).toContain('KHANH TRA TRAM T12');
  });
});
