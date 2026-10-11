import { Info, TriangleAlert } from 'lucide-react';
import { reasonsFor } from '../reasons.ts';
import type { GeneratedBy, ScheduleMeta } from '../types.ts';

const GENERATED: Record<GeneratedBy, string> = {
  CRON: 'Tạo tự động vào Chủ Nhật',
  CATCHUP: 'Sinh bù khi mở lịch',
  USER: 'Do thành viên tạo',
  ADMIN_REROLL: 'Trưởng phòng đã xáo lại',
};

/**
 * Banner lịch tuần: lý do bằng tiếng Việt (nới rào, nhà nhỏ, vắng mặt…) và seed để ai nghi thiên vị tự kiểm chứng.
 * Không hiện gì khi chưa có lịch.
 */
export function ScheduleBanner({ schedule }: { schedule: ScheduleMeta | null }) {
  if (!schedule) return null;
  const reasons = reasonsFor(schedule);
  const Icon = schedule.relaxed ? TriangleAlert : Info;
  return (
    <section aria-label="Thông tin lịch tuần" className="rounded-card border border-line bg-surface p-4">
      {reasons.length > 0 && (
        <ul className="flex flex-col gap-2">
          {reasons.map((text) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-ink">
              <Icon className={schedule.relaxed ? 'mt-0.5 size-4 shrink-0 text-tom' : 'mt-0.5 size-4 shrink-0 text-ink-2'} aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      )}
      <details className={reasons.length > 0 ? 'mt-3' : ''}>
        <summary className="cursor-pointer text-cap text-ink-2 hover:text-ink">
          Minh bạch: seed <span className="font-mono">#{schedule.seed}</span>
        </summary>
        <p className="mt-2 text-cap text-ink-2">
          Cùng seed và cùng dữ liệu thì thuật toán cho đúng lịch này, nên không ai bị ưu ái. {GENERATED[schedule.generatedBy]}
          {schedule.rerollCount > 0 && ` · đã xáo lại ${schedule.rerollCount} lần`}.
        </p>
      </details>
    </section>
  );
}
