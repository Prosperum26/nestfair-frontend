import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api.ts';
import { listingApi } from './api.ts';
import { listingKeys } from './keys.ts';
import type { ListingInput, ListingStatus, PhotoCategory } from './types.ts';

/** Chu kỳ làm tươi trang công khai khi tin đang mở (không có realtime cho khách). */
export const PUBLIC_REFETCH_MS = 30_000;

export function useListing(houseId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.detail(houseId ?? ''),
    queryFn: () => listingApi.get(houseId!),
    enabled: !!houseId,
  });
}

/** Mọi thay đổi tin / ảnh / trạng thái đều tải lại payload GET (summary, missing, publicUrl). */
function useInvalidateListing(houseId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: listingKeys.detail(houseId) });
}

export function useSaveListing(houseId: string) {
  const invalidate = useInvalidateListing(houseId);
  return useMutation({ mutationFn: (body: ListingInput) => listingApi.save(houseId, body), onSuccess: invalidate });
}

export function useSetListingStatus(houseId: string) {
  const invalidate = useInvalidateListing(houseId);
  return useMutation({
    mutationFn: (status: ListingStatus) => listingApi.setStatus(houseId, status),
    onSettled: invalidate,
  });
}

export function useUploadListingPhoto(houseId: string) {
  const invalidate = useInvalidateListing(houseId);
  return useMutation({
    mutationFn: ({ category, photo, filename }: { category: PhotoCategory; photo: Blob; filename: string }) =>
      listingApi.uploadPhoto(houseId, category, photo, filename),
    onSuccess: invalidate,
  });
}

export function useDeleteListingPhoto(houseId: string) {
  const invalidate = useInvalidateListing(houseId);
  return useMutation({ mutationFn: (photoId: string) => listingApi.deletePhoto(houseId, photoId), onSettled: invalidate });
}

export function useSetListingCover(houseId: string) {
  const invalidate = useInvalidateListing(houseId);
  return useMutation({ mutationFn: (photoId: string) => listingApi.setCover(houseId, photoId), onSuccess: invalidate });
}

/** Không thử lại khi 404 (slug sai / tin tạm ẩn là kết quả đúng, không phải lỗi mạng). */
export function retryPublicListing(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.statusCode === 404) return false;
  return failureCount < 2;
}

export function usePublicListing(slug: string | undefined) {
  return useQuery({
    queryKey: listingKeys.public(slug ?? ''),
    queryFn: () => listingApi.getPublic(slug!),
    enabled: !!slug,
    retry: retryPublicListing,
    refetchOnWindowFocus: true,
    // Chỉ làm tươi định kỳ khi tin đang mở; tin đã đóng thì không đổi nữa.
    refetchInterval: (query) => (query.state.data?.status === 'OPEN' ? PUBLIC_REFETCH_MS : false),
  });
}
