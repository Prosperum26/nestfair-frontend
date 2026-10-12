import { CalendarDays } from 'lucide-react';
import { type ComponentProps, useRef } from 'react';
import { autoSlash, isoToVn, vnToIso } from '@/lib/date-input.ts';
import { Input } from './Input.tsx';

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type' | 'rightSlot'> & {
  /** Giá trị ISO "YYYY-MM-DD" (hoặc chuỗi dở dang khi đang gõ). */
  value: string;
  onChange: (value: string) => void;
};

/**
 * Ô nhập ngày hiển thị dd/mm/yyyy bất kể ngôn ngữ trình duyệt (ô type="date" gốc đổi theo locale), kèm nút mở lịch để chọn bằng chuột.
 * Lịch là ô date ẩn: chỉ dùng để chọn, hiển thị vẫn theo dd/mm/yyyy. Giá trị đi qua form là ISO khi đã đủ ngày.
 */
export function DateInput({ value, onChange, id, ...props }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const isIso = /^\d{4}-\d{2}-\d{2}$/.test(value);

  const openPicker = () => {
    const el = picker.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.click();
  };

  return (
    <Input
      id={id}
      inputMode="numeric"
      placeholder="dd/mm/yyyy"
      autoComplete="off"
      maxLength={10}
      {...props}
      value={isoToVn(value)}
      onChange={(e) => onChange(vnToIso(autoSlash(e.target.value)))}
      rightSlot={
        <span className="relative flex">
          <button
            type="button"
            aria-label="Chọn ngày từ lịch"
            onClick={openPicker}
            className="flex size-8 items-center justify-center rounded-btn-sm text-ink-2 hover:bg-paper-2 hover:text-ink focus-visible:outline-none focus-visible:shadow-focus"
          >
            <CalendarDays className="size-[18px]" aria-hidden />
          </button>
          <input
            ref={picker}
            type="date"
            tabIndex={-1}
            aria-hidden
            value={isIso ? value : ''}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          />
        </span>
      }
    />
  );
}
