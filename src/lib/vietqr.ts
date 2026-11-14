import { firstName } from './date.ts';
import { toAsciiUpper, toBankAccountName } from './text.ts';

/**
 * Payload VietQR theo chuẩn EMVCo Merchant-Presented QR của Napas 247 (chuyển nhanh tới tài khoản).
 * Sinh ngay trên trình duyệt, không gọi dịch vụ ngoài: app ngân hàng nào quét cũng điền sẵn
 * ngân hàng, STK, số tiền và nội dung. Tên người nhận do ngân hàng tự tra từ STK.
 */

/** Định danh Napas trong trường 38 (Merchant Account Information). */
const NAPAS_GUID = 'A000000727';
/** Dịch vụ chuyển nhanh Napas 247 tới tài khoản (khác QRIBFTTC là tới thẻ). */
const SERVICE_TO_ACCOUNT = 'QRIBFTTA';
/** Giới hạn trường "Purpose of transaction" (62.08) của EMVCo. */
export const MAX_CONTENT_LENGTH = 25;

const tlv = (id: string, value: string) => `${id}${value.length.toString().padStart(2, '0')}${value}`;

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), 4 ký tự hex in hoa: checksum bắt buộc ở trường 63. */
export function crc16ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Nội dung chuyển khoản an toàn cho mọi ngân hàng: bỏ dấu, viết hoa, chỉ chữ/số/khoảng trắng, ≤ 25 ký tự. */
export function sanitizeContent(text: string): string {
  return toAsciiUpper(text)
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONTENT_LENGTH)
    .trim();
}

export interface VietQrInput {
  /** Mã BIN 6 số của ngân hàng (Napas). */
  bin: string;
  account: string;
  /** Số nguyên VNĐ. Bỏ trống = QR tĩnh, người chuyển tự nhập số tiền. */
  amount?: number;
  content?: string;
}

export function buildVietQrPayload({ bin, account, amount, content }: VietQrInput): string {
  if (!/^\d{6}$/.test(bin)) throw new Error('Mã BIN ngân hàng phải gồm 6 chữ số.');
  if (!/^[0-9A-Za-z]{1,19}$/.test(account)) throw new Error('Số tài khoản không hợp lệ.');
  if (amount !== undefined && (!Number.isSafeInteger(amount) || amount <= 0)) {
    throw new Error('Số tiền phải là số nguyên VNĐ lớn hơn 0.');
  }

  const beneficiary = tlv('00', bin) + tlv('01', account);
  const merchant = tlv('00', NAPAS_GUID) + tlv('01', beneficiary) + tlv('02', SERVICE_TO_ACCOUNT);
  const purpose = content ? sanitizeContent(content) : '';

  const body =
    tlv('00', '01') +
    // 12 = QR động (dùng một lần, có số tiền), 11 = QR tĩnh.
    tlv('01', amount ? '12' : '11') +
    tlv('38', merchant) +
    tlv('53', '704') +
    (amount ? tlv('54', String(amount)) : '') +
    tlv('58', 'VN') +
    (purpose ? tlv('62', tlv('08', purpose)) : '') +
    '6304';
  return body + crc16ccitt(body);
}

/** Đọc một tầng TLV (dùng cho test và kiểm tra lại payload). */
export function parseTlv(payload: string): Map<string, string> {
  const out = new Map<string, string>();
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(id) || Number.isNaN(len)) throw new Error(`TLV hỏng tại vị trí ${i}`);
    out.set(id, payload.slice(i + 4, i + 4 + len));
    i += 4 + len;
  }
  return out;
}

/** Mã nhà ngắn: "Nhà 12A" → "12A", "Phòng 404 KTX" → "404KTX" (tối đa 6 ký tự). */
function houseCode(houseName: string): string {
  return toAsciiUpper(houseName)
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^(NHA|PHONG)/, '')
    .slice(0, 6);
}

/**
 * Nội dung chuyển khoản dễ đối chiếu: "NF12A HUNG TRA QUAN T10" (mã nhà · người trả · người nhận · tháng).
 * Quá 25 ký tự thì bỏ mã nhà trước, sau đó mới cắt.
 */
export function buildTransferContent({
  houseName,
  fromName,
  toName,
  month,
}: {
  houseName: string;
  fromName: string;
  toName: string;
  month: number;
}): string {
  const name = (full: string) => toBankAccountName(firstName(full));
  const core = `${name(fromName)} TRA ${name(toName)} T${month}`;
  const code = houseCode(houseName);
  const full = code ? `NF${code} ${core}` : `NF ${core}`;
  return sanitizeContent(full.length <= MAX_CONTENT_LENGTH ? full : core);
}
