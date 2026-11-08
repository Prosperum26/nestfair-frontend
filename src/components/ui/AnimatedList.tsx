import { AnimatePresence, m } from 'motion/react';
import type { ReactNode } from 'react';
import { variants } from '@/lib/motion.ts';
import { shouldUseLayout } from './list-layout.ts';

type ItemTag = 'li' | 'div' | 'tr';

/**
 * Một phần tử danh sách có chuyển động vào/ra. Đặt trong `<AnimatePresence initial={false}>` (hoặc dùng
 * `AnimatedList`) để lần tải đầu không chạy, chỉ phần tử thêm/xóa sau đó mới chạy. Dòng bảng (`tr`) chỉ mờ dần,
 * vì bảng không co chiều cao được.
 */
export function AnimatedItem({
  as = 'div',
  layout = true,
  className,
  onClick,
  children,
}: {
  as?: ItemTag;
  layout?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const props = {
    className,
    onClick,
    layout: as === 'tr' ? false : layout,
    variants: as === 'tr' ? variants.rowItem : variants.listItem,
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
  } as const;
  if (as === 'li') return <m.li {...props}>{children}</m.li>;
  if (as === 'tr') return <m.tr {...props}>{children}</m.tr>;
  return <m.div {...props}>{children}</m.div>;
}

/** Bọc một danh sách có thêm/xóa. Giữ markup item của nơi dùng, chỉ thay vòng `map`. */
export function AnimatedList<T>({
  items,
  getKey,
  render,
  as = 'div',
  className,
  itemClassName,
}: {
  items: readonly T[];
  getKey: (item: T) => string;
  render: (item: T) => ReactNode;
  as?: 'ul' | 'div';
  className?: string;
  itemClassName?: string;
}) {
  const layout = shouldUseLayout(items.length);
  const content = (
    <AnimatePresence initial={false}>
      {items.map((item) => (
        <AnimatedItem key={getKey(item)} as={as === 'ul' ? 'li' : 'div'} layout={layout} className={itemClassName}>
          {render(item)}
        </AnimatedItem>
      ))}
    </AnimatePresence>
  );
  return as === 'ul' ? <ul className={className}>{content}</ul> : <div className={className}>{content}</div>;
}
