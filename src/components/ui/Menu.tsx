import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn.ts';

interface MenuProps {
  /** Nút mở menu; nhận props aria + onClick để gắn vào phần tử bấm. */
  trigger: (props: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu';
  }) => ReactNode;
  align?: 'left' | 'right';
  /** Nội dung; gọi close() sau khi chọn một mục. */
  children: (close: () => void) => ReactNode;
  className?: string;
}

/** Menu thả xuống: đóng khi bấm ra ngoài hoặc nhấn Escape. */
export function Menu({ trigger, align = 'right', children, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({
        onClick: () => setOpen((v) => !v),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-2 min-w-[220px] rounded-card border-[1.5px] border-ink bg-surface p-1.5 shadow-hard',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** Một dòng trong Menu (button hoặc link tự bọc ngoài). */
export function MenuItem({
  icon,
  children,
  onSelect,
  active,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onSelect: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-btn-sm px-3 py-2.5 text-left text-sm text-ink hover:bg-paper focus-visible:outline-none focus-visible:bg-paper [&_svg]:size-[18px] [&_svg]:shrink-0',
        active && 'font-semibold',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-line" role="separator" />;
}
