import { Dice5 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import type { HouseMember } from '@/features/houses/types.ts';
import { firstName } from '@/lib/date.ts';
import { WheelCanvas } from './WheelCanvas.tsx';

/** Thẻ vòng quay ở Tổng quan: bánh xe đứng yên với các thành viên + nút "Quay ngay". */
export function WheelPreview({ members, onSpin }: { members: HouseMember[] | undefined; onSpin: () => void }) {
  const ids = useMemo(() => (members ?? []).map((m) => m.userId), [members]);
  const slices = useMemo(() => {
    if (ids.length === 0) return [];
    const k = Math.ceil(8 / ids.length);
    return Array.from({ length: k }, () => ids).flat();
  }, [ids]);
  const initials = useMemo(
    () => Object.fromEntries((members ?? []).map((m) => [m.userId, firstName(m.fullName).charAt(0).toUpperCase()])),
    [members],
  );
  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <div className="w-44">
        {slices.length > 0 && <WheelCanvas slices={slices} initials={initials} angleAt={() => 0} running={false} label="Vòng quay của nhà" />}
      </div>
      <p className="text-center text-sm text-ink-2">
        Có việc đột xuất chưa ai nhận? Quay để chọn người công bằng, cả nhà cùng xem.
      </p>
      <Button variant="accent" leftIcon={<Dice5 />} onClick={onSpin} disabled={ids.length < 2}>
        Quay ngay
      </Button>
      {ids.length > 0 && ids.length < 2 && <p className="text-cap text-ink-2">Cần ít nhất 2 người để quay. Mời thêm bạn bằng mã mời nhé!</p>}
    </div>
  );
}
