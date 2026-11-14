import { cn } from '@/lib/cn.ts';

type StampTone = 'hl' | 'mint' | 'lil' | 'tom' | 'sky';

const tones: Record<StampTone, { stroke: string; fill: string; text: string }> = {
  hl: { stroke: 'stroke-hl', fill: 'fill-hl', text: 'fill-hl' },
  mint: { stroke: 'stroke-mint', fill: 'fill-mint', text: 'fill-mint' },
  lil: { stroke: 'stroke-lil', fill: 'fill-lil', text: 'fill-lil' },
  tom: { stroke: 'stroke-tom', fill: 'fill-tom', text: 'fill-tom' },
  sky: { stroke: 'stroke-sky', fill: 'fill-sky', text: 'fill-sky' },
};

/**
 * Con dấu tròn 112px (Design.md mục 4): vòng ngoài 3px, vòng trong 1.2px,
 * băng đặc giữa chứa chữ trắng, trên "NESTFAIR", dưới là ngày.
 */
export function Stamp({
  label,
  date,
  tone = 'hl',
  rotate = -12,
  className,
}: {
  label: string;
  date: string;
  tone?: StampTone;
  rotate?: number;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <svg
      viewBox="0 0 112 112"
      className={cn('size-28 opacity-[0.92]', className)}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <circle cx="56" cy="56" r="52" className={cn(t.stroke, 'fill-none')} strokeWidth="3" />
      <circle cx="56" cy="56" r="45" className={cn(t.stroke, 'fill-none')} strokeWidth="1.2" />
      <rect x="8" y="41.7" width="96" height="26.4" className={t.fill} />
      <text
        x="56"
        y="62"
        textAnchor="middle"
        className="fill-white font-sans"
        fontSize="17"
        fontWeight="700"
        letterSpacing="1"
      >
        {label}
      </text>
      <text x="56" y="34" textAnchor="middle" className={cn(t.text, 'font-mono')} fontSize="9" fontWeight="700">
        NESTFAIR
      </text>
      <text x="56" y="85.7" textAnchor="middle" className={cn(t.text, 'font-mono')} fontSize="9" fontWeight="700">
        {date}
      </text>
    </svg>
  );
}
