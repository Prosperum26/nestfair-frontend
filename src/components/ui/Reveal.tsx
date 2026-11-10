import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { delayed, variants, viewport } from '@/lib/motion.ts';

/** Nội dung vừa tải xong (thay chỗ skeleton): hiện dần, trượt lên 4px một lần khi mount. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.div className={className} variants={delay ? delayed(variants.fadeUp, delay) : variants.fadeUp} initial="hidden" animate="visible">
      {children}
    </m.div>
  );
}

/**
 * Khối hiện dần khi cuộn tới, chạy một lần. `stagger`: các `InViewItem` bên trong hiện lần lượt thay vì cả khối
 * cùng lúc. Chỉ dùng cho trang công khai (landing); trong app, dữ liệu dùng `Reveal` khi tải xong.
 */
export function InView({
  children,
  as = 'div',
  stagger = false,
  className,
}: {
  children: ReactNode;
  as?: 'div' | 'ul' | 'ol';
  stagger?: boolean;
  className?: string;
}) {
  const props = {
    className,
    variants: stagger ? variants.staggerGroup : variants.fadeUp,
    initial: 'hidden',
    whileInView: 'visible',
    viewport,
  } as const;
  if (as === 'ul') return <m.ul {...props}>{children}</m.ul>;
  if (as === 'ol') return <m.ol {...props}>{children}</m.ol>;
  return <m.div {...props}>{children}</m.div>;
}

/** Phần tử con của `InView stagger`: nhận trạng thái từ khối cha, không tự theo dõi cuộn. */
export function InViewItem({ children, as = 'div', className }: { children: ReactNode; as?: 'div' | 'li'; className?: string }) {
  if (as === 'li')
    return (
      <m.li className={className} variants={variants.fadeUp}>
        {children}
      </m.li>
    );
  return (
    <m.div className={className} variants={variants.fadeUp}>
      {children}
    </m.div>
  );
}
