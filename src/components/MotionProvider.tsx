import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { duration, ease } from '@/lib/motion.ts';

/**
 * Bọc toàn app: chỉ nạp phần animation cơ bản (`domAnimation`); `strict` báo lỗi nếu lỡ dùng `motion.*`
 * thay cho `m.*`. Người dùng bật "giảm chuyển động" thì mọi hiệu ứng di chuyển tự tắt.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.out }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
