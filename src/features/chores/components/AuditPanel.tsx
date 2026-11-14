import { History } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { auditText } from '../chore-text.ts';
import { messageForError } from '../errors.ts';
import { useAudit } from '../hooks.ts';
import { dueLabel, dueTimeLabel } from '../week.ts';

/** Nhật ký thao tác việc nhà (xáo lại, can thiệp, khai vắng, tự duyệt…), mới nhất trước. */
export function AuditPanel({ houseId }: { houseId: string }) {
  const audit = useAudit(houseId);
  return (
    <section aria-labelledby="audit-title" className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-over uppercase text-ink-2">Minh bạch</p>
      <h2 id="audit-title" className="font-display text-ct text-ink">
        Nhật ký thao tác
      </h2>
      <div className="mt-4">
        {audit.isPending ? (
          <Skeleton className="h-16" />
        ) : audit.isError ? (
          <p role="alert" className="text-sm text-tom">
            {messageForError(audit.error)}
          </p>
        ) : audit.data.length === 0 ? (
          <EmptyState icon={<History />} tone="neutral" title="Chưa có thao tác nào" className="py-6" />
        ) : (
          <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">
            {audit.data.map((log) => (
              <li key={log.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="shrink-0 font-mono text-cap text-ink-3">
                  {dueLabel(log.createdAt)} · {dueTimeLabel(log.createdAt)}
                </span>
                <span className="text-sm text-ink">{auditText(log)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
