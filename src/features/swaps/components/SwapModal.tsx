import { useState } from 'react';
import { Chip } from '@/components/ui/Chip.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import type { Assignment } from '@/features/chores/types.ts';
import { dueLabel, dueTimeLabel } from '@/features/chores/week.ts';
import type { SwapEntry } from '../swap-entry.ts';
import { pointsLabel } from '../swap-format.ts';
import { CoverPanel } from './CoverPanel.tsx';
import { ExchangePanel } from './ExchangePanel.tsx';

type Tab = 'EXCHANGE' | 'COVER';

/**
 * Hai tab, nhãn theo D14 ("Đổi với bạn" / "Nhờ trực dùm"). Tab thứ ba "Đổi lịch tuần sau" đã bị cắt cùng
 * Task 15 nên không có ở đây và không để chỗ trống.
 */
const TABS: { value: Tab; label: string }[] = [
  { value: 'EXCHANGE', label: 'Đổi với bạn' },
  { value: 'COVER', label: 'Nhờ trực dùm' },
];

function SwapModalBody({ assignment, houseId, entry, onClose }: { assignment: Assignment; houseId: string; entry: SwapEntry; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>(entry.exchange ? 'COVER' : 'EXCHANGE');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-paper px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-h4 text-ink">{assignment.choreTitle}</p>
          <p className="text-cap text-ink-2">
            <span className="font-mono">
              {dueLabel(assignment.dueAt)} · trước {dueTimeLabel(assignment.dueAt)}
            </span>{' '}
            · <span className="font-mono">{pointsLabel(assignment.weight)}</span>
          </p>
        </div>
        <Chip tone="yellow" size="sm">
          Ca của bạn
        </Chip>
      </div>

      <SegmentedControl label="Cách đổi ca" options={TABS} value={tab} onChange={setTab} />

      {tab === 'EXCHANGE' ? (
        entry.exchange ? (
          <p role="status" className="rounded-card bg-paper-2 px-3 py-3 text-sm text-ink-2">
            {entry.exchange}
          </p>
        ) : (
          <ExchangePanel assignment={assignment} houseId={houseId} onDone={onClose} />
        )
      ) : entry.cover ? (
        <p role="status" className="rounded-card bg-paper-2 px-3 py-3 text-sm text-ink-2">
          {entry.cover}
        </p>
      ) : (
        <CoverPanel assignment={assignment} houseId={houseId} giftOnly={entry.giftOnly} onDone={onClose} />
      )}
    </div>
  );
}

/** Modal Đổi ca của một ca trực (preview 14): đổi với bạn cùng phòng, hoặc nhờ trực dùm / đăng Chợ ca. */
export function SwapModal({ assignment, houseId, entry, onClose }: { assignment: Assignment | null; houseId: string; entry: SwapEntry; onClose: () => void }) {
  return (
    <Modal open={!!assignment} onClose={onClose} overline="Đổi ca · Việc nhà" title="Đổi ca của bạn" className="sm:max-w-[560px]">
      {assignment && <SwapModalBody key={assignment.id} assignment={assignment} houseId={houseId} entry={entry} onClose={onClose} />}
    </Modal>
  );
}
