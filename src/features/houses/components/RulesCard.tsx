import { MoreHorizontal, Pencil, Plus, ScrollText, Settings, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { Menu, MenuItem } from '@/components/ui/Menu.tsx';
import { useRuleProposals, useWithdrawRule } from '../hooks.ts';
import { proposalErrorMessage, proposalStatusChip, proposalTitle } from '../rule-proposals.ts';
import { rulesLines } from '../rules.ts';
import type { HouseDetail } from '../types.ts';
import { ProposalBody } from './ProposalBody.tsx';
import { ProposeRuleDialog, type ProposeTarget } from './ProposeRuleDialog.tsx';

/** Số đề xuất gần đây của bạn hiện dưới thẻ. */
const MY_RECENT = 3;

/**
 * Thẻ nội quy ở trang Thành viên. Thành viên đề xuất thêm / sửa / bỏ từng điều;
 * trưởng phòng sửa trực tiếp ở Cài đặt nhà và thấy số đề xuất đang chờ.
 */
export function RulesCard({ house, meId }: { house: HouseDetail; meId: string | undefined }) {
  const navigate = useNavigate();
  const isAdmin = house.myRole === 'ADMIN';
  const lines = rulesLines(house.rules);
  const proposals = useRuleProposals(house.id);
  const withdraw = useWithdrawRule(house.id);
  const [target, setTarget] = useState<ProposeTarget | null>(null);

  const pendingCount = proposals.data?.filter((p) => p.status === 'PENDING').length ?? 0;
  const mine = (proposals.data ?? []).filter((p) => p.proposer.userId === meId).slice(0, MY_RECENT);

  return (
    <section aria-labelledby="rules-card-title" className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-over uppercase text-ink-2">
            <ScrollText className="size-4" aria-hidden />
            Nội quy nhà
          </p>
          <h2 id="rules-card-title" className="mt-1 font-display text-ct text-ink">
            Cả nhà cùng giữ nhé
          </h2>
        </div>
        {isAdmin ? (
          <Button size="sm" variant="secondary" leftIcon={<Settings />} onClick={() => navigate('/house')}>
            {pendingCount > 0 ? `${pendingCount} đề xuất chờ duyệt` : 'Sửa nội quy'}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" leftIcon={<Plus />} onClick={() => setTarget({ kind: 'ADD' })}>
            Đề xuất thêm điều
          </Button>
        )}
      </div>

      {lines.length === 0 ? (
        <p className="mt-4 text-sm text-ink-2">
          {isAdmin ? 'Nhà chưa có nội quy. Viết vài điều ở Cài đặt nhà nhé.' : 'Nhà chưa có nội quy. Bạn có thể đề xuất điều đầu tiên.'}
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-1">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-3 py-1 text-sm text-ink">
              <span className="w-5 shrink-0 pt-px font-mono text-ink-2">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1 break-words pt-px">{line}</span>
              {!isAdmin && (
                <Menu
                  trigger={(props) => (
                    <button
                      type="button"
                      {...props}
                      aria-label={`Đề xuất cho điều ${i + 1}`}
                      className="-my-1 inline-flex size-8 shrink-0 items-center justify-center rounded-btn-sm text-ink-2 hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus"
                    >
                      <MoreHorizontal className="size-[18px]" aria-hidden />
                    </button>
                  )}
                >
                  {(close) => (
                    <>
                      <MenuItem icon={<Pencil />} onSelect={() => { close(); setTarget({ kind: 'EDIT', targetText: line }); }}>
                        Đề xuất sửa điều này
                      </MenuItem>
                      <MenuItem icon={<Trash2 />} onSelect={() => { close(); setTarget({ kind: 'REMOVE', targetText: line }); }}>
                        Đề xuất bỏ điều này
                      </MenuItem>
                    </>
                  )}
                </Menu>
              )}
            </li>
          ))}
        </ol>
      )}

      {!isAdmin && mine.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="font-mono text-over uppercase text-ink-2">Đề xuất của bạn</p>
          <ul className="mt-3 flex flex-col gap-3">
            {mine.map((p) => {
              const chip = proposalStatusChip(p.status);
              return (
                <li key={p.id} className="rounded-btn border border-line p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{proposalTitle(p)}</p>
                    <Chip tone={chip.tone} size="sm">{chip.label}</Chip>
                  </div>
                  <div className="mt-2">
                    <ProposalBody proposal={p} />
                  </div>
                  {p.status === 'REJECTED' && p.rejectReason && (
                    <p className="mt-2 break-words text-cap text-tom">Trưởng phòng: {p.rejectReason}</p>
                  )}
                  {p.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      leftIcon={<Undo2 />}
                      loading={withdraw.isPending && withdraw.variables === p.id}
                      onClick={() =>
                        withdraw.mutate(p.id, {
                          onSuccess: () => toast('Đã rút lại đề xuất.'),
                          onError: (e) => toast.error(proposalErrorMessage(e)),
                        })
                      }
                    >
                      Rút lại
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {target && (
        <ProposeRuleDialog
          key={`${target.kind}-${target.targetText ?? ''}`}
          houseId={house.id}
          target={target}
          onClose={() => setTarget(null)}
        />
      )}
    </section>
  );
}
