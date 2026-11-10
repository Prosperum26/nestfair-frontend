import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { countUpFrame } from './count-up.ts';
import { duration } from './motion.ts';

/**
 * Số tiền đếm từ giá trị đang hiện tới `value` (lần đầu đếm từ 0). Người dùng bật "giảm chuyển động" thì
 * hiện thẳng giá trị cuối.
 */
export function useCountUp(value: number): number {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const from = current.current;
    const controls = animate(0, 1, {
      duration: duration.slow,
      ease: 'linear',
      onUpdate: (t) => {
        current.current = countUpFrame(from, value, t);
        setShown(current.current);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return reduce ? value : shown;
}
