import { cn } from '@/lib/cn.ts';

export type AvatarTone = 'lil' | 'mint' | 'yellow' | 'sky';

const tones: Record<AvatarTone, string> = {
  lil: 'bg-lil-bg text-lil',
  mint: 'bg-mint-bg text-mint',
  yellow: 'bg-hl-soft text-hl-ink',
  sky: 'bg-sky-bg text-sky',
};

/** Tròn, chữ cái đầu Inter 600 cỡ size × 0.42 (Design.md mục 3). */
export function Avatar({
  name,
  tone,
  size = 32,
  className,
}: {
  name: string;
  tone: AvatarTone;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        tones[tone],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
