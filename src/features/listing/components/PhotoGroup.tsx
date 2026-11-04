import { Check, Plus, Trash2, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Chip } from '@/components/ui/Chip.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { IMAGE_ACCEPT } from '@/features/expenses/image-upload.ts';
import { cn } from '@/lib/cn.ts';
import { MAX_PHOTOS_PER_GROUP } from '../photos.ts';
import type { ListingPhoto, PhotoCategory } from '../types.ts';

const tile = 'relative size-full aspect-square overflow-hidden rounded-btn-sm';

/**
 * Một nhóm ảnh: tiêu đề + chip đếm, lưới ô ảnh (xóa, đặt làm bìa với nhóm Phòng ngủ),
 * ô thêm ảnh (khóa khi đủ 6 hoặc đang tải).
 */
export function PhotoGroup({
  category,
  label,
  icon,
  photos,
  uploading,
  canEdit,
  isBedroom,
  deletingId,
  coverId,
  onPick,
  onDelete,
  onCover,
}: {
  category: PhotoCategory;
  label: string;
  icon: ReactNode;
  photos: ListingPhoto[];
  /** Số ảnh đang tải lên (hiện ô skeleton). */
  uploading: number;
  canEdit: boolean;
  isBedroom: boolean;
  deletingId: string | null;
  coverId: string | null;
  onPick: (category: PhotoCategory, files: File[]) => void;
  onDelete: (photo: ListingPhoto) => void;
  onCover: (photo: ListingPhoto) => void;
}) {
  const count = photos.length;
  const full = count >= MAX_PHOTOS_PER_GROUP;
  const addDisabled = full || uploading > 0;
  const inputId = `listing-photo-${category}`;

  return (
    <div role="group" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-medium text-ink [&_svg]:size-4 [&_svg]:text-ink-2">
          {icon}
          {label}
        </h3>
        {count > 0 ? (
          <Chip tone="mint" size="sm" icon={<Check />}>
            {count} ảnh
          </Chip>
        ) : (
          <Chip tone="tom" size="sm" icon={<TriangleAlert />}>
            Cần ít nhất 1 ảnh
          </Chip>
        )}
      </div>

      <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-[repeat(auto-fill,96px)]">
        {photos.map((p, i) => (
          <li key={p.id} className="relative aspect-square">
            <div className={cn(tile, 'bg-paper-2', deletingId === p.id && 'opacity-50')}>
              <img src={p.url} alt={`${label} ${i + 1}`} loading="lazy" className="size-full object-cover" />
              {isBedroom && p.id === coverId && (
                <span className="absolute bottom-1 left-1 rounded-full bg-hl px-2 py-0.5 text-cap font-semibold text-ink">Ảnh bìa</span>
              )}
              {canEdit && isBedroom && p.id !== coverId && (
                <button
                  type="button"
                  onClick={() => onCover(p)}
                  disabled={deletingId !== null}
                  className="absolute inset-x-0 bottom-0 h-8 bg-ink/70 text-cap font-semibold text-white after:absolute after:inset-x-0 after:-top-3 after:bottom-0 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60"
                >
                  Đặt làm bìa
                </button>
              )}
            </div>
            {canEdit && (
              <button
                type="button"
                aria-label={`Xóa ảnh ${i + 1} (${label})`}
                onClick={() => onDelete(p)}
                disabled={deletingId !== null}
                className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-full border border-line bg-surface text-ink after:absolute after:-inset-1.5 hover:bg-tom-bg hover:text-tom focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 [&_svg]:size-4"
              >
                <Trash2 aria-hidden />
              </button>
            )}
          </li>
        ))}

        {Array.from({ length: uploading }, (_, i) => (
          <li key={`uploading-${i}`} className="aspect-square" aria-busy="true" aria-label={`Đang tải ảnh lên (${label})`}>
            <Skeleton className="size-full rounded-btn-sm" />
          </li>
        ))}

        {canEdit && (
          <li className="aspect-square">
            <label
              htmlFor={inputId}
              className={cn(
                'flex size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-btn-sm border border-dashed border-line-2 bg-surface text-ink-2',
                'focus-within:shadow-focus hover:bg-paper',
                addDisabled && 'pointer-events-none opacity-[0.38]',
              )}
            >
              <Plus className="size-5" aria-hidden />
              <span className="text-cap">{full ? 'Đủ 6 ảnh' : 'Thêm ảnh'}</span>
              <input
                id={inputId}
                type="file"
                accept={IMAGE_ACCEPT}
                multiple
                disabled={addDisabled}
                className="sr-only"
                aria-label={`Thêm ảnh ${label}`}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = '';
                  if (files.length) onPick(category, files);
                }}
              />
            </label>
          </li>
        )}
      </ul>
    </div>
  );
}
