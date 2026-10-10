import { Brush } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { statusChip } from '../status.ts';
import type { Assignment } from '../types.ts';
import { dueLabel } from '../week.ts';

/** Một ca trực: việc, người làm, hạn, trạng thái; `actions` là hàng nút (check-in / duyệt) do trang truyền vào. */
export function AssignmentCard({
  assignment,
  isMine,
  actions,
  className,
}: {
  assignment: Assignment;
  isMine?: boolean;
  actions?: ReactNode;
  className?: string;
}) {
  const chip = statusChip(assignment.status);
  const Icon = chip.icon;
  return (
    <article
      className={cn(
        'rounded-card border bg-surface p-4',
        isMine ? 'border-line-2' : 'border-line',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <IconTile icon={<Brush />} tone={avatarToneFor(assignment.choreId)} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-h4 text-ink">{assignment.choreTitle}</h3>
          <p className="mt-0.5 text-cap text-ink-2">
            Độ nặng <span className="font-mono">{assignment.weight}</span> · hạn{' '}
            <span className="font-mono">{dueLabel(assignment.dueAt)}</span>
          </p>
        </div>
        <Chip tone={chip.tone} icon={<Icon />} size="sm">
          {chip.label}
        </Chip>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-ink-2">
        <Avatar
          name={assignment.assigneeName}
          src={assignment.assigneeAvatarUrl}
          tone={avatarToneFor(assignment.assigneeUserId)}
          size={24}
        />
        <span className="truncate">{isMine ? 'Bạn' : firstName(assignment.assigneeName)}</span>
      </div>

      {assignment.status === 'REJECTED' && assignment.rejectReason && (
        <p className="mt-3 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          Cần làm lại: {assignment.rejectReason}
        </p>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}
