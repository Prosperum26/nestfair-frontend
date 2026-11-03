import { Link } from 'react-router';
import { Logo } from '@/components/ui/Logo.tsx';

const LINKS = [
  { to: '/terms', label: 'Điều khoản' },
  { to: '/privacy', label: 'Quyền riêng tư' },
  { to: '/contact', label: 'Liên hệ' },
] as const;

/** Chân trang các trang công khai. */
export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-page flex-col gap-5 px-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-0">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          <Logo size="sm" />
          <p className="text-cap text-ink-2">Sổ chung cho nhà trọ sinh viên</p>
        </div>
        <nav aria-label="Chân trang" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-btn-sm text-sm font-medium text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:shadow-focus"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="font-mono text-cap text-ink-2">Đồ án MSIS207 · UIT · 2026</p>
      </div>
    </footer>
  );
}
