import { ArrowRight, Copy, Share2, TriangleAlert, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { SessionLoader } from '@/components/SessionLoader.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { CodeBoxes } from '@/components/ui/CodeInput.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { OnboardingFrame } from '@/features/houses/components/OnboardingFrame.tsx';
import { useHouseDetail } from '@/features/houses/hooks.ts';
import { formatDate } from '@/lib/date.ts';

/** Bước 3/3: nhà đã tạo, gửi mã mời cho bạn cùng phòng rồi vào Tổng quan. */
export function OnboardingInvitePage() {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const house = useHouseDetail(houseId);

  if (house.isPending) return <SessionLoader label="Đang tải nhà" />;
  if (house.isError) {
    return (
      <OnboardingFrame step={3}>
        <EmptyState
          icon={<TriangleAlert />}
          tone="tom"
          title="Không mở được nhà này"
          description={house.error.message}
          action={
            <Link to="/" className="text-sm font-semibold text-ink underline">
              Về trang chính
            </Link>
          }
        />
      </OnboardingFrame>
    );
  }

  const { name, inviteCode, inviteExpiresAt, maxMembers, members } = house.data;
  const shareText = `Vào ${name} trên NestFair bằng mã mời ${inviteCode} (hết hạn ${formatDate(new Date(inviteExpiresAt))}).`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast('Đã sao chép mã mời.');
    } catch {
      toast(`Mã mời: ${inviteCode}`);
    }
  };
  const share = () => navigator.share({ title: `Mời vào ${name}`, text: shareText }).catch(() => {});

  return (
    <OnboardingFrame step={3}>
      <div className="mx-auto max-w-[520px]">
        <p className="font-mono text-over uppercase text-ink-2">Bước 3 / 3</p>
        <h1 className="mt-2 font-display text-[38px] leading-[44px] font-bold tracking-[-0.8px] text-ink lg:text-dl">
          {name} đã sẵn sàng
        </h1>
        <p className="mt-3 text-sm text-ink-2">
          Gửi mã này cho bạn cùng phòng. Họ nhập ở mục “Vào nhà có sẵn” sau khi đăng ký.
        </p>

        <section
          aria-label="Mã mời"
          className="mt-8 rounded-card border-[1.5px] border-ink bg-surface p-5 shadow-hard-lg sm:p-7"
        >
          <p className="font-mono text-over uppercase text-ink-2">Mã mời</p>
          <CodeBoxes value={inviteCode} className="mt-3" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-cap text-ink-2">
            <span>
              Hết hạn <span className="font-mono">{formatDate(new Date(inviteExpiresAt))}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              <span className="font-mono">
                {members.length}/{maxMembers}
              </span>{' '}
              người
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" leftIcon={<Copy />} onClick={() => void copy()}>
              Sao chép mã
            </Button>
            {typeof navigator.share === 'function' && (
              <Button variant="secondary" leftIcon={<Share2 />} onClick={() => void share()}>
                Chia sẻ
              </Button>
            )}
          </div>
        </section>

        <Button
          variant="accent"
          size="lg"
          fullWidth
          className="mt-8"
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          Vào Tổng quan
          <ArrowRight aria-hidden />
        </Button>
        <p className="mt-3 text-center text-cap text-ink-2">
          Bạn xem lại mã mời bất cứ lúc nào ở mục Thành viên.
        </p>
      </div>
    </OnboardingFrame>
  );
}
