/** Từ dòng này trở đi hiện cùng lúc (hóa đơn dài không phải chờ). */
export const STAGGER_LIMIT = 12;
const STEP_SECONDS = 0.04;

/** Độ trễ (giây) cho dòng thứ `index` khi các dòng hiện lần lượt như máy in hóa đơn. */
export const staggerDelay = (index: number): number => Math.min(index, STAGGER_LIMIT) * STEP_SECONDS;
