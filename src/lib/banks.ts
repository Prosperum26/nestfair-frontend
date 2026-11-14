/**
 * Ngân hàng phổ biến theo mã BIN Napas (dùng cho VietQR: img.vietqr.io/image/<BIN>-<STK>-compact2.png).
 * short: tên viết tắt hiển thị trên thẻ thành viên ("TCB ·0123").
 */
export const BANKS = [
  { bin: '970436', short: 'VCB', name: 'Vietcombank' },
  { bin: '970407', short: 'TCB', name: 'Techcombank' },
  { bin: '970422', short: 'MB', name: 'MB Bank' },
  { bin: '970416', short: 'ACB', name: 'ACB' },
  { bin: '970418', short: 'BIDV', name: 'BIDV' },
  { bin: '970415', short: 'CTG', name: 'VietinBank' },
  { bin: '970405', short: 'AGR', name: 'Agribank' },
  { bin: '970423', short: 'TPB', name: 'TPBank' },
  { bin: '970432', short: 'VPB', name: 'VPBank' },
  { bin: '970403', short: 'STB', name: 'Sacombank' },
  { bin: '970441', short: 'VIB', name: 'VIB' },
  { bin: '970443', short: 'SHB', name: 'SHB' },
  { bin: '970437', short: 'HDB', name: 'HDBank' },
  { bin: '970448', short: 'OCB', name: 'OCB' },
  { bin: '970426', short: 'MSB', name: 'MSB' },
  { bin: '970431', short: 'EIB', name: 'Eximbank' },
  { bin: '970440', short: 'SEAB', name: 'SeABank' },
  { bin: '970449', short: 'LPB', name: 'LPBank' },
  { bin: '970428', short: 'NAB', name: 'Nam A Bank' },
  { bin: '970454', short: 'BVB', name: 'Bản Việt' },
] as const;

/** "TCB ·0123"; chưa có ngân hàng thì null. BIN lạ thì hiện chính mã BIN. */
export function bankLabel(bin: string | null, last4: string | null): string | null {
  if (!bin || !last4) return null;
  const short = BANKS.find((b) => b.bin === bin)?.short ?? bin;
  return `${short} ·${last4}`;
}

/** Tên ngân hàng đầy đủ theo BIN ("MB Bank"); BIN lạ thì "Ngân hàng <BIN>". */
export function bankName(bin: string): string {
  return BANKS.find((b) => b.bin === bin)?.name ?? `Ngân hàng ${bin}`;
}
