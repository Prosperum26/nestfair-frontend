import { useState } from 'react';
import { cn } from '@/lib/cn.ts';

const BOX =
  'flex h-14 min-w-0 max-w-[60px] flex-1 items-center justify-center rounded-btn border bg-surface font-mono text-[26px] font-bold tracking-[-0.6px] text-ink sm:h-[68px] sm:text-[30px]';

/** Chỉ hiển thị mã theo 6 ô (dùng ở trang mã mời). */
export function CodeBoxes({ value, length = 6, className }: { value: string; length?: number; className?: string }) {
  return (
    <div className={cn('flex gap-2 sm:gap-2.5', className)} aria-label={value} role="img">
      {Array.from({ length }, (_, i) => (
        <span key={i} className={cn(BOX, 'border-line-2')} aria-hidden>
          {value[i] ?? ''}
        </span>
      ))}
    </div>
  );
}

interface CodeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Lọc/chuẩn hóa ký tự người dùng gõ hoặc dán. */
  sanitize: (raw: string) => string;
  length?: number;
  invalid?: boolean;
  label: string;
  describedBy?: string;
  onComplete?: () => void;
}

/**
 * Ô nhập mã nhiều ô (Design.md: mỗi ô 48–56 × 1.14, mono 700; ô đang nhập viền 2 ink + halo; lỗi viền tom).
 * Thực chất là một <input> trong suốt phủ lên các ô: dán, xóa, bàn phím di động đều hoạt động tự nhiên.
 */
export function CodeInput({
  id,
  value,
  onChange,
  sanitize,
  length = 6,
  invalid,
  label,
  describedBy,
  onComplete,
}: CodeInputProps) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);

  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        onChange={(e) => {
          const next = sanitize(e.target.value);
          onChange(next);
          if (next.length === length) onComplete?.();
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={length + 4}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="absolute inset-0 z-10 size-full cursor-text opacity-0"
      />
      <div className="flex gap-2 sm:gap-2.5" aria-hidden>
        {Array.from({ length }, (_, i) => {
          const isActive = focused && i === active;
          return (
            <span
              key={i}
              className={cn(
                BOX,
                invalid
                  ? 'border-[1.5px] border-tom'
                  : isActive
                    ? 'border-2 border-ink shadow-focus'
                    : 'border-line-2',
              )}
            >
              {value[i] ??
                (isActive && <span className="h-7 w-px animate-pulse bg-ink sm:h-8" />)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
