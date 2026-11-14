/** Khớp payload backend module listing (Issue #11). Tiền là số nguyên VNĐ; client tự khai báo, không import từ backend. */

export type ListingStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type ListingCloseReason = 'FULL' | 'MANUAL';
export type GenderWanted = 'MALE' | 'FEMALE' | 'ANY';
export type PhotoCategory = 'BEDROOM' | 'BATHROOM' | 'LIVING';

/** Tối đa ảnh mỗi nhóm (L5), khớp backend. */
export const MAX_PHOTOS_PER_CATEGORY = 6;

export interface OtherFee {
  name: string;
  amount: number;
}

export interface ListingPhoto {
  id: string;
  category: PhotoCategory;
  url: string;
  sortOrder: number;
}

export interface UtilitiesSummary {
  avgMonthlyTotal: number;
  perPerson: number;
  monthsUsed: number;
}

export interface ListingSummary {
  memberCount: number;
  maxMembers: number;
  slotsOpen: number;
  /** null = nhà chưa có dữ liệu điện nước (L3). */
  utilities: UtilitiesSummary | null;
}

/** Mảng thiếu ảnh trả kèm lỗi LISTING_INCOMPLETE và trong `missing` của GET. */
export type MissingItem = 'PHOTO_BEDROOM' | 'PHOTO_BATHROOM' | 'PHOTO_LIVING';

export interface Listing {
  id: string;
  slug: string;
  status: ListingStatus;
  closeReason: ListingCloseReason | null;
  locationText: string;
  /** Link Google Maps của khu vực, null khi chưa có. */
  mapUrl: string | null;
  genderWanted: GenderWanted;
  rentPerMonth: number;
  otherFees: OtherFee[];
  description: string;
  roommateExpectations: string;
  contactPhone: string;
  showChoreSchedule: boolean;
  photos: ListingPhoto[];
  publishedAt: string | null;
  closedAt: string | null;
  updatedAt: string;
}

export interface ListingSuggestions {
  locationText: string | null;
  contactPhone: string | null;
}

/** GET /houses/:houseId/listing */
export interface AdminListingResponse {
  listing: Listing | null;
  publicUrl: string | null;
  summary: ListingSummary;
  estimatedPerPerson: number | null;
  missing: MissingItem[];
  suggestions: ListingSuggestions;
}

/** Nội dung gửi PUT /houses/:houseId/listing (không có status, slug). */
export interface ListingInput {
  locationText: string;
  /** null xóa link. */
  mapUrl: string | null;
  genderWanted: GenderWanted;
  rentPerMonth: number;
  otherFees: OtherFee[];
  description: string;
  roommateExpectations: string;
  contactPhone: string;
  showChoreSchedule: boolean;
}

export interface PublicPhoto {
  id: string;
  url: string;
}

/** `cells` có 7 phần tử (T2…CN), mỗi ô là mảng nhãn ẩn danh (TV1…). */
export interface PublicRosterRow {
  title: string;
  cells: string[][];
}

export interface PublicRoster {
  weekKey: string;
  rows: PublicRosterRow[];
}

/** GET /public/listings/:slug, tin đang mở. Không có liên hệ nào ngoài `contact.phone`. */
export interface PublicListingOpen {
  slug: string;
  status: 'OPEN';
  closeReason: null;
  publishedAt: string | null;
  locationText: string;
  /** Link Google Maps (vị trí GPS đã làm tròn ~100m), null khi chủ tin không thêm. */
  mapUrl: string | null;
  genderWanted: GenderWanted;
  rentPerMonth: number;
  otherFees: OtherFee[];
  summary: ListingSummary;
  estimatedPerPerson: number;
  description: string;
  roommateExpectations: string;
  photos: Record<PhotoCategory, PublicPhoto[]>;
  roster: PublicRoster | null;
  contact: { phone: string };
}

/** Tin đã đóng hoặc nhà đã đủ người: rút gọn, không có liên hệ (L7). */
export interface PublicListingClosed {
  slug: string;
  status: 'CLOSED';
  closeReason: ListingCloseReason;
  locationText: string;
  coverUrl: string | null;
}

export type PublicListing = PublicListingOpen | PublicListingClosed;
