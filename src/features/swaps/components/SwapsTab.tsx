import { Info } from 'lucide-react';
import { DebtPanel } from './DebtPanel.tsx';
import { IncomingList } from './IncomingList.tsx';
import { MarketList } from './MarketList.tsx';
import { OutgoingSection } from './OutgoingList.tsx';

/**
 * Tab "Chợ ca" của trang Việc nhà (preview 15). Desktop: cột trái là Chợ ca và yêu cầu của bạn, cột phải là
 * "Chờ bạn phản hồi" và "Nợ ca". Mobile: một cột; thẻ "Chưa ai nhận ca của bạn" cố định trên đầu.
 */
export function SwapsTab({ houseId, myFullName }: { houseId: string; myFullName: string | undefined }) {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <OutgoingSection houseId={houseId} part="expired" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <section aria-label="Chợ ca" className="rounded-card border border-line bg-surface p-5">
            <p className="font-mono text-over uppercase text-ink-2">Chợ ca · cả phòng thấy</p>
            <h2 className="mb-4 font-display text-ct text-ink">Ca đang cần người nhận</h2>
            <MarketList houseId={houseId} />
          </section>
          <OutgoingSection houseId={houseId} part="pending" />
          <p className="flex items-start gap-2 rounded-card bg-paper-2 px-4 py-3 text-cap text-ink-2">
            <Info className="mt-px size-4 shrink-0" aria-hidden />
            Không ai nhận trước hạn? Người nhờ chọn: thêm quà rồi đăng lại, gửi người khác, hoặc tự làm ca đó. Không chọn gì thì mặc định tự làm.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <section aria-label="Chờ bạn phản hồi" className="flex flex-col gap-3">
            <h2 className="font-display text-ct text-ink">Chờ bạn phản hồi</h2>
            <IncomingList houseId={houseId} />
          </section>
          <DebtPanel houseId={houseId} myFullName={myFullName} />
        </div>
      </div>
    </div>
  );
}
