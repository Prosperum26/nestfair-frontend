import { EyeOff } from 'lucide-react';
import { Chip } from '@/components/ui/Chip.tsx';
import type { PublicRoster } from '../types.ts';
import { rosterNote, rosterStats } from './roster.ts';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

/**
 * Thẻ "Lịch trực tuần này" (ảnh 21). Nhãn TV1… hiện đúng như server trả, client không tự đặt tên.
 * Ẩn hẳn khi không có lịch. Bảng cố định bề rộng nên vừa 360px, không cuộn ngang.
 */
export function RosterTable({ roster }: { roster: PublicRoster | null }) {
  if (!roster || roster.rows.length === 0) return null;
  const note = rosterNote(rosterStats(roster));

  return (
    <section aria-labelledby="public-roster-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-over text-ink-2">VIỆC NHÀ XOAY VÒNG CÔNG BẰNG</p>
          <h2 id="public-roster-title" className="mt-1 font-display text-ct text-ink">
            Lịch trực tuần này
          </h2>
        </div>
        <Chip tone="outline" size="sm" icon={<EyeOff aria-hidden />}>
          Ẩn danh
        </Chip>
      </div>

      <table className="mt-4 w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-[5.25rem] sm:w-[8rem]" />
          {DAYS.map((d) => (
            <col key={d} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <td />
            {DAYS.map((d) => (
              <th key={d} scope="col" className="pb-2 text-center font-mono text-cap font-medium text-ink-2">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roster.rows.map((row, rowIndex) => (
            <tr key={`${row.title}-${rowIndex}`} className="border-t border-line">
              <th scope="row" className="py-2 pr-2 text-left text-sm font-medium break-words text-ink">
                {row.title}
              </th>
              {DAYS.map((d, i) => {
                const labels = row.cells[i] ?? [];
                return (
                  <td key={d} className="px-px py-2 align-middle">
                    {labels.length === 0 ? (
                      <span className="block text-center text-ink-3" aria-label="Không có ca">
                        —
                      </span>
                    ) : (
                      <span className="flex flex-col items-center gap-1">
                        {labels.map((label) => (
                          <span
                            key={label}
                            className="inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-paper-2 px-1 font-mono text-[10px] font-medium text-ink"
                          >
                            {label}
                          </span>
                        ))}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-cap text-ink-2">{note}</p>
    </section>
  );
}
