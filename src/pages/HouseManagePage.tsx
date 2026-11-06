import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { ChoreSettingsTab } from '@/features/chores/components/ChoreSettingsTab.tsx';
import { HouseAdminTab } from '@/features/houses/components/HouseAdminTab.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { type HouseTab, houseTabOptions, parseHouseTab } from '@/features/houses/tabs.ts';

/**
 * Cài đặt nhà, một trang hai tab: "Nhà" (thông tin, mã mời, nội quy, quyền; chỉ trưởng phòng) và "Việc nhà"
 * (việc, ân hạn, khai vắng, nhật ký; ai cũng vào được). Thành viên thường chỉ thấy tab Việc nhà, không có thanh tab.
 */
export function HouseManagePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { house } = useCurrentHouse();
  const isAdmin = house?.myRole === 'ADMIN';
  const tab = parseHouseTab(params.get('tab'), isAdmin);
  const options = houseTabOptions(isAdmin);

  const choresOnly = !isAdmin;
  return (
    <>
      <PageHeader
        overline={house?.name}
        title={tab === 'house' ? 'Cài đặt nhà' : 'Cài đặt việc nhà'}
        description={
          tab === 'house'
            ? 'Thông tin nhà, mã mời, nội quy và quyền trưởng phòng. Chỉ trưởng phòng thấy tab này.'
            : choresOnly
              ? 'Khai vắng và xem nhật ký. Chỉ trưởng phòng sửa được việc và quy tắc.'
              : 'Quản lý việc, quy tắc, vắng mặt và xem nhật ký.'
        }
        actions={
          <Button variant="secondary" leftIcon={<ArrowLeft />} onClick={() => navigate('/chores')}>
            Về lịch việc nhà
          </Button>
        }
      />
      {options.length > 0 && (
        <SegmentedControl<HouseTab>
          className="mt-6 w-full sm:w-72"
          label="Nhóm cài đặt"
          size="lg"
          options={options}
          value={tab}
          onChange={(next) => setParams(next === 'house' ? {} : { tab: next }, { replace: true })}
        />
      )}
      <div className="mt-8">{tab === 'house' ? <HouseAdminTab /> : <ChoreSettingsTab />}</div>
    </>
  );
}
