import type { ComponentProps } from 'react';
import { autoSlash, isoToVn, vnToIso } from '@/lib/date-input.ts';
import { Input } from './Input.tsx';

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  /** Giá trị ISO "YYYY-MM-DD" (hoặc chuỗi dở dang khi đang gõ). */
  value: string;
  onChange: (value: string) => void;
};

/**
 * Ô nhập ngày hiển thị dd/mm/yyyy bất kể ngôn ngữ trình duyệt (ô type="date" gốc đổi theo locale).
 * Giá trị đi qua form luôn là ISO khi đã đủ ngày; chưa đủ thì giữ chuỗi gõ để schema báo lỗi.
 */
export function DateInput({ value, onChange, ...props }: Props) {
  return (
    <Input
      inputMode="numeric"
      placeholder="dd/mm/yyyy"
      autoComplete="off"
      maxLength={10}
      {...props}
      value={isoToVn(value)}
      onChange={(e) => onChange(vnToIso(autoSlash(e.target.value)))}
    />
  );
}
