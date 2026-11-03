import { PHOTO_CATEGORIES } from '../photos.ts';
import type { PhotoCategory, PublicPhoto } from '../types.ts';

export type GalleryPhotos = Record<PhotoCategory, PublicPhoto[]>;

export interface GalleryItem {
  id: string;
  url: string;
  category: PhotoCategory;
  /** "Phòng ngủ 1": đánh số trong nhóm, dùng làm `alt` và nhãn nút. */
  label: string;
}

/** Nhãn ngắn trên thẻ nhóm, đủ 3 thẻ trong 360px (ảnh 21). */
const TAB_LABELS: Record<PhotoCategory, string> = {
  BEDROOM: 'Phòng ngủ',
  BATHROOM: 'Vệ sinh',
  LIVING: 'Sinh hoạt',
};

/** Dãy phẳng theo thứ tự Phòng ngủ → Vệ sinh → Sinh hoạt; trong nhóm giữ nguyên thứ tự server trả về. */
export function flattenGallery(photos: GalleryPhotos): GalleryItem[] {
  return PHOTO_CATEGORIES.flatMap(({ key, label }) =>
    photos[key].map((photo, i) => ({ id: photo.id, url: photo.url, category: key, label: `${label} ${i + 1}` })),
  );
}

/** Thẻ nhóm kèm số ảnh ("Phòng ngủ 3"); nhóm không có ảnh thì ẩn. */
export function galleryTabs(photos: GalleryPhotos): { key: PhotoCategory; label: string; count: number }[] {
  return PHOTO_CATEGORIES.filter(({ key }) => photos[key].length > 0).map(({ key }) => ({
    key,
    label: `${TAB_LABELS[key]} ${photos[key].length}`,
    count: photos[key].length,
  }));
}

/** Chip chỉ số trên ảnh lớn: vị trí 0 → "1 / 7". */
export function indexLabel(index: number, total: number): string {
  return `${index + 1} / ${total}`;
}

/** Ảnh kế (delta = 1) hoặc trước (delta = -1), vòng quanh hai đầu. */
export function stepIndex(index: number, total: number, delta: number): number {
  if (total <= 0) return 0;
  return (((index + delta) % total) + total) % total;
}

/** Vị trí ảnh đầu tiên của nhóm trong dãy phẳng; -1 nếu nhóm không có ảnh. */
export function firstIndexOf(items: readonly GalleryItem[], category: PhotoCategory): number {
  return items.findIndex((item) => item.category === category);
}
