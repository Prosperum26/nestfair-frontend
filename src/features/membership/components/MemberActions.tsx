import { Crown, MoreHorizontal, UserMinus } from 'lucide-react';
import { useState } from 'react';
import { Menu, MenuItem } from '@/components/ui/Menu.tsx';
import type { HouseDetail, HouseMember } from '@/features/houses/types.ts';
import { firstName } from '@/lib/date.ts';
import { KickMemberDialog } from './KickMemberDialog.tsx';
import { TransferAdminDialog } from './TransferAdminDialog.tsx';

/** Menu "⋯" trên thẻ thành viên, chỉ trưởng phòng thấy (không hiện trên thẻ của chính mình). */
export function MemberActions({ house, member }: { house: HouseDetail; member: HouseMember }) {
  const [open, setOpen] = useState<'kick' | 'transfer' | null>(null);
  const name = firstName(member.fullName);
  return (
    <>
      <Menu
        trigger={(props) => (
          <button
            type="button"
            {...props}
            aria-label={`Thao tác với ${member.fullName}`}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-btn-sm text-ink-2 hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus"
          >
            <MoreHorizontal className="size-5" aria-hidden />
          </button>
        )}
      >
        {(close) => (
          <>
            <MenuItem icon={<Crown />} onSelect={() => { close(); setOpen('transfer'); }}>
              Giao quyền trưởng phòng cho {name}
            </MenuItem>
            <MenuItem icon={<UserMinus />} onSelect={() => { close(); setOpen('kick'); }}>
              Xóa {name} khỏi nhà
            </MenuItem>
          </>
        )}
      </Menu>
      {open === 'kick' && <KickMemberDialog house={house} member={member} onClose={() => setOpen(null)} />}
      {open === 'transfer' && <TransferAdminDialog houseId={house.id} member={member} onClose={() => setOpen(null)} />}
    </>
  );
}
