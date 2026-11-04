import { MAX_PHOTOS_PER_CATEGORY, type ListingPhoto, type PhotoCategory } from './types.ts';

/** Ba nhóm ảnh theo thứ tự hiển thị (L5). */
export const PHOTO_CATEGORIES: { key: PhotoCategory; label: string }[] = [
  { key: 'BEDROOM', label: 'Phòng ngủ' },
  { key: 'BATHROOM', label: 'Phòng vệ sinh' },
  { key: 'LIVING', label: 'Gian sinh hoạt' },
];

export const MAX_PHOTOS_PER_GROUP = MAX_PHOTOS_PER_CATEGORY;

/** Gom ảnh theo nhóm, mỗi nhóm sắp theo sortOrder (0 đứng đầu). Luôn đủ 3 khóa. */
export function groupPhotos(photos: readonly ListingPhoto[]): Record<PhotoCategory, ListingPhoto[]> {
  const grouped: Record<PhotoCategory, ListingPhoto[]> = { BEDROOM: [], BATHROOM: [], LIVING: [] };
  for (const p of [...photos].sort((a, b) => a.sortOrder - b.sortOrder)) grouped[p.category].push(p);
  return grouped;
}

/** Nhóm chưa có ảnh nào, theo thứ tự hiển thị. */
export function missingGroups(photos: readonly ListingPhoto[]): PhotoCategory[] {
  const grouped = groupPhotos(photos);
  return PHOTO_CATEGORIES.filter(({ key }) => grouped[key].length === 0).map(({ key }) => key);
}

/** Ảnh bìa = ảnh Phòng ngủ đứng đầu nhóm; null khi nhóm Phòng ngủ rỗng. */
export function coverPhoto(photos: readonly ListingPhoto[]): ListingPhoto | null {
  return groupPhotos(photos).BEDROOM[0] ?? null;
}
