import { Crown, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import type { PublicUser } from '@/features/auth/types.ts';
import { type HouseSummary, ROLE_LABELS } from '@/features/houses/types.ts';

/** Thẻ tóm tắt đầu trang hồ sơ: avatar, họ tên (Fraunces), email, vai trò ở nhà đang xem. */
export function ProfileSummaryCard({ user, house }: { user: PublicUser; house: HouseSummary | null }) {
  const isAdmin = house?.myRole === 'ADMIN';
  return (
    <div className="flex flex-col items-center rounded-card border border-line bg-surface px-5 py-6 text-center">
      <Avatar name={user.fullName} tone={avatarToneFor(user.id)} src={user.avatarUrl} size={88} />
      <p className="mt-4 max-w-full font-display text-ct text-ink break-words">{user.fullName}</p>
      <p className="mt-1 max-w-full text-sm break-all text-ink-2">{user.email}</p>
      {house && (
        <Chip tone="ink" icon={isAdmin ? <Crown /> : <UserRound />} className="mt-4">
          {ROLE_LABELS[house.myRole]} · {house.name}
        </Chip>
      )}
    </div>
  );
}
