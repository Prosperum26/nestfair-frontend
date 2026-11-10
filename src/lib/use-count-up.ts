import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { countUpFrame } from './count-up.ts';
import { duration } from './motion.ts';

/**
 * Số tiền đếm từ giá trị đang hiện tới `value` (lần đầu đếm từ `from`, mặc định 0), bắt đầu sau `delay` giây.
 * Người dùng bật "giảm chuyển động" thì hiện thẳng giá trị cuối.
 */
export function useCountUp(value: number, { delay = 0, from = 0 }: { delay?: number; from?: number } = {}): number {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(from);
  const current = useRef(from);

  useEffect(() => {
    if (reduce) return;
    const start = current.current;
    const controls = animate(0, 1, {
      duration: duration.slow,
      delay,
      ease: 'linear',
      onUpdate: (t) => {
        current.current = countUpFrame(start, value, t);
        setShown(current.current);
      },
    });
    return () => controls.stop();
  }, [value, reduce, delay]);

  return reduce ? value : shown;
}
