import { Link } from 'react-router';

interface Props {
  overline: string;
  title: string;
  description: string;
}

/** Khung tạm cho các màn chưa dựng. Xóa khi màn thật hoàn thành. */
export function PagePlaceholder({ overline, title, description }: Props) {
  return (
    <main className="mx-auto flex min-h-svh max-w-page flex-col justify-center gap-2 px-4">
      <p className="font-mono text-xs font-medium uppercase tracking-[1.2px] text-ink-2">
        {overline}
      </p>
      <h1 className="font-display text-[28px] font-semibold leading-[34px] tracking-[-0.4px] md:text-4xl md:leading-[44px]">
        {title}
      </h1>
      <p className="text-sm text-ink-2">{description}</p>
      <nav className="mt-6 flex gap-4 text-sm font-semibold underline">
        <Link to="/login">Đăng nhập</Link>
        <Link to="/register">Đăng ký</Link>
        <Link to="/onboarding">Onboarding</Link>
      </nav>
    </main>
  );
}
