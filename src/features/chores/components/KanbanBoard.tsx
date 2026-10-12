import { Ban, UserX } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn.ts';
import { groupByColumn, type KanbanColumn } from '../grouping.ts';
import type { Assignment } from '../types.ts';
import { AssignmentCard } from './AssignmentCard.tsx';

const COLUMNS: { key: KanbanColumn; label: string; issue?: boolean }[] = [
  { key: 'TODO', label: 'Cần làm' },
  { key: 'PENDING_VERIFY', label: 'Chờ duyệt ảnh' },
  { key: 'REJECTED', label: 'Cần làm lại', issue: true },
  { key: 'DONE', label: 'Đã xong' },
  { key: 'MISSED', label: 'Bỏ ca', issue: true },
];

/**
 * Kanban 5 cột (preview 16), không kéo-thả để đổi trạng thái. `Chưa có người` và `Đã hủy` ở hộp lọc riêng.
 * Mobile: cột cuộn ngang, mỗi cột gần full bề rộng.
 */
export function KanbanBoard({
  assignments,
  meUserId,
  renderActions,
}: {
  assignments: Assignment[];
  meUserId?: string;
  renderActions?: (assignment: Assignment) => ReactNode;
}) {
  const { columns, unassigned, cancelled } = groupByColumn(assignments);
  const [box, setBox] = useState<'unassigned' | 'cancelled' | null>(null);
  const boxList = box === 'unassigned' ? unassigned : box === 'cancelled' ? cancelled : [];

  const card = (a: Assignment) => (
    <AssignmentCard key={a.id} assignment={a} isMine={a.assigneeUserId === meUserId} actions={renderActions?.(a)} compact />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0">
        {COLUMNS.map(({ key, label, issue }) => (
          <section key={key} aria-label={label} className="min-w-[84%] shrink-0 snap-center rounded-card bg-paper-2 p-3 md:min-w-0">
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className={cn('font-mono text-over uppercase', issue ? 'text-tom' : 'text-ink-2')}>{label}</h2>
              <span className="font-mono text-cap text-ink-2">{columns[key].length}</span>
            </header>
            <div className="flex flex-col gap-3">
              {columns[key].length === 0 ? (
                <p className="rounded-card border border-dashed border-line-2 px-3 py-6 text-center text-sm text-ink-3">Chưa có ca nào</p>
              ) : (
                columns[key].map(card)
              )}
            </div>
          </section>
        ))}
      </div>

      {(unassigned.length > 0 || cancelled.length > 0) && (
        <section aria-label="Ca ngoài bảng" className="rounded-card border border-line bg-surface p-4">
          <div className="flex flex-wrap gap-2">
            {unassigned.length > 0 && (
              <button
                type="button"
                aria-pressed={box === 'unassigned'}
                onClick={() => setBox(box === 'unassigned' ? null : 'unassigned')}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-btn-sm border px-3 text-sm focus-visible:outline-none focus-visible:shadow-focus',
                  box === 'unassigned' ? 'border-ink bg-hl-soft font-semibold text-ink' : 'border-line-2 bg-surface text-ink-2 hover:bg-paper',
                )}
              >
                <UserX className="size-4" aria-hidden /> Chưa có người <span className="font-mono">{unassigned.length}</span>
              </button>
            )}
            {cancelled.length > 0 && (
              <button
                type="button"
                aria-pressed={box === 'cancelled'}
                onClick={() => setBox(box === 'cancelled' ? null : 'cancelled')}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-btn-sm border px-3 text-sm focus-visible:outline-none focus-visible:shadow-focus',
                  box === 'cancelled' ? 'border-ink bg-paper-2 font-semibold text-ink' : 'border-line-2 bg-surface text-ink-2 hover:bg-paper',
                )}
              >
                <Ban className="size-4" aria-hidden /> Đã hủy <span className="font-mono">{cancelled.length}</span>
              </button>
            )}
          </div>
          {box && <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{boxList.map(card)}</div>}
        </section>
      )}
    </div>
  );
}
