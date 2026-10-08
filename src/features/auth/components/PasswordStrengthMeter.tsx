import { cn } from '@/lib/cn.ts';
import { passwordStrength, STRENGTH_LABELS } from '../password-strength.ts';

const BAR = { 1: 'bg-tom-v', 2: 'bg-mai-v', 3: 'bg-mint-v', 4: 'bg-mint-v' } as const;
const TEXT = { 1: 'text-tom', 2: 'text-hl-ink', 3: 'text-mint', 4: 'text-mint' } as const;

/** 4 vạch h6 r3 + nhãn (preview 03). Ẩn khi chưa nhập. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  if (score === 0) return null;
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn('h-1.5 flex-1 rounded-[3px]', i <= score ? BAR[score] : 'bg-line')}
          />
        ))}
      </div>
      <span className={cn('min-w-[68px] text-right text-cap font-semibold', TEXT[score])}>
        <span className="sr-only">Độ mạnh mật khẩu: </span>
        {STRENGTH_LABELS[score]}
      </span>
    </div>
  );
}
