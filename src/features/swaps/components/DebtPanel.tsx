import { Landmark, RotateCw, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { houseClock } from '@/lib/house-time.ts';
import { useNow } from '@/lib/use-now.ts';
import { messageForSwapError } from '../copy.ts';
import { canForgive, canPick, closedLabel, deadlineNote, groupTitle, phaseLabel, relationOf } from '../debts.ts';
import { useDebts, useForgiveDebt } from '../hooks.ts';
import { pointsLabel, slotLabel } from '../swap-format.ts';
import type { Debt, DebtGroup } from '../types.ts';
import { PaybackPickSheet } from './PaybackPickSheet.tsx';

function DebtRow({ debt, myFullName, houseId, onPick }: { debt: Debt; myFullName: string | undefined; houseId: string; onPick: (d: Debt) => void }) {
  const forgive = useForgiveDebt(houseId);
  const now = useNow(60_000);
  const [confirming, setConfirming] = useState(false);
  const open = debt.status === 'OPEN';
  const cover = debt.coverAssignment;
  const note = open && debt.phase === 'PICK_WINDOW' ? deadlineNote(debt, now) : null;
  const settled = debt.settledAt ? houseClock(debt.settledAt).ddmm : null;

  return (
    <li className={cn('py-3 first:pt-0 last:pb-0', !open && 'opacity-70')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink">
            {cover ? `Trực dùm ${slotLabel(cover)}` : 'Ca được làm hộ'} · <span className="font-mono">{pointsLabel(debt.weight)}</span>
          </p>
          <p className="mt-0.5 text-cap text-ink-2">{open ? phaseLabel(debt) : `${closedLabel(debt)}${settled ? ` · ${settled}` : ''}`}</p>
        </div>
        {open && <Chip tone={debt.phase === 'PICK_WINDOW' ? 'yellow' : 'neutral'} size="sm">{debt.phase === 'PICK_WINDOW' ? 'Đang chờ chọn' : 'Đang mở'}</Chip>}
      </div>

      {open && (canPick(debt, myFullName) || canForgive(debt, myFullName)) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {canPick(debt, myFullName) && (
            <Button size="sm" onClick={() => onPick(debt)}>
              Chọn ca cho {firstName(debt.debtorName)}
            </Button>
          )}
          {canForgive(debt, myFullName) &&
            (confirming ? (
              <>
                <span className="text-cap text-ink-2">Tha nợ này?</span>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={forgive.isPending}
                  onClick={() =>
                    forgive.mutate(debt.id, {
                      onSuccess: () => toast('Đã tha nợ.'),
                      onError: (e) => {
                        toast.error(messageForSwapError(e));
                        setConfirming(false);
                      },
                    })
                  }
                >
                  Xác nhận tha
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Không
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
                Tha nợ
              </Button>
            ))}
        </div>
      )}
      {note && <p className="mt-1.5 text-cap text-hl-ink">{note}</p>}
    </li>
  );
}

function GroupCard({ group, myFullName, houseId, onPick }: { group: DebtGroup; myFullName: string | undefined; houseId: string; onPick: (d: Debt) => void }) {
  const relation = relationOf(group, myFullName);
  const other = relation === 'CREDITOR' ? group.debtorName : group.creditorName;
  return (
    <section className="border-t border-line pt-4 first:border-t-0 first:pt-0" aria-label={groupTitle(group, myFullName)}>
      <div className="mb-2 flex items-center gap-3">
        <Avatar name={other} tone={avatarToneFor(relation === 'CREDITOR' ? group.debtorMemberId : group.creditorMemberId)} size={32} />
        <h3 className="min-w-0 flex-1 truncate text-h4 text-ink">{groupTitle(group, myFullName)}</h3>
        <Chip tone={relation === 'DEBTOR' ? 'tom' : relation === 'CREDITOR' ? 'mint' : 'neutral'} size="sm" className="font-mono">
          {pointsLabel(group.openWeight)}
        </Chip>
      </div>
      <ul className="flex flex-col divide-y divide-line pl-11">
        {group.debts.map((d) => (
          <DebtRow key={d.id} debt={d} myFullName={myFullName} houseId={houseId} onPick={onPick} />
        ))}
      </ul>
    </section>
  );
}

/**
 * Sổ nợ ca (preview 15 "Nợ ca"): nhóm theo cặp người có hướng ("Bạn nợ Quân" và "Quân nợ bạn" là hai nhóm, không bù trừ).
 * Server gom nhóm; client chỉ hiển thị. Gồm nợ đang mở và nợ đã đóng trong 30 ngày gần nhất.
 */
export function DebtPanel({ houseId, myFullName }: { houseId: string; myFullName: string | undefined }) {
  const debts = useDebts(houseId, 'mine');
  const [picking, setPicking] = useState<Debt | null>(null);

  let body;
  if (debts.isPending) {
    body = <Skeleton className="h-[120px] rounded-card" aria-busy="true" />;
  } else if (debts.isError) {
    body = (
      <EmptyState
        icon={<TriangleAlert />}
        tone="tom"
        title="Không tải được sổ nợ ca"
        description={messageForSwapError(debts.error)}
        action={
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void debts.refetch()}>
            Thử lại
          </Button>
        }
        className="py-6"
      />
    );
  } else if (debts.data.groups.length === 0) {
    body = <EmptyState icon={<Landmark />} tone="neutral" title="Chưa có nợ ca nào" description="Khi bạn nhờ ai làm hộ bằng cách làm bù, khoản nợ sẽ hiện ở đây." className="py-6" />;
  } else {
    body = (
      <div className="flex flex-col gap-4">
        {debts.data.groups.map((g) => (
          <GroupCard key={`${g.debtorMemberId}|${g.creditorMemberId}`} group={g} myFullName={myFullName} houseId={houseId} onPick={setPicking} />
        ))}
        {debts.data.truncated && <p className="text-cap text-ink-2">Còn nhiều nhóm nợ khác chưa hiện hết.</p>}
      </div>
    );
  }

  return (
    <section aria-label="Nợ ca" className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-over uppercase text-ink-2">Làm bù khi sinh lịch tuần mới</p>
      <h2 className="mb-4 font-display text-ct text-ink">Nợ ca</h2>
      {body}
      <PaybackPickSheet houseId={houseId} debt={picking} onClose={() => setPicking(null)} />
    </section>
  );
}
