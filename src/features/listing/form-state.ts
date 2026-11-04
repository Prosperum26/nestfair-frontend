import type { ListingFormValues } from './schemas.ts';
import type { Listing, ListingInput, ListingStatus, ListingSuggestions } from './types.ts';

/**
 * Giá trị ban đầu của form. Chưa có tin: điền sẵn vị trí (địa chỉ nhà) và SĐT (hồ sơ trưởng phòng) từ gợi ý,
 * tiền thuê để trống cho trưởng phòng tự nhập.
 */
export function buildFormDefaults(listing: Listing | null, suggestions: ListingSuggestions): ListingFormValues {
  if (!listing) {
    return {
      locationText: suggestions.locationText ?? '',
      genderWanted: 'ANY',
      rentPerMonth: null,
      otherFees: [],
      description: '',
      roommateExpectations: '',
      contactPhone: suggestions.contactPhone ?? '',
      showChoreSchedule: true,
    };
  }
  return {
    locationText: listing.locationText,
    genderWanted: listing.genderWanted,
    rentPerMonth: listing.rentPerMonth,
    otherFees: listing.otherFees.map((f) => ({ name: f.name, amount: f.amount })),
    description: listing.description,
    roommateExpectations: listing.roommateExpectations,
    contactPhone: listing.contactPhone,
    showChoreSchedule: listing.showChoreSchedule,
  };
}

export type PrimaryAction = 'SAVE_DRAFT' | 'PUBLISH' | 'UPDATE' | 'REOPEN';

/** Nút chính của form theo trạng thái tin. Mọi hành động đều lưu nội dung đang sửa trước khi đổi trạng thái. */
export function primaryAction(status: ListingStatus | null): PrimaryAction {
  if (status === null) return 'SAVE_DRAFT';
  return { DRAFT: 'PUBLISH', OPEN: 'UPDATE', CLOSED: 'REOPEN' }[status] as PrimaryAction;
}

/** Nội dung gửi PUT sau khi form đã qua schema (không có status, slug). */
export function toListingInput(values: {
  locationText: string;
  genderWanted: ListingInput['genderWanted'];
  rentPerMonth: number;
  otherFees: { name: string; amount: number }[];
  description: string;
  roommateExpectations: string;
  contactPhone: string;
  showChoreSchedule: boolean;
}): ListingInput {
  return {
    locationText: values.locationText.trim(),
    genderWanted: values.genderWanted,
    rentPerMonth: values.rentPerMonth,
    otherFees: values.otherFees.map((f) => ({ name: f.name.trim(), amount: f.amount })),
    description: values.description,
    roommateExpectations: values.roommateExpectations,
    contactPhone: values.contactPhone.replace(/\s+/g, ''),
    showChoreSchedule: values.showChoreSchedule,
  };
}
