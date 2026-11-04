import { useId } from 'react';
import { PEOPLE, type PersonKey, shortAmount, type Transfer } from '../debt-demo.ts';
import { edgeGeometry, NODE_POS, NODE_RADIUS } from '../graph.ts';
import { PERSON_SVG, PERSON_TONE } from '../people.ts';

const PILL_H = 16;

/** Vị trí nhãn tiền dọc theo đoạn (0 = gần người nợ), tránh nhãn chồng nhau ở giữa sơ đồ. */
function labelAtFor(t: Transfer): number {
  if (t.from === 'H' && t.to === 'Q') return 0.28;
  if (t.from === 'T' && t.to === 'M') return 0.38;
  return 0.5;
}

/**
 * Sơ đồ nợ 4 người. `before`: nhiều đoạn nối xám; `after`: ít đoạn, mũi tên đậm, nhãn vàng.
 * Mũi tên chỉ từ người nợ tới chủ nợ. Trình đọc màn hình nhận `summary` thay cho hình.
 */
export function DebtGraph({ transfers, variant, summary }: { transfers: readonly Transfer[]; variant: 'before' | 'after'; summary: string }) {
  const markerId = useId();
  const after = variant === 'after';
  const stroke = after ? 'stroke-ink' : 'stroke-line-2';
  const keys = Object.keys(NODE_POS) as PersonKey[];

  return (
    <svg viewBox="0 -14 200 228" className="mx-auto block w-full max-w-[240px]" role="img" aria-label={summary}>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className={after ? 'fill-ink' : 'fill-line-2'} />
        </marker>
      </defs>

      {transfers.map((t) => {
        const g = edgeGeometry(t.from, t.to, labelAtFor(t));
        const label = shortAmount(t.amount);
        const w = label.length * 6 + 12;
        return (
          <g key={`${t.from}${t.to}`}>
            <line
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              className={stroke}
              strokeWidth={after ? 2 : 1.5}
              markerEnd={`url(#${markerId})`}
            />
            <rect
              x={g.labelX - w / 2}
              y={g.labelY - PILL_H / 2}
              width={w}
              height={PILL_H}
              rx={PILL_H / 2}
              className={after ? 'fill-hl stroke-ink' : 'fill-surface stroke-line-2'}
              strokeWidth={after ? 1.2 : 1}
            />
            <text
              x={g.labelX}
              y={g.labelY + 3.5}
              textAnchor="middle"
              className="fill-ink font-mono"
              fontSize="10"
              fontWeight="700"
            >
              {label}
            </text>
          </g>
        );
      })}

      {keys.map((k) => {
        const p = NODE_POS[k];
        const tone = PERSON_SVG[PERSON_TONE[k]];
        const labelY = k === 'M' ? p.y - NODE_RADIUS - 6 : p.y + NODE_RADIUS + 13;
        return (
          <g key={k}>
            <circle cx={p.x} cy={p.y} r={NODE_RADIUS} className={tone.circle} strokeWidth="1.5" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" className={tone.text} fontSize="14" fontWeight="700">
              {k}
            </text>
            <text x={p.x} y={labelY} textAnchor="middle" className="fill-ink-2" fontSize="10" fontWeight="500">
              {PEOPLE[k].name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
