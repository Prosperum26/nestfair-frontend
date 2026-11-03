import { Avatar } from '@/components/ui/Avatar.tsx';
import { LedgerRow } from '@/components/ui/Receipt.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import type { UserBrief } from '@/features/expenses/types.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';

/** "PHẦN MỖI NGƯỜI": dòng sổ cái có đường chấm dẫn, theo thứ tự thành viên; người chưa có phần hiện 0đ. */
export function PerPersonSummary({
  members,
  shares,
  meId,
  payerId,
  provisional = false,
}: {
  members: UserBrief[];
  shares: { userId: string; amount: number }[];
  meId: string | undefined;
  payerId: string;
  /** Chưa gán đủ món / chưa hợp lệ: số hiển thị là tạm tính. */
  provisional?: boolean;
}) {
  const amountOf = (id: string) => shares.find((s) => s.userId === id)?.amount ?? 0;
  return (
    <div>
      <p className="font-mono text-over uppercase text-ink-2">Phần mỗi người</p>
      {provisional && <p className="mt-1 text-cap text-ink-2">Tạm tính, chưa gồm món chưa chọn người dùng và phần chênh so với tổng hóa đơn.</p>}
      <ul className="mt-3 flex flex-col gap-3">
        {members.map((m) => (
          <li key={m.id}>
            <LedgerRow
              left={
                <>
                  <Avatar name={m.fullName} tone={avatarToneFor(m.id)} src={m.avatarUrl} size={24} />
                  <span>
                    {m.id === meId ? 'Bạn' : firstName(m.fullName)}
                    {m.id === payerId && <span className="font-normal text-ink-2"> (người trả)</span>}
                  </span>
                </>
              }
              amount={formatVnd(amountOf(m.id))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
