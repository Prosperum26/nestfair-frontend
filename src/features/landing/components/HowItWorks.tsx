import { ArrowRight, CircleCheck, Zap } from 'lucide-react';
import { m, useReducedMotion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { LinkButton } from '@/components/ui/LinkButton.tsx';
import { InView, InViewItem } from '@/components/ui/Reveal.tsx';
import { formatVnd } from '@/lib/format.ts';
import { delayed, variants } from '@/lib/motion.ts';
import { SectionHeading } from './SectionHeading.tsx';

const INVITE_CODE = 'K7M2QX';

/** Mã mời mẫu theo 6 ô nhỏ (minh họa, không phải ô nhập). */
function InviteCode() {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`Mã mời mẫu ${INVITE_CODE.split('').join(' ')}`}>
      {INVITE_CODE.split('').map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="flex size-9 items-center justify-center rounded-btn-sm border border-line-2 bg-surface font-mono text-[16px] font-bold text-ink"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function LedgerSample() {
  return (
    <div className="rounded-btn border border-line bg-surface px-3.5 py-3">
      <div className="flex items-center gap-2">
        <IconTile icon={<Zap />} tone="yellow" size={24} />
        <span className="text-sm font-medium text-ink">Tiền điện</span>
        <span className="h-0 flex-1 translate-y-1 border-b-[1.5px] border-dotted border-line-2" />
        <span className="font-mono text-ms text-ink">{formatVnd(840_000)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-cap text-ink-2">
        <span>Mỗi người</span>
        <span className="font-mono text-ink">{formatVnd(210_000)}</span>
      </div>
    </div>
  );
}

/** Vạch quét chạy dọc mã QR một lần khi bước 3 hiện ra (nhận trạng thái từ khối cha). */
const SCAN_DELAY = 0.5;

function PaySample() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex items-center gap-4 rounded-btn border border-line bg-surface p-3">
      <div className="relative shrink-0 overflow-hidden rounded-[8px] border border-line bg-white p-1.5">
        {!reduceMotion && (
          <m.span aria-hidden variants={delayed(variants.scanSweep, SCAN_DELAY)} className="absolute inset-x-0 h-[2px] bg-ink" />
        )}
        <QRCodeSVG value="https://img.vietqr.io/image/MB-0123456789-compact2.png?amount=170000&addInfo=NestFair%20Hung%20Quan" size={56} marginSize={0} title="Mã VietQR mẫu" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-mm text-ink">{formatVnd(170_000)}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-cap text-ink-2">
          <Avatar name="Hùng" tone="lil" size={16} /> Hùng → Quân
        </p>
        <Chip tone="mint" size="sm" icon={<CircleCheck />} className="mt-2">
          Đã nhận
        </Chip>
      </div>
    </div>
  );
}

function Step({ n, title, text, last, children }: { n: number; title: string; text: string; last?: boolean; children: ReactNode }) {
  return (
    <InViewItem as="li" className="flex flex-col">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-hl font-display text-ct text-ink"
        >
          {n}
        </span>
        {!last && (
          <m.span
            aria-hidden
            variants={delayed(variants.markerSweep, n * 0.15)}
            style={{ originX: 0 }}
            className="hidden h-0 flex-1 border-t-[1.5px] border-dashed border-line-2 lg:block"
          />
        )}
      </div>
      <h3 className="mt-5 text-h4 text-ink">
        <span className="sr-only">Bước {n}: </span>
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-ink-2">{text}</p>
      <div className="mt-4">{children}</div>
    </InViewItem>
  );
}

/** "Ba bước để mở sổ chung": tạo nhà → ghi chi tiêu, xếp việc → rút gọn và trả bằng VietQR. */
export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-16 mx-auto max-w-page px-4 py-20 lg:px-6 lg:py-24 xl:px-0">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading id="how-title" overline="Cách dùng" title="Ba bước để mở sổ chung" />
        <LinkButton to="/register" variant="primary" rightIcon={<ArrowRight />} className="self-start sm:self-auto">
          Tạo nhà miễn phí
        </LinkButton>
      </div>
      <InView as="ol" stagger className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
        <Step n={1} title="Tạo nhà và mời bạn" text="Đặt tên nhà, gửi mã mời 6 ký tự cho bạn cùng phòng.">
          <InviteCode />
        </Step>
        <Step n={2} title="Ghi chi tiêu, xếp việc" text="Ai trả gì thì ghi lại; lịch việc nhà tự xoay vòng.">
          <LedgerSample />
        </Step>
        <Step n={3} last title="Rút gọn và trả bằng VietQR" text="Quét mã, chủ nợ bấm xác nhận, số dư về 0.">
          <PaySample />
        </Step>
      </InView>
    </section>
  );
}
