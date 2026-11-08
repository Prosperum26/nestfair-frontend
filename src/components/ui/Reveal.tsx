import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { variants } from '@/lib/motion.ts';

/** Nội dung vừa tải xong (thay chỗ skeleton): hiện dần, trượt lên 4px một lần khi mount. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.div className={className} variants={variants.fadeUp} initial="hidden" animate="visible" transition={delay ? { delay } : undefined}>
      {children}
    </m.div>
  );
}
