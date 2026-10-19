import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn.ts';

/**
 * Modal desktop (r20, viền 1.5 ink, bóng 8/8) và bottom sheet trên mobile (Design.md mục 5).
 * Dùng <dialog> gốc: có focus trap, Esc để đóng và scrim ::backdrop (ink 0.55).
 */
export function Modal({
  open,
  onClose,
  overline,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** Dòng mono viết hoa phía trên tiêu đề ("VIETQR · NAPAS 247"). */
  overline?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        // Bấm ra ngoài (vào ::backdrop) thì sự kiện đích là chính <dialog>.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-32px)] max-w-[520px] overflow-visible rounded-modal border-[1.5px] border-ink bg-surface p-0 text-ink shadow-hard-lg',
        'backdrop:bg-ink/55',
        'max-sm:mt-auto max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0',
        className,
      )}
    >
      <div className="max-h-[90dvh] overflow-y-auto p-6 max-sm:px-4 max-sm:pb-8">
        <div className="mx-auto mb-4 h-[5px] w-10 rounded-full bg-line-2 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {overline && <p className="mb-1 font-mono text-over uppercase text-ink-2">{overline}</p>}
            <h2 className="font-display text-h1m text-ink">{title}</h2>
            {description && <p className="mt-1.5 text-sm text-ink-2">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-btn text-ink-2 hover:bg-paper-2 focus-visible:outline-none focus-visible:shadow-focus"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
