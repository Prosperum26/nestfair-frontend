import { ArrowRight, ArrowLeftRight, ListChecks, Scale } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { InView, InViewItem } from '@/components/ui/Reveal.tsx';
import type { Tone } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { PEOPLE, type PersonKey } from '../debt-demo.ts';
import { PERSON_BAR, PERSON_TONE } from '../people.ts';
import { SectionHeading } from './SectionHeading.tsx';

function PainCard({
  quote,
  icon,
  tone,
  title,
  children,
  visual,
}: {
  quote: string;
  icon: ReactNode;
  tone: Tone;
  title: string;
  children: ReactNode;
  visual: ReactNode;
}) {
  return (
    <InViewItem className="flex">
      <article className="nf-lift flex flex-1 flex-col rounded-card border border-line bg-surface p-6">
        <blockquote className="font-display text-ct text-ink">“{quote}”</blockquote>
        <div className="my-4 border-t border-dashed border-line-2" />
        <div className="flex items-center gap-3">
          <IconTile icon={icon} tone={tone} size={36} />
          <h3 className="text-h4 text-ink">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-ink-2">{children}</p>
        <div className="mt-auto pt-5">{visual}</div>
      </article>
    </InViewItem>
  );
}

const SPLIT: PersonKey[] = ['H', 'T', 'M', 'Q'];

function SplitBars() {
  return (
    <div>
      <div className="flex h-2 gap-1" aria-hidden>
        {SPLIT.map((k) => (
          <span key={k} className={cn('flex-1 rounded-full', PERSON_BAR[k])} />
        ))}
      </div>
      <ul className="mt-2 grid grid-cols-4 gap-1 font-mono text-cap text-ink-2" aria-label="Mỗi người 210.000đ">
        {SPLIT.map((k) => (
          <li key={k}>{k} · 210k</li>
        ))}
      </ul>
    </div>
  );
}

const WEEK: { day: string; who: PersonKey }[] = [
  { day: 'T2', who: 'T' },
  { day: 'T3', who: 'H' },
  { day: 'T4', who: 'M' },
  { day: 'T5', who: 'Q' },
  { day: 'T6', who: 'T' },
  { day: 'T7', who: 'H' },
  { day: 'CN', who: 'M' },
];

function WeekStrip() {
  return (
    <ul className="grid grid-cols-7 gap-1" aria-label="Lịch rửa chén trong tuần">
      {WEEK.map((d, i) => (
        <li key={d.day} className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-cap text-ink-2">{d.day}</span>
          <span className={cn('rounded-full', i === 1 && 'ring-2 ring-ink ring-offset-2 ring-offset-surface')}>
            <Avatar name={PEOPLE[d.who].name} tone={PERSON_TONE[d.who]} size={26} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function CollapseChips() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip tone="neutral">6 khoản nợ chéo</Chip>
      <ArrowRight className="size-4 text-ink-2" aria-hidden />
      <Chip tone="ink">2 giao dịch</Chip>
    </div>
  );
}

/** "Ba chuyện hay gây cãi nhau": ba thẻ giới thiệu ba tính năng lõi, mỗi thẻ có minh họa nhỏ. */
export function PainPoints() {
  return (
    <section id="features" aria-labelledby="pain-title" className="scroll-mt-20 mx-auto max-w-page px-4 py-20 lg:px-6 lg:py-24 xl:px-0">
      <SectionHeading
        id="pain-title"
        align="center"
        overline="Ba chuyện hay gây cãi nhau"
        title="Ở chung không khó, khó là sòng phẳng với nhau."
      />
      <InView stagger className="mt-12 grid gap-6 lg:grid-cols-3">
        <PainCard
          quote="Tiền điện tháng này ai trả, mỗi người bao nhiêu?"
          icon={<Scale />}
          tone="yellow"
          title="Chia tiền tới từng đồng"
          visual={<SplitBars />}
        >
          Chia đều, chia chính xác hoặc theo phần. Phần lẻ 1–2 đồng được cộng lần lượt cho từng người nên tổng luôn khớp hóa đơn.
        </PainCard>
        <PainCard
          quote="Hôm nay tới lượt ai rửa chén?"
          icon={<ListChecks />}
          tone="lil"
          title="Việc nhà xoay vòng"
          visual={<WeekStrip />}
        >
          Lịch tự xoay theo tuần, gửi ảnh để bạn cùng phòng duyệt, quá hạn bị trừ điểm. Việc phát sinh thì quay vòng may mắn.
        </PainCard>
        <PainCard
          quote="Nợ qua nợ lại, rối quá!"
          icon={<ArrowLeftRight />}
          tone="mint"
          title="Rút gọn nợ + VietQR"
          visual={<CollapseChips />}
        >
          Gom mọi khoản nợ chéo thành ít giao dịch nhất. Mỗi giao dịch có mã VietQR điền sẵn số tiền và nội dung.
        </PainCard>
      </InView>
    </section>
  );
}
