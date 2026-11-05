import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { AbsencePanel } from '@/features/chores/components/AbsencePanel.tsx';
import { AuditPanel } from '@/features/chores/components/AuditPanel.tsx';
import { BreakPanel } from '@/features/chores/components/BreakPanel.tsx';
import { ChoreManager } from '@/features/chores/components/ChoreManager.tsx';
import { SettingsPanel } from '@/features/chores/components/SettingsPanel.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Cài đặt việc nhà: danh sách việc, ân hạn, khai vắng, cả nhà vắng và nhật ký thao tác. */
export function HouseSettingsPage() {
  const navigate = useNavigate();
  const { house } = useCurrentHouse();
  const me = useAuthStore((s) => s.user);
  const isAdmin = house?.myRole === 'ADMIN';

  return (
    <>
      <PageHeader
        overline={house?.name}
        title="Cài đặt việc nhà"
        description={isAdmin ? 'Quản lý việc, quy tắc, vắng mặt và xem nhật ký.' : 'Khai vắng và xem nhật ký. Chỉ trưởng phòng sửa được việc và quy tắc.'}
        actions={
          <>
            {isAdmin && (
              <Button variant="secondary" leftIcon={<Settings />} onClick={() => navigate('/house')}>
                Cài đặt nhà
              </Button>
            )}
            <Button variant="secondary" leftIcon={<ArrowLeft />} onClick={() => navigate('/chores')}>
              Về lịch việc nhà
            </Button>
          </>
        }
      />
      {house && (
        <div className="mt-8 flex flex-col gap-6">
          <ChoreManager houseId={house.id} isAdmin={isAdmin} />
          <SettingsPanel houseId={house.id} isAdmin={isAdmin} />
          <div className="grid gap-6 lg:grid-cols-2">
            <AbsencePanel houseId={house.id} isAdmin={isAdmin} meUserId={me?.id} />
            <BreakPanel houseId={house.id} isAdmin={isAdmin} />
          </div>
          <AuditPanel houseId={house.id} />
        </div>
      )}
    </>
  );
}
