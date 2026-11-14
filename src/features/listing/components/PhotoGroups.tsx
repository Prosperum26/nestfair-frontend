import { Bath, Bed, Sofa } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { prepareImage } from '@/features/expenses/image-upload.ts';
import { messageForListingError } from '../errors.ts';
import { useDeleteListingPhoto, useSetListingCover, useUploadListingPhoto } from '../hooks.ts';
import { coverPhoto, groupPhotos, MAX_PHOTOS_PER_GROUP, PHOTO_CATEGORIES } from '../photos.ts';
import type { ListingPhoto, PhotoCategory } from '../types.ts';
import { PhotoGroup } from './PhotoGroup.tsx';

const ICONS: Record<PhotoCategory, ReactNode> = {
  BEDROOM: <Bed aria-hidden />,
  BATHROOM: <Bath aria-hidden />,
  LIVING: <Sofa aria-hidden />,
};

const NO_UPLOADS: Record<PhotoCategory, number> = { BEDROOM: 0, BATHROOM: 0, LIVING: 0 };

/**
 * Thẻ "Ảnh theo nhóm" (ảnh 20): Phòng ngủ, Phòng vệ sinh, Gian sinh hoạt, mỗi nhóm tối đa 6 ảnh.
 * Chọn ảnh: kiểm tra định dạng, nén, gửi lần lượt (server đánh số thứ tự). Ảnh bìa là ảnh Phòng ngủ đầu tiên.
 */
export function PhotoGroups({ houseId, photos, canEdit }: { houseId: string; photos: ListingPhoto[]; canEdit: boolean }) {
  const upload = useUploadListingPhoto(houseId);
  const remove = useDeleteListingPhoto(houseId);
  const setCover = useSetListingCover(houseId);
  const [uploading, setUploading] = useState(NO_UPLOADS);
  const [error, setError] = useState<string | null>(null);

  const grouped = groupPhotos(photos);
  const cover = coverPhoto(photos);
  const deletingId = remove.isPending ? (remove.variables ?? null) : setCover.isPending ? (setCover.variables ?? null) : null;

  const bump = (category: PhotoCategory, delta: number) =>
    setUploading((u) => ({ ...u, [category]: Math.max(0, u[category] + delta) }));

  const pick = async (category: PhotoCategory, files: File[]) => {
    setError(null);
    const room = MAX_PHOTOS_PER_GROUP - grouped[category].length;
    const accepted = files.slice(0, Math.max(0, room));
    if (files.length > accepted.length) {
      toast(`Mỗi nhóm tối đa ${MAX_PHOTOS_PER_GROUP} ảnh, mình chỉ nhận ${accepted.length} ảnh đầu.`);
    }
    bump(category, accepted.length);
    for (const file of accepted) {
      try {
        const ready = await prepareImage(file);
        await upload.mutateAsync({ category, photo: ready, filename: ready.name });
      } catch (e) {
        setError(messageForListingError(e));
      } finally {
        bump(category, -1);
      }
    }
  };

  const onDelete = (photo: ListingPhoto) => {
    setError(null);
    remove.mutate(photo.id, { onError: (e) => setError(messageForListingError(e)) });
  };

  const onCover = (photo: ListingPhoto) => {
    setError(null);
    setCover.mutate(photo.id, {
      onSuccess: () => toast('Đã đặt làm ảnh bìa.'),
      onError: (e) => setError(messageForListingError(e)),
    });
  };

  return (
    <section aria-labelledby="listing-photos-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <p className="font-mono text-over uppercase text-ink-2">Mỗi nhóm cần ít nhất 1 ảnh</p>
      <h2 id="listing-photos-title" className="font-display text-ct text-ink">
        Ảnh theo nhóm
      </h2>
      {!canEdit && photos.length === 0 && <p className="mt-2 text-sm text-ink-2">Trưởng phòng chưa thêm ảnh nào.</p>}
      <div className="mt-5 flex flex-col gap-6">
        {PHOTO_CATEGORIES.map(({ key, label }) => (
          <PhotoGroup
            key={key}
            category={key}
            label={label}
            icon={ICONS[key]}
            photos={grouped[key]}
            uploading={uploading[key]}
            canEdit={canEdit}
            isBedroom={key === 'BEDROOM'}
            deletingId={deletingId}
            coverId={cover?.id ?? null}
            onPick={pick}
            onDelete={onDelete}
            onCover={onCover}
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {error}
        </p>
      )}
    </section>
  );
}
