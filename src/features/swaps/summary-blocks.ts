/** Câu cho ba khối của widget Đổi ca ở Tổng quan, từ các số đếm của `GET swaps/summary`. */
export function incomingText(count: number): string {
  return count === 0 ? 'Chưa có yêu cầu nào chờ bạn trả lời' : `${count} yêu cầu chờ bạn trả lời`;
}

export function marketText(count: number): string {
  return count === 0 ? 'Chợ ca đang trống' : `${count} ca đang cần người nhận`;
}

/** Hai chiều nợ giữ riêng, không bù trừ ròng. */
export function debtText(owedByMe: number, owedToMe: number): string {
  if (owedByMe === 0 && owedToMe === 0) return 'Chưa có nợ ca nào';
  const parts: string[] = [];
  if (owedByMe > 0) parts.push(`Bạn nợ ${owedByMe} khoản`);
  if (owedToMe > 0) parts.push(`${owedToMe} khoản nợ bạn`);
  return parts.join(' · ');
}
