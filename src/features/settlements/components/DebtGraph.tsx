import { useId } from 'react';
import { type AvatarTone, avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatShortVnd, formatVnd } from '@/lib/format.ts';
import { edgeGeometry, graphLayout } from '../plan-view.ts';
import type { PlanMember, Transfer } from '../types.ts';

const W = 280;
const H = 260;
const R = 20;

/** Màu node theo màu avatar thành viên (Design.md 2.1): nền nhạt, viền + chữ đậm. */
const NODE: Record<AvatarTone, { fill: string; stroke: string; text: string }> = {
  lil: { fill: 'fill-lil-bg', stroke: 'stroke-lil', text: 'fill-lil' },
  mint: { fill: 'fill-mint-bg', stroke: 'stroke-mint', text: 'fill-mint' },
  yellow: { fill: 'fill-hl-soft', stroke: 'stroke-hl-ink', text: 'fill-hl-ink' },
  sky: { fill: 'fill-sky-bg', stroke: 'stroke-sky', text: 'fill-sky' },
};

/**
 * Sơ đồ nợ (Design.md mục 4, Debt graph). `variant="before"`: cạnh mảnh ink-3, nhãn pill trắng.
 * `variant="after"`: cạnh đậm 2.5px ink, nhãn nền hl viền ink. Có bảng chữ ẩn cho trình đọc màn hình.
 */
export function DebtGraph({
  members,
  transfers,
  variant,
  label,
}: {
  members: PlanMember[];
  transfers: Transfer[];
  variant: 'before' | 'after';
  label: string;
}) {
  const markerId = useId();
  const pos = graphLayout(
    members.map((m) => m.id),
    W,
    H,
  );
  const after = variant === 'after';
  const name = (id: string) => firstName(members.find((m) => m.id === id)?.fullName ?? '?');

  return (
    <figure className="m-0">
      <svg viewBox={`0 -14 ${W} ${H + 32}`} className="mx-auto block w-full max-w-[320px]" role="img" aria-label={label}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className={after ? 'fill-ink' : 'fill-ink-3'} />
          </marker>
        </defs>

        {transfers.map((t) => {
          const from = pos.get(t.fromUserId);
          const to = pos.get(t.toUserId);
          if (!from || !to) return null;
          const g = edgeGeometry(from, to, R);
          return (
            <line
              key={`${t.fromUserId}-${t.toUserId}`}
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              className={after ? 'stroke-ink' : 'stroke-ink-3'}
              strokeWidth={after ? 2.5 : 1.2}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}

        {transfers.map((t) => {
          const from = pos.get(t.fromUserId);
          const to = pos.get(t.toUserId);
          if (!from || !to) return null;
          const g = edgeGeometry(from, to, R);
          const text = formatShortVnd(t.amount);
          const w = text.length * 6.6 + 14;
          return (
            <g key={`label-${t.fromUserId}-${t.toUserId}`}>
              <rect
                x={g.labelX - w / 2}
                y={g.labelY - 9}
                width={w}
                height={18}
                rx={9}
                className={after ? 'fill-hl stroke-ink' : 'fill-surface stroke-line-2'}
                strokeWidth={after ? 1.2 : 1}
              />
              <text x={g.labelX} y={g.labelY + 3.5} textAnchor="middle" className="fill-ink font-mono" fontSize="10.5" fontWeight={after ? 700 : 500}>
                {text}
              </text>
            </g>
          );
        })}

        {members.map((m) => {
          const p = pos.get(m.id)!;
          const tone = NODE[avatarToneFor(m.id)];
          return (
            <g key={m.id}>
              <circle cx={p.x} cy={p.y} r={R} className={cn(tone.fill, tone.stroke)} strokeWidth={1.5} />
              <text x={p.x} y={p.y + 5.5} textAnchor="middle" className={cn(tone.text, 'font-sans')} fontSize="15" fontWeight={700}>
                {firstName(m.fullName).charAt(0).toUpperCase()}
              </text>
              {/* Node nửa trên: tên đặt phía trên để không bị cạnh đi xuống đè lên (như ảnh 09). */}
              <text x={p.x} y={p.y < H / 2 - 1 ? p.y - R - 7 : p.y + R + 15} textAnchor="middle" className="fill-ink-2 font-sans" fontSize="11">
                {firstName(m.fullName)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        {transfers.length === 0
          ? 'Không có khoản nợ nào.'
          : transfers.map((t) => `${name(t.fromUserId)} trả ${name(t.toUserId)} ${formatVnd(t.amount)}`).join('; ')}
      </figcaption>
    </figure>
  );
}
