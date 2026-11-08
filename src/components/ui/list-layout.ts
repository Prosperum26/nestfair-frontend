/** Danh sách dài thì bỏ layout animation để cuộn không giật (spec UX mục 9). */
export const LAYOUT_LIMIT = 50;
export const shouldUseLayout = (count: number): boolean => count <= LAYOUT_LIMIT;
