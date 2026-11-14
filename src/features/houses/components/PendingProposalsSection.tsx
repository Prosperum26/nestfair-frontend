import { Check, Inbox, RotateCw, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatedItem } from '@/components/ui/AnimatedList.tsx';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { ProfileSection } from '@/features/profile/components/ProfileSection.tsx';
import { formatDate } from '@/lib/date.ts';
import { useApproveRule, useRejectRule, useRuleProposals } from '../hooks.ts';
import { proposalErrorMessage, proposalTitle } from '../rule-proposals.ts';
import type { RuleProposal } from '../types.ts';
import { ProposalBody } from './ProposalBody.tsx';

/** Trưởng phòng duyệt / từ chối đề xuất nội quy của thành viên (trang Cài đặt nhà). */
export function PendingProposalsSection({ houseId }: { houseId: string }) {
  const proposals = useRuleProposals(houseId);
  const approve = useApproveRule(houseId);
  const [rejecting, setRejecting] = useState<RuleProposal | null>(null);
  const pending = proposals.data?.filter((p) => p.status === 'PENDING') ?? [];

  let body;
  if (proposals.isPending) {
    body = (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải đề xuất">
        <Skeleton className="h-[96px] rounded-btn" />
        <Skeleton className="h-[96px] rounded-btn" />
      </div>
    );
  } else if (proposals.isError) {
    body = (
      <EmptyState
        icon={<RotateCw />}
        tone="tom"
        title="Không tải được đề xuất"
        description={proposals.error.message}
        action={
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void proposals.refetch()}>
            Thử lại
          </Button>
        }
      />
    );
  } else if (pending.length === 0) {
    body = (
      <EmptyState
        icon={<Inbox />}
        title="Chưa có đề xuất nào"
        description="Thành viên đề xuất thêm, sửa hoặc bỏ điều nội quy ở trang Thành viên. Đề xuất mới sẽ hiện ở đây."
      />
    );
  } else {
    body = (
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {pending.map((p) => (
            <AnimatedItem as="li" key={p.id} className="rounded-btn border border-line p-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Avatar name={p.proposer.fullName} tone={avatarToneFor(p.proposer.userId)} src={p.proposer.avatarUrl} size={32} />
                <p className="min-w-0 flex-1 text-sm text-ink">
                  <span className="font-semibold">{p.proposer.fullName}</span>
                  <span className="text-ink-2"> · {formatDate(new Date(p.createdAt))}</span>
                </p>
                <Chip tone="yellow" size="sm">{proposalTitle(p)}</Chip>
              </div>
              <div className="mt-3">
                <ProposalBody proposal={p} />
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2.5">
                <Button size="sm" variant="secondary" leftIcon={<X />} onClick={() => setRejecting(p)}>
                  Từ chối
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Check />}
                  loading={approve.isPending && approve.variables === p.id}
                  onClick={() =>
                    approve.mutate(p.id, {
                      onSuccess: () => toast('Đã duyệt. Nội quy đã cập nhật.'),
                      onError: (e) => toast.error(proposalErrorMessage(e)),
                    })
                  }
                >
                  Duyệt
                </Button>
              </div>
            </AnimatedItem>
          ))}
        </AnimatePresence>
      </ul>
    );
  }

  return (
    <ProfileSection
      id="rule-proposals"
      overline="Thành viên góp ý"
      title="Đề xuất nội quy"
      aside={pending.length > 0 ? <Chip tone="yellow">{pending.length} chờ duyệt</Chip> : undefined}
    >
      {body}
      {rejecting && <RejectDialog houseId={houseId} proposal={rejecting} onClose={() => setRejecting(null)} />}
    </ProfileSection>
  );
}

function RejectDialog({ houseId, proposal, onClose }: { houseId: string; proposal: RuleProposal; onClose: () => void }) {
  const reject = useRejectRule(houseId);
  const [reason, setReason] = useState('');
  const tooLong = reason.trim().length > 200;

  return (
    <Modal open onClose={onClose} overline="Đề xuất nội quy" title="Từ chối đề xuất" description={`Của ${proposal.proposer.fullName}. Lý do sẽ hiện cho người đề xuất.`}>
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (tooLong) return;
          reject.mutate(
            { id: proposal.id, reason: reason.trim() || undefined },
            {
              onSuccess: () => {
                toast('Đã từ chối đề xuất.');
                onClose();
              },
              onError: (err) => toast.error(proposalErrorMessage(err)),
            },
          );
        }}
      >
        <div className="rounded-btn border border-line bg-paper px-3.5 py-3">
          <ProposalBody proposal={proposal} />
        </div>
        <Field label="Lý do (không bắt buộc)" htmlFor="reject-reason" error={tooLong ? 'Lý do tối đa 200 ký tự.' : undefined}>
          <Input id="reject-reason" value={reason} invalid={tooLong} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="danger" loading={reject.isPending}>
            Từ chối
          </Button>
        </div>
      </form>
    </Modal>
  );
}
