import { ChevronRight, House, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { CreateHouseCard } from '@/features/houses/components/CreateHouseCard.tsx';
import { JoinHouseCard } from '@/features/houses/components/JoinHouseCard.tsx';
import { OnboardingFrame } from '@/features/houses/components/OnboardingFrame.tsx';
import { useMyHouses } from '@/features/houses/hooks.ts';
import type { HouseDetail } from '@/features/houses/types.ts';
import { cn } from '@/lib/cn.ts';

type Tab = 'join' | 'create';

/**
 * Bước 2/3: tạo nhà mới hoặc vào nhà bằng mã mời (preview 04).
 * Desktop: 2 thẻ cạnh nhau. Mobile: tab chuyển qua lại, mặc định "Nhập mã mời".
 */
export function OnboardingPage() {
  const [tab, setTab] = useState<Tab>('join');
  const navigate = useNavigate();
  const houses = useMyHouses();

  const onCreated = (house: HouseDetail) => navigate(`/onboarding/invite/${house.id}`);
  const onJoined = (house: HouseDetail) => {
    toast(`Bạn đã vào ${house.name}.`);
    navigate('/dashboard');
  };

  return (
    <OnboardingFrame step={2}>
      <div className="lg:text-center">
        <p className="font-mono text-over uppercase text-ink-2">Bước 2 / 3</p>
        <h1 className="mt-2 font-display text-[38px] leading-[44px] font-bold tracking-[-0.8px] text-ink lg:mt-3 lg:text-dl">
          Bạn muốn bắt đầu thế nào?
        </h1>
        <p className="mt-3 hidden text-[18px] leading-7 text-ink-2 sm:block">
          Tạo một ngôi nhà mới cho phòng của bạn, hoặc nhập mã mời từ trưởng phòng.
        </p>
      </div>

      <SegmentedControl
        label="Cách bắt đầu"
        className="mt-6 lg:hidden"
        options={[
          { value: 'join', label: 'Nhập mã mời' },
          { value: 'create', label: 'Tạo nhà mới' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-2">
        <div className={cn(tab !== 'create' && 'hidden lg:block')}>
          <CreateHouseCard onCreated={onCreated} />
        </div>
        <div className={cn(tab !== 'join' && 'hidden lg:block')}>
          <JoinHouseCard onJoined={onJoined} />
        </div>
      </div>

      {tab === 'join' && (
        <button
          type="button"
          onClick={() => setTab('create')}
          className="mt-6 flex w-full items-center gap-3 rounded-card border border-line bg-surface p-4 text-left lg:hidden"
        >
          <IconTile icon={<House />} tone="hl" size={40} />
          <span className="min-w-0 flex-1">
            <span className="block text-h4 text-ink">Chưa có nhà?</span>
            <span className="block text-sm text-ink-2">Tạo nhà mới và mời bạn cùng phòng.</span>
          </span>
          <ChevronRight className="size-5 text-ink" aria-hidden />
        </button>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-ink-2 lg:mt-10">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        Bạn có thể tham gia nhiều nhà và chuyển qua lại bất cứ lúc nào.
      </p>
      {!!houses.data?.length && (
        <p className="mt-3 text-center text-sm">
          <Link
            to="/dashboard"
            className="font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]"
          >
            Quay lại Tổng quan
          </Link>
        </p>
      )}
    </OnboardingFrame>
  );
}
