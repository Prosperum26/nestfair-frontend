import { Brush, UserX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { sourceLabel } from '../source.ts';
import { statusChip } from '../status.ts';
import type { Assignment } from '../types.ts';
import { dueLabel, dueTimeLabel } from '../week.ts';

/** Nhãn phụ dựa trên cách ca được xử lý (spec §9): nộp muộn, tự duyệt, tự xác nhận, trưởng phòng quyết. */
function extraBadges(a: Assignment): { label: string; tone: 'yellow' | 'tom' | 'sky' | 'lil' }[] {
  const out: { label: string; tone: 'yellow' | 'tom' | 'sky' | 'lil' }[] = [];
  if (a.isLate) out.push({ label: 'Nộp muộn', tone: 'yellow' });
  if (a.verifyMode === 'AUTO_APPROVED') out.push({ label: 'Tự duyệt', tone: 'sky' });
  if (a.verifyMode === 'SELF_ATTESTED') out.push({ label: 'Tự xác nhận', tone: 'sky' });
  if (a.verifyMode === 'ADMIN_OVERRIDE') out.push({ label: 'Trưởng phòng quyết', tone: 'lil' });
  if (a.disputed) out.push({ label: 'Chờ trưởng phòng quyết', tone: 'tom' });
  return out;
}

/** Một ca trực: việc, người làm, hạn, trạng thái, nguồn; `actions` là hàng nút (check-in / duyệt…) do trang truyền vào. */
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
  const source = sourceLabel(assignment.source);
  const badges = extraBadges(assignment);
  const muted = assignment.status === 'CANCELLED';
  return (
    <article className={cn('rounded-card border bg-surface p-4', isMine ? 'border-line-2' : 'border-line', muted && 'opacity-60', className)}>
      <div className="flex items-start gap-3">
        <IconTile icon={<Brush />} tone={avatarToneFor(assignment.choreId)} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-h4 text-ink">{assignment.choreTitle}</h3>
          <p className="mt-0.5 text-cap text-ink-2">
            Độ nặng <span className="font-mono">{assignment.weight}</span> · hạn{' '}
            <span className="font-mono">
              {dueLabel(assignment.dueAt)} · {dueTimeLabel(assignment.dueAt)}
            </span>
          </p>
        </div>
        <Chip tone={chip.tone} icon={<Icon />} size="sm">
          {chip.label}
        </Chip>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-ink-2">
        {assignment.assigneeUserId && assignment.assigneeName ? (
          <>
            <Avatar name={assignment.assigneeName} src={assignment.assigneeAvatarUrl} tone={avatarToneFor(assignment.assigneeUserId)} size={24} />
            <span className="truncate">{isMine ? 'Bạn' : firstName(assignment.assigneeName)}</span>
          </>
        ) : (
          <>
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-dashed border-line-2 text-ink-3">
              <UserX className="size-3.5" aria-hidden />
            </span>
            <span>Chưa có người nhận</span>
          </>
        )}
      </div>

      {(source || badges.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {source && (
            <Chip tone="outline" size="sm">
              {source}
            </Chip>
          )}
          {badges.map((b) => (
            <Chip key={b.label} tone={b.tone} size="sm">
              {b.label}
            </Chip>
          ))}
        </div>
      )}

      {assignment.status === 'REJECTED' && assignment.rejectReason && (
        <p className="mt-3 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          Cần làm lại: {assignment.rejectReason}
          {assignment.rejectCount > 0 && <span className="font-mono text-cap"> · lần {assignment.rejectCount}/3</span>}
        </p>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}
