import { Bed, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { Chip } from '@/components/ui/Chip.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { cn } from '@/lib/cn.ts';
import type { PhotoCategory } from '../types.ts';
import { firstIndexOf, flattenGallery, galleryTabs, type GalleryPhotos, indexLabel, stepIndex } from './gallery.ts';

const FRAME_STYLE = { aspectRatio: '4 / 3' } as const;

const NAV_CLASS =
  'absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-btn border border-line-2 bg-surface text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus [&_svg]:size-5';

/** Hình minh họa khi chưa có ảnh (hoặc ảnh lỗi): đường núi và giường trên nền vàng nhạt, như ảnh 21. */
function Placeholder() {
  return (
    <div data-gallery-placeholder className="relative size-full bg-hl-soft">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <path d="M16 280 L140 150 L230 220 L310 170 L384 236" fill="none" stroke="#6B5300" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Bed className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-[60%] text-hl-ink" strokeWidth={2} aria-hidden />
    </div>
  );
}

/**
 * Thư viện ảnh công khai (ảnh 21): ảnh lớn 4:3 kèm chip chỉ số tổng, thẻ nhóm, hàng ảnh nhỏ của nhóm đang chọn,
 * nút trước/sau và phím mũi tên. Không lightbox, không thư viện ngoài.
 */
export function Gallery({ photos }: { photos: GalleryPhotos }) {
  const items = flattenGallery(photos);
  const tabs = galleryTabs(photos);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-card" style={FRAME_STYLE} role="img" aria-label="Chưa có ảnh">
        <Placeholder />
      </div>
    );
  }

  const current = items[Math.min(index, items.length - 1)];
  const currentIndex = items.indexOf(current);
  const sameGroup = items.filter((item) => item.category === current.category);

  const go = (next: number) => setIndex(next);
  const step = (delta: number) => go(stepIndex(currentIndex, items.length, delta));
  const pickCategory = (category: PhotoCategory) => {
    const first = firstIndexOf(items, category);
    if (first >= 0) go(first);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (items.length < 2) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  };
  const markFailed = (id: string) => setFailed((prev) => new Set(prev).add(id));

  return (
    <section aria-label="Ảnh của phòng" className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="thư viện ảnh"
        aria-label={`Ảnh ${indexLabel(currentIndex, items.length)}: ${current.label}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative overflow-hidden rounded-card bg-paper-2 focus-visible:outline-none focus-visible:shadow-focus"
        style={FRAME_STYLE}
      >
        {failed.has(current.id) ? (
          <Placeholder />
        ) : (
          <img
            key={current.id}
            src={current.url}
            alt={current.label}
            decoding="async"
            onError={() => markFailed(current.id)}
            className="size-full object-cover"
          />
        )}
        {items.length > 1 && (
          <>
            <button type="button" aria-label="Ảnh trước" onClick={() => step(-1)} className={cn(NAV_CLASS, 'left-3')}>
              <ChevronLeft aria-hidden />
            </button>
            <button type="button" aria-label="Ảnh sau" onClick={() => step(1)} className={cn(NAV_CLASS, 'right-3')}>
              <ChevronRight aria-hidden />
            </button>
          </>
        )}
        <Chip tone="ink" icon={<ImageIcon aria-hidden />} className="absolute right-3 bottom-3">
          {indexLabel(currentIndex, items.length)}
        </Chip>
      </div>

      {tabs.length > 1 && (
        <SegmentedControl
          label="Nhóm ảnh"
          options={tabs.map((t) => ({ value: t.key, label: t.label }))}
          value={current.category}
          onChange={pickCategory}
        />
      )}

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {sameGroup.map((item) => {
          const active = item.id === current.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`Xem ảnh ${item.label}`}
                aria-current={active || undefined}
                onClick={() => go(items.indexOf(item))}
                style={FRAME_STYLE}
                className={cn(
                  'relative block w-full overflow-hidden rounded-btn border-2 bg-paper-2 focus-visible:outline-none focus-visible:shadow-focus',
                  active ? 'border-ink' : 'border-transparent',
                )}
              >
                {failed.has(item.id) ? (
                  <Placeholder />
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => markFailed(item.id)}
                    className="size-full object-cover"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
