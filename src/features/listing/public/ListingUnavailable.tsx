import { DoorClosed, SearchX, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import type { Tone } from '@/components/ui/tones.ts';

type Kind = 'notfound' | 'full' | 'closed';

const COPY: Record<Kind, { icon: ReactNode; tone: Tone; title: string; description: string }> = {
  notfound: {
    icon: <SearchX />,
    tone: 'neutral',
    title: 'Tin không còn khả dụng',
    description: 'Liên kết này sai, hoặc trưởng phòng đã tạm ẩn tin. Bạn thử hỏi lại người gửi link nhé.',
  },
  full: {
    icon: <Users />,
    tone: 'mint',
    title: 'Phòng đã đủ người',
    description: 'Nhà này đã nhận đủ bạn ở ghép nên không còn nhận thêm. Cảm ơn bạn đã quan tâm.',
  },
  closed: {
    icon: <DoorClosed />,
    tone: 'yellow',
    title: 'Tin đã đóng',
    description: 'Trưởng phòng đã đóng tin này. Bạn có thể hỏi lại người gửi link xem còn chỗ không.',
  },
};

/** Tin không còn nhận liên hệ (sai slug, đã đủ người, đã đóng). Không có thông tin liên hệ nào ở đây. */
export function ListingUnavailable({ kind, locationText }: { kind: Kind; locationText?: string }) {
  const { icon, tone, title, description } = COPY[kind];
  return (
    <div className="rounded-card border border-line bg-surface">
      <EmptyState
        icon={icon}
        tone={tone}
        title={title}
        description={
          <>
            {description}
            {locationText && <span className="mt-2 block text-ink">Tin ở: {locationText}</span>}
          </>
        }
        action={
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-btn border border-line-2 bg-surface px-[18px] text-btn font-semibold text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus"
          >
            Về NestFair
          </a>
        }
      />
    </div>
  );
}
