import { Scale, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import type { AvatarTone } from '@/components/ui/tones.ts';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { Logo } from '@/components/ui/Logo.tsx';
import { LedgerRow, Receipt } from '@/components/ui/Receipt.tsx';
import { Stamp } from '@/components/ui/Stamp.tsx';
import { cn } from '@/lib/cn.ts';
import { formatVnd } from '@/lib/format.ts';

// Dữ liệu mẫu Design.md mục 7: tiền điện tháng 10 chia đều 4 người.
const SPLIT: { name: string; tone: AvatarTone }[] = [
  { name: 'Hùng', tone: 'lil' },
  { name: 'Thiện', tone: 'mint' },
  { name: 'Mai', tone: 'yellow' },
  { name: 'Quân', tone: 'sky' },
];

function BrandArt() {
  return (
    <div className="relative h-[330px]">
      <Receipt className="absolute left-0 top-0 -rotate-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-btn bg-hl-soft text-hl-ink">
            <Zap className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-h4 text-ink">Tiền điện tháng 10</p>
            <p className="text-cap text-ink-2">01.10 · Mai trả</p>
          </div>
        </div>
        <hr className="my-4 border-0 border-t-[1.5px] border-dashed border-line-2" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink-2">Tổng hóa đơn</span>
          <span className="font-mono text-ml text-ink">{formatVnd(840_000)}</span>
        </div>
        <span className="mt-3 inline-flex h-[26px] items-center gap-1.5 rounded-full bg-paper-2 px-2.5 text-cap font-semibold text-ink-2">
          <Scale className="size-3.5" aria-hidden />
          Chia đều
        </span>
        <div className="mt-3.5 flex flex-col gap-3.5">
          {SPLIT.map((m) => (
            <LedgerRow
              key={m.name}
              left={
                <>
                  <Avatar name={m.name} tone={m.tone} size={24} />
                  {m.name}
                </>
              }
              amount={formatVnd(210_000)}
            />
          ))}
        </div>
      </Receipt>
      <Stamp label="ĐÃ CHIA" date="01.10.2026" className="absolute left-[329px] top-[38px]" />
    </div>
  );
}

interface AuthLayoutProps {
  /** Câu trích lớn ở panel tối (desktop). */
  quote: string;
  caption: string;
  /** Bề rộng form desktop theo thiết kế: 400 (đăng nhập), 420 (đăng ký). */
  formWidth?: 400 | 420;
  children: ReactNode;
}

/**
 * Bố cục màn Đăng nhập / Đăng ký (preview 02, 03).
 * Desktop (lg+): panel tối trái (cụm trích dẫn + hóa đơn căn giữa) + form giữa phần phải.
 * Mobile: top bar tối 64px chỉ có logo + form.
 */
export function AuthLayout({ quote, caption, formWidth = 400, children }: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-paper lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:grid-cols-[620px_minmax(0,1fr)]">
      {/* Panel desktop */}
      <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:min-h-svh lg:flex-col">
        <GridPaper />
        <Link to="/" className="relative mt-14 ml-14 self-start" aria-label="NestFair">
          <Logo tone="onInk" />
        </Link>
        {/* Căn giữa theo chiều dọc phần còn lại dưới logo; pb bù chiều cao logo để cụm cân giữa panel. */}
        <div className="relative my-auto px-14 pt-12 pb-[100px]">
          <p className="max-w-[460px] font-display text-dm text-white xl:text-dl">{quote}</p>
          <p className="mt-6 text-sm text-ink-on2">{caption}</p>
          <div className="mt-9">
            <BrandArt />
          </div>
        </div>
      </aside>

      {/* Top bar mobile h64: chỉ logo. */}
      <header className="relative flex h-16 items-center overflow-hidden bg-ink px-4 lg:hidden">
        <GridPaper />
        <Link to="/" className="relative inline-flex" aria-label="NestFair">
          <Logo tone="onInk" size="sm" />
        </Link>
      </header>

      <main className="flex justify-center px-4 pt-8 pb-12 lg:items-center lg:px-10 lg:py-16">
        <div className={cn('w-full', formWidth === 400 ? 'max-w-[400px]' : 'max-w-[420px]')}>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Tiêu đề form: Fraunces h1 (mobile h1m) + mô tả sm. */
export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 lg:mb-7">
      <h1 className="font-display text-h1m text-ink lg:text-h1">{title}</h1>
      <p className="mt-1.5 text-sm text-ink-2 lg:mt-2.5">{description}</p>
    </div>
  );
}
