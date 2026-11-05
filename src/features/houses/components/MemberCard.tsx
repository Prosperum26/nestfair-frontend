import { Crown, PencilLine, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { bankLabel } from '@/lib/banks.ts';
import { cn } from '@/lib/cn.ts';
import { formatDate } from '@/lib/date.ts';
import { type HouseMember, ROLE_LABELS } from '../types.ts';

export function RoleChip({ role }: { role: HouseMember['role'] }) {
  return role === 'ADMIN' ? (
    <Chip tone="ink" icon={<Crown />}>
      {ROLE_LABELS.ADMIN}
    </Chip>
  ) : (
    <Chip tone="neutral" icon={<UserRound />}>
      {ROLE_LABELS.ROOMMATE}
    </Chip>
  );
}

/** Dòng nhãn · · · giá trị (mono), như ledger row. */
function InfoRow({ label, children, muted }: { label: string; children: ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-ink-2">{label}</span>
      <span className="h-0 flex-1 translate-y-1 border-b-[1.5px] border-dotted border-line-2" aria-hidden />
      <span className={cn('shrink-0 font-mono text-ms', muted ? 'text-ink-3' : 'text-ink')}>{children}</span>
    </div>
  );
}

/**
 * Thẻ thành viên (preview 11, desktop). Số dư và điểm chăm chỉ thuộc module Chi tiêu / Việc nhà,
 * hiện "—" cho tới khi các module đó có dữ liệu.
 */
export function MemberCard({
  member,
  isMe,
  month,
  actions,
}: {
  member: HouseMember;
  isMe: boolean;
  month: number;
  /** Menu thao tác của trưởng phòng (xóa, giao quyền). */
  actions?: ReactNode;
}) {
  const bank = bankLabel(member.bankBin, member.bankAccountLast4);
  return (
    <article
      className={cn(
        'flex flex-col rounded-card bg-surface p-5',
        isMe ? 'border-[1.5px] border-ink' : 'border border-line',
      )}
      aria-label={member.fullName}
    >
      <div className="flex items-start justify-between">
        <Avatar name={member.fullName} tone={avatarToneFor(member.userId)} src={member.avatarUrl} size={48} />
        {isMe ? <Chip tone="hl">Bạn</Chip> : actions}
      </div>
      <h3 className="mt-4 truncate font-display text-[20px] leading-7 font-semibold text-ink">
        {member.fullName}
      </h3>
      <div className="mt-1.5">
        <RoleChip role={member.role} />
      </div>
      <hr className="my-4 border-0 border-t-[1.5px] border-dashed border-line-2" />
      <div className="flex flex-col gap-2.5">
        <InfoRow label={`Số dư T${month}`} muted>
          —
        </InfoRow>
        <InfoRow label="Điểm chăm chỉ" muted>
          —
        </InfoRow>
        <InfoRow label="Ngân hàng" muted={!bank}>
          {bank ?? 'Chưa thêm'}
        </InfoRow>
        <InfoRow label="Tham gia">{formatDate(new Date(member.joinedAt))}</InfoRow>
      </div>
      {isMe && (
        <Link
          to="/profile"
          className="mt-5 flex h-9 items-center justify-center gap-2 rounded-btn-sm border border-line-2 bg-surface text-btns text-ink hover:bg-paper [&_svg]:size-4"
        >
          <PencilLine aria-hidden />
          {bank ? 'Chỉnh hồ sơ' : 'Thêm tài khoản nhận tiền'}
        </Link>
      )}
    </article>
  );
}

/** Dòng thành viên gọn cho mobile (preview 11 mobile). */
export function MemberRow({ member, isMe, actions }: { member: HouseMember; isMe: boolean; actions?: ReactNode }) {
  const bank = bankLabel(member.bankBin, member.bankAccountLast4);
  return (
    <li className="flex items-center gap-3 py-3.5">
      <Avatar name={member.fullName} tone={avatarToneFor(member.userId)} src={member.avatarUrl} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-h4 text-ink">
          {member.fullName}
          {isMe && <span className="font-normal text-ink-2"> (bạn)</span>}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-cap text-ink-2">
          {member.role === 'ADMIN' && <RoleChip role="ADMIN" />}
          <span>{bank ?? 'Chưa thêm ngân hàng'}</span>
        </div>
      </div>
      <span className="font-mono text-ms text-ink-3" aria-label="Số dư chưa có">
        —
      </span>
      {!isMe && actions}
    </li>
  );
}
