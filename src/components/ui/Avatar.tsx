import { cn } from '@/lib/cn.ts';
import type { AvatarTone } from './tones.ts';

const tones: Record<AvatarTone, string> = {
  lil: 'bg-lil-bg text-lil',
  mint: 'bg-mint-bg text-mint',
  yellow: 'bg-hl-soft text-hl-ink',
  sky: 'bg-sky-bg text-sky',
};

/**
 * Tròn, chữ cái đầu Inter 600 cỡ size × 0.42 (Design.md mục 3).
 * Chữ cái lấy từ tên gọi (từ cuối): "Trần Minh Hùng" -> "H". Có ảnh thì hiện ảnh.
 */
export function Avatar({
  name,
  tone,
  src,
  size = 32,
  className,
}: {
  name: string;
  tone: AvatarTone;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initial = (name.trim().split(/\s+/).at(-1) ?? name).charAt(0).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }
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
      {initial}
    </span>
  );
}
