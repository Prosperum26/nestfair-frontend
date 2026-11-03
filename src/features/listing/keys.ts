/** Tiền tố theo nhà / theo slug: invalidate tiền tố là tải lại tin đang cache. */
export const listingKeys = {
  detail: (houseId: string) => ['listing', houseId] as const,
  public: (slug: string) => ['listing', 'public', slug] as const,
};
