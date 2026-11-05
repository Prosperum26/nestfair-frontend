import { Crown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import type { HouseDetail } from '@/features/houses/types.ts';
import { ProfileSection } from '@/features/profile/components/ProfileSection.tsx';
import { LeaveHouseDialog } from './LeaveHouseDialog.tsx';
import { OptionCard } from './OptionCard.tsx';
import { TransferAdminDialog } from './TransferAdminDialog.tsx';

/** "Chuyển quyền trưởng phòng" ở Cài đặt nhà. Giao xong thì mình không còn vào trang này được. */
export function TransferAdminSection({ house, meId }: { house: HouseDetail; meId: string }) {
  const navigate = useNavigate();
  const others = house.members.filter((m) => m.userId !== meId);
  const [pick, setPick] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const chosen = others.find((m) => m.userId === pick);

  return (
    <ProfileSection id="transfer-admin" overline="Vai trò" title="Chuyển quyền trưởng phòng">
      {others.length === 0 ? (
        <p className="text-sm text-ink-2">Nhà chưa có thành viên nào khác để giao quyền.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-2">Người nhận sửa được nhà, nội quy, việc nhà và xóa thành viên. Bạn trở thành thành viên thường.</p>
          <div role="radiogroup" aria-label="Trưởng phòng mới" className="grid gap-2.5 sm:grid-cols-2">
            {others.map((m) => (
              <OptionCard key={m.userId} checked={pick === m.userId} onSelect={() => setPick(m.userId)} title={m.fullName} />
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" leftIcon={<Crown />} disabled={!chosen} onClick={() => setConfirming(true)}>
              Giao quyền
            </Button>
          </div>
        </div>
      )}
      {confirming && chosen && (
        <TransferAdminDialog
          houseId={house.id}
          member={chosen}
          onClose={() => setConfirming(false)}
          onDone={() => void navigate('/members', { replace: true })}
        />
      )}
    </ProfileSection>
  );
}

/** Vùng nguy hiểm: rời nhà. Giải tán nhà chưa có (spec, để sau). */
export function LeaveHouseSection({ house, meId }: { house: HouseDetail; meId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="leave-house-title" className="rounded-card border border-tom-border bg-surface p-5 sm:p-6">
      <p className="font-mono text-over uppercase text-tom">Vùng nguy hiểm</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 id="leave-house-title" className="font-display text-ct text-ink">
            Rời nhà
          </h2>
          <p className="mt-1 text-sm text-ink-2">Cần thanh toán hết các khoản và giao quyền trưởng phòng cho người khác.</p>
        </div>
        <Button variant="dangerSoft" leftIcon={<LogOut />} onClick={() => setOpen(true)}>
          Rời nhà
        </Button>
      </div>
      {open && <LeaveHouseDialog houseId={house.id} houseName={house.name} meId={meId} onClose={() => setOpen(false)} />}
    </section>
  );
}
