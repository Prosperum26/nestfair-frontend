import { Info, TriangleAlert } from 'lucide-react';
import { reasonsFor } from '../reasons.ts';
import type { ScheduleMeta } from '../types.ts';

/** Banner lịch tuần: lý do bằng tiếng Việt (nới rào, nhà nhỏ, vắng mặt…). Không hiện gì khi chưa có lịch hoặc không có lý do. */
export function ScheduleBanner({ schedule }: { schedule: ScheduleMeta | null }) {
  if (!schedule) return null;
  const reasons = reasonsFor(schedule);
  if (reasons.length === 0) return null;
  const Icon = schedule.relaxed ? TriangleAlert : Info;
  return (
    <section aria-label="Thông tin lịch tuần" className="rounded-card border border-line bg-surface p-4">
      <ul className="flex flex-col gap-2">
        {reasons.map((text) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-ink">
            <Icon className={schedule.relaxed ? 'mt-0.5 size-4 shrink-0 text-tom' : 'mt-0.5 size-4 shrink-0 text-ink-2'} aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
