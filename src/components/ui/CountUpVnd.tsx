import { formatSignedVnd, formatVnd } from '@/lib/format.ts';
import { useCountUp } from '@/lib/use-count-up.ts';

/**
 * Số tiền đếm tới giá trị mới (định dạng `2.280.000đ`, hoặc có dấu +/− khi `signed`). Trình đọc màn hình
 * đọc thẳng giá trị cuối, không đọc từng bước đếm.
 */
export function CountUpVnd({ value, signed = false }: { value: number; signed?: boolean }) {
  const shown = useCountUp(value);
  const format = signed ? formatSignedVnd : formatVnd;
  return (
    <>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}
