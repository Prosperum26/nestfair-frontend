import { Copy, Link2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { copyText } from '@/lib/clipboard.ts';
import { cn } from '@/lib/cn.ts';
import { daysLeft } from '@/lib/date.ts';
import { useRegenerateInviteCode } from '../hooks.ts';
import { inviteLink } from '../invite-code.ts';
import type { HouseDetail } from '../types.ts';

/** Khối tối "Gửi mã này cho bạn cùng phòng mới" (preview 11). */
export function InvitePanel({ house }: { house: HouseDetail }) {
  const regenerate = useRegenerateInviteCode(house.id);
  const isAdmin = house.myRole === 'ADMIN';
  const left = daysLeft(house.inviteExpiresAt);
  const expired = left === 0;
  const full = house.members.length >= house.maxMembers;

  const description = full
    ? 'Nhà đã đủ người. Mã vẫn giữ nhưng không ai vào thêm được cho tới khi có người rời nhà.'
    : expired
      ? isAdmin
        ? 'Mã đã hết hạn. Bấm “Làm mới mã” để tạo mã mới.'
        : 'Mã đã hết hạn. Nhờ trưởng phòng làm mới mã.'
      : isAdmin
        ? 'Trưởng phòng có thể làm mới mã bất cứ lúc nào. Mã cũ sẽ hết hiệu lực ngay.'
        : 'Gửi mã hoặc link mời. Chỉ trưởng phòng mới làm mới được mã.';

  return (
    <section
      aria-labelledby="invite-title"
      className="relative overflow-hidden rounded-card bg-ink p-5 sm:p-6 lg:px-6 lg:py-7"
    >
      <GridPaper />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 lg:flex-1">
          <p className={cn('font-mono text-over uppercase', expired ? 'text-tom-border' : 'text-hl')}>
            Mã mời · {expired ? 'đã hết hạn' : `còn ${left} ngày`}
          </p>
          <h2 id="invite-title" className="mt-2 font-display text-ct text-white lg:text-[26px] lg:leading-8">
            Gửi mã này cho bạn cùng phòng mới
          </h2>
          <p className="mt-2 text-sm text-ink-on2">{description}</p>
        </div>

        <div
          className={cn('flex gap-2', expired && 'opacity-50')}
          role="img"
          aria-label={`Mã mời ${house.inviteCode}${expired ? ', đã hết hạn' : ''}`}
        >
          {house.inviteCode.split('').map((ch, i) => (
            <span
              key={i}
              className="flex h-12 w-11 items-center justify-center rounded-btn border border-ink-line bg-ink-soft font-mono text-[22px] font-bold text-hl sm:h-[52px] sm:w-12 sm:text-[24px]"
              aria-hidden
            >
              {ch}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2.5 lg:flex lg:w-[156px] lg:flex-col">
          <Button
            variant="accent"
            leftIcon={<Copy />}
            disabled={expired}
            onClick={() => void copyText(house.inviteCode, 'Đã sao chép mã mời.')}
          >
            Sao chép mã
          </Button>
          <Button
            variant="onInk"
            leftIcon={<Link2 />}
            disabled={expired}
            onClick={() => void copyText(inviteLink(house.inviteCode), 'Đã sao chép link mời.')}
          >
            <span className="lg:hidden">Link</span>
            <span className="hidden lg:inline">Sao chép link</span>
          </Button>
          {isAdmin && (
            <Button
              variant="onInk"
              leftIcon={<RotateCw />}
              loading={regenerate.isPending}
              className="col-span-2"
              onClick={() =>
                regenerate.mutate(undefined, {
                  onSuccess: () => toast('Đã tạo mã mới. Mã cũ không dùng được nữa.'),
                  onError: (e) => toast(e.message),
                })
              }
            >
              Làm mới mã
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
