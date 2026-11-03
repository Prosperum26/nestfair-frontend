import { ChevronRight, FileText, Mail, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { PublicFooter } from '@/components/layout/PublicFooter.tsx';
import { PublicHeader } from '@/components/layout/PublicHeader.tsx';
import { cn } from '@/lib/cn.ts';

const TABS = [
  { to: '/terms', label: 'Điều khoản', icon: FileText },
  { to: '/privacy', label: 'Quyền riêng tư', icon: ShieldCheck },
  { to: '/contact', label: 'Liên hệ', icon: Mail },
] as const;

export type PublicTab = (typeof TABS)[number]['to'];

/**
 * Khung chung của 3 trang Điều khoản, Quyền riêng tư, Liên hệ: header, đường dẫn, tiêu đề, thanh chuyển trang và footer.
 * Nội dung chính truyền vào `children`.
 */
export function PublicPageShell({
  current,
  overline,
  title,
  intro,
  children,
}: {
  current: PublicTab;
  overline: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh bg-paper">
      <PublicHeader />
      <main id="main">
        <div className="border-b border-line">
          <div className="mx-auto max-w-page px-4 pt-8 pb-10 lg:px-6 lg:pt-12 lg:pb-14 xl:px-0">
            <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-cap text-ink-2">
              <Link to="/" className="rounded-btn-sm hover:text-ink focus-visible:outline-none focus-visible:shadow-focus">
                Trang chủ
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <span aria-current="page" className="font-medium text-ink">
                {title}
              </span>
            </nav>
            <p className="mt-6 font-mono text-over uppercase text-ink-2">{overline}</p>
            <h1 className="mt-2 font-display text-dm font-bold text-ink max-sm:text-h1m lg:text-[48px] lg:leading-[54px] lg:tracking-[-1px]">
              {title}
            </h1>
            <p className="mt-4 max-w-[68ch] text-b text-ink-2 lg:text-[17px] lg:leading-7">{intro}</p>

            <nav aria-label="Trang pháp lý và liên hệ" className="mt-7 flex flex-wrap gap-2">
              {TABS.map((t) => {
                const active = t.to === current;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-btn border px-4 text-btns focus-visible:outline-none focus-visible:shadow-focus [&_svg]:size-4',
                      active ? 'border-ink bg-ink text-white' : 'border-line-2 bg-surface text-ink hover:bg-paper-2',
                    )}
                  >
                    <t.icon aria-hidden />
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="mx-auto max-w-page px-4 py-10 lg:px-6 lg:py-14 xl:px-0">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}
