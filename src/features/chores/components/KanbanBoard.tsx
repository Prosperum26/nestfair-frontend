import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';
import { groupByStatus, type KanbanColumn } from '../grouping.ts';
import type { Assignment } from '../types.ts';
import { AssignmentCard } from './AssignmentCard.tsx';

const COLUMNS: { key: KanbanColumn; label: string; issue?: boolean }[] = [
  { key: 'TODO', label: 'Chờ làm' },
  { key: 'PENDING_VERIFY', label: 'Chờ duyệt' },
  { key: 'DONE', label: 'Hoàn thành' },
  { key: 'ISSUE', label: 'Cần xử lý', issue: true },
];

/** Kanban 4 cột (preview 16). Mobile: cột cuộn ngang, mỗi cột gần full bề rộng. */
export function KanbanBoard({
  assignments,
  meUserId,
  renderActions,
}: {
  assignments: Assignment[];
  meUserId?: string;
  renderActions?: (assignment: Assignment) => ReactNode;
}) {
  const groups = groupByStatus(assignments);
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {COLUMNS.map(({ key, label, issue }) => (
        <section
          key={key}
          aria-label={label}
          className="min-w-[84%] shrink-0 snap-center rounded-card bg-paper-2 p-3 md:min-w-0"
        >
          <header className="mb-3 flex items-center justify-between px-1">
            <h2 className={cn('font-mono text-over uppercase', issue ? 'text-tom' : 'text-ink-2')}>{label}</h2>
            <span className="font-mono text-cap text-ink-2">{groups[key].length}</span>
          </header>
          <div className="flex flex-col gap-3">
            {groups[key].length === 0 ? (
              <p className="rounded-card border border-dashed border-line-2 px-3 py-6 text-center text-sm text-ink-3">
                Chưa có ca nào
              </p>
            ) : (
              groups[key].map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  isMine={a.assigneeUserId === meUserId}
                  actions={renderActions?.(a)}
                />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
