import { formatVndInput } from '@/lib/format.ts';
import type { GenderWanted, OtherFee } from './types.ts';

/** Đọc ô nhập tiền: chấp nhận "1.200.000", "1200000", "1 200 000". Có chữ cái hoặc rỗng thì null. */
export function parseMoneyInput(raw: string): number | null {
  const text = raw.trim();
  if (!text || /[^\d.\s]/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : null;
}

/** 1200000 -> "1.200.000" (không có đ, dùng trong ô nhập). */
export function formatMoneyInput(n: number): string {
  return formatVndInput(n);
}

/** Tiêu đề tự sinh của tin và poster (L10). */
export function listingHeadline(slotsOpen: number): string {
  return slotsOpen > 0 ? `Còn ${slotsOpen} chỗ ở ghép` : 'Đã đủ người';
}

export function genderLabel(g: GenderWanted): string {
  return { MALE: 'Nam', FEMALE: 'Nữ', ANY: 'Không yêu cầu giới tính' }[g];
}

/** Dòng giới tính trên poster; ANY thì không in dòng nào. */
export function genderPosterLine(g: GenderWanted): string | null {
  return { MALE: 'Tìm bạn nam', FEMALE: 'Tìm bạn nữ', ANY: null }[g];
}

interface CostInput {
  rentPerMonth: number;
  /** null = nhà chưa có dữ liệu điện nước. */
  utilitiesPerPerson: number | null;
  otherFees: readonly { amount: number }[];
}

/** Ước tính mỗi người mỗi tháng. Cùng công thức backend (B2) để xem trước khi form chưa lưu. */
export function estimateTotal({ rentPerMonth, utilitiesPerPerson, otherFees }: CostInput): number {
  return rentPerMonth + (utilitiesPerPerson ?? 0) + otherFees.reduce((sum, f) => sum + f.amount, 0);
}

/** Các dòng bảng chi phí: tổng các dòng bằng estimateTotal. Chưa có điện nước thì không có dòng đó. */
export function costLines(
  input: Omit<CostInput, 'otherFees'> & { utilitiesMonthsUsed: number | null; otherFees: readonly OtherFee[] },
): { label: string; amount: number }[] {
  const lines = [{ label: 'Tiền thuê', amount: input.rentPerMonth }];
  if (input.utilitiesPerPerson !== null) {
    const months = input.utilitiesMonthsUsed;
    lines.push({
      label: months ? `Điện nước (TB ${months} tháng)` : 'Điện nước',
      amount: input.utilitiesPerPerson,
    });
  }
  return [...lines, ...input.otherFees.map((f) => ({ label: f.name, amount: f.amount }))];
}

/** "http://host:5173/r/abc" -> "host:5173/r/abc" (in dưới QR trên poster). */
export function publicUrlDisplay(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}
