import { api } from '@/lib/api.ts';
import type {
  AdminListingResponse,
  Listing,
  ListingInput,
  ListingPhoto,
  ListingStatus,
  PhotoCategory,
  PublicListing,
} from './types.ts';

const h = (houseId: string) => `/houses/${houseId}/listing`;

export const listingApi = {
  get: (houseId: string) => api<AdminListingResponse>(h(houseId)),
  save: (houseId: string, body: ListingInput) => api<Listing>(h(houseId), { method: 'PUT', body }),
  setStatus: (houseId: string, status: ListingStatus) =>
    api<Listing>(`${h(houseId)}/status`, { method: 'PATCH', body: { status } }),
  uploadPhoto: (houseId: string, category: PhotoCategory, photo: Blob, filename: string) => {
    const body = new FormData();
    body.append('category', category);
    body.append('photo', photo, filename);
    return api<ListingPhoto>(`${h(houseId)}/photos`, { method: 'POST', body });
  },
  deletePhoto: (houseId: string, photoId: string) =>
    api<{ ok: true }>(`${h(houseId)}/photos/${photoId}`, { method: 'DELETE' }),
  setCover: (houseId: string, photoId: string) =>
    api<ListingPhoto>(`${h(houseId)}/photos/${photoId}/cover`, { method: 'PATCH' }),
  /** Trang công khai: không gắn token, không tự refresh. */
  getPublic: (slug: string) => api<PublicListing>(`/public/listings/${encodeURIComponent(slug)}`, { auth: false }),
};
