import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { LinkButton } from '@/components/ui/LinkButton.tsx';
import { Logo } from '@/components/ui/Logo.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';
import { PUBLIC_LINKS } from './public-links.ts';

const LINK_CLS = 'text-sm font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:shadow-focus rounded-btn-sm px-2 py-1.5';

/** Thanh trên cùng của các trang công khai (landing, điều khoản, quyền riêng tư, liên hệ). */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-40 focus:rounded-btn focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Bỏ qua điều hướng
      </a>
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 lg:h-[72px] lg:px-6 xl:px-0">
        <Link to="/" aria-label="NestFair, về trang chủ" className="rounded-btn-sm focus-visible:outline-none focus-visible:shadow-focus">
          <Logo />
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-3 lg:flex">
          {PUBLIC_LINKS.map((l) => (
            <Link key={l.hash} to={{ pathname: '/', hash: l.hash }} className={LINK_CLS}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {authed ? (
            <LinkButton to="/" variant="accent" size="sm">
              Vào ứng dụng
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">
                Đăng nhập
              </LinkButton>
              <LinkButton to="/register" variant="accent" size="sm" className="max-sm:hidden">
                Tạo nhà miễn phí
              </LinkButton>
            </>
          )}
          <IconButton
            className="lg:hidden"
            icon={open ? <X /> : <Menu />}
            label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            aria-controls="public-menu"
            onClick={() => setOpen((v) => !v)}
          />
        </div>
      </div>

      {open && (
        <div id="public-menu" className="border-t border-line bg-paper lg:hidden">
          <nav aria-label="Điều hướng chính" className="mx-auto flex max-w-page flex-col gap-1 px-4 py-3">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.hash}
                to={{ pathname: '/', hash: l.hash }}
                onClick={close}
                className="flex h-11 items-center rounded-btn px-3 text-b font-medium text-ink hover:bg-paper-2 focus-visible:outline-none focus-visible:shadow-focus"
              >
                {l.label}
              </Link>
            ))}
            {!authed && (
              <LinkButton to="/register" variant="accent" fullWidth onClick={close} className="mt-2 sm:hidden">
                Tạo nhà miễn phí
              </LinkButton>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
