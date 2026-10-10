import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

const TOOTH = 14; // bề rộng một răng cưa
const DEPTH = 7;

/** Mép dưới răng cưa: SVG lặp theo chiều ngang, nền surface + nét line-2. */
function ZigzagEdge() {
  return (
    <svg className="block h-[8px] w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <pattern id="receipt-teeth" width={TOOTH} height={DEPTH + 1} patternUnits="userSpaceOnUse">
          <path
            d={`M0 0 L${TOOTH / 2} ${DEPTH} L${TOOTH} 0 Z`}
            className="fill-surface stroke-line-2"
            strokeWidth="1"
          />
          <path d={`M-1 0 H${TOOTH + 1}`} className="stroke-surface" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="100%" height={DEPTH + 1} fill="url(#receipt-teeth)" />
    </svg>
  );
}

/** Hóa đơn răng cưa (Design.md mục 4): thẻ bo trên 14, mép dưới răng cưa. */
export function Receipt({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-[300px]', className)}>
      <div className="rounded-t-[14px] border border-b-0 border-line-2 bg-surface px-[21px] pt-[22px] pb-4">
        {children}
      </div>
      <ZigzagEdge />
    </div>
  );
}

/** Dòng sổ cái: avatar + tên · · · · số tiền (mono). */
export function LedgerRow({ left, amount }: { left: ReactNode; amount: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-ink">{left}</div>
      <span className="h-0 flex-1 translate-y-1 border-b-[1.5px] border-dotted border-line-2" />
      <span className="font-mono text-ms text-ink">{amount}</span>
    </div>
  );
}
