import { ArrowDown } from 'lucide-react';
import type { RuleProposal } from '../types.ts';

/** Nội dung một đề xuất: điều cũ (gạch) → điều mới. */
export function ProposalBody({ proposal }: { proposal: Pick<RuleProposal, 'kind' | 'targetText' | 'content' | 'reason'> }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {proposal.targetText && (
        <p className="break-words text-ink-3 line-through decoration-tom">{proposal.targetText}</p>
      )}
      {proposal.kind === 'EDIT' && <ArrowDown className="size-3.5 text-ink-3" aria-label="thành" />}
      {proposal.content && <p className="break-words font-medium text-ink">{proposal.content}</p>}
      {proposal.reason && <p className="break-words text-cap text-ink-2">Lý do: {proposal.reason}</p>}
    </div>
  );
}
