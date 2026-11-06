import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { AbsencePanel } from './AbsencePanel.tsx';
import { AuditPanel } from './AuditPanel.tsx';
import { BreakPanel } from './BreakPanel.tsx';
import { ChoreManager } from './ChoreManager.tsx';
import { SettingsPanel } from './SettingsPanel.tsx';

/**
 * Nội dung tab "Việc nhà" ở Cài đặt nhà: danh sách việc, ân hạn, khai vắng, cả nhà vắng và nhật ký thao tác.
 * Thành viên thường chỉ khai vắng và xem nhật ký; việc và quy tắc chỉ trưởng phòng sửa.
 */
export function ChoreSettingsTab() {
  const { house } = useCurrentHouse();
  const me = useAuthStore((s) => s.user);
  const isAdmin = house?.myRole === 'ADMIN';
  if (!house) return null;

  return (
    <div className="flex flex-col gap-6">
      <ChoreManager houseId={house.id} isAdmin={isAdmin} />
      <SettingsPanel houseId={house.id} isAdmin={isAdmin} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AbsencePanel houseId={house.id} isAdmin={isAdmin} meUserId={me?.id} />
        <BreakPanel houseId={house.id} isAdmin={isAdmin} />
      </div>
      <AuditPanel houseId={house.id} />
    </div>
  );
}
