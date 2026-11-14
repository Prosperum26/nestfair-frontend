import type { PersonKey } from './debt-demo.ts';

/** Một hoạt động mẫu trên thẻ toast ở hero (minh họa Nhà 12A đang dùng app). */
export interface TickerEvent {
  who: PersonKey;
  title: string;
  note: string;
  amount?: number;
  tone: 'mint' | 'ink';
}

export const TICKER_EVENTS: TickerEvent[] = [
  { who: 'M', title: 'Mai đã duyệt “Rửa chén”', note: '+10 điểm chăm chỉ cho Hùng', tone: 'mint' },
  { who: 'T', title: 'Thiện đã thêm “Tiền điện”', note: 'Chia 4 người', amount: 840_000, tone: 'ink' },
  { who: 'Q', title: 'Quân đã xác nhận nhận tiền', note: 'Hùng → Quân', amount: 170_000, tone: 'ink' },
  { who: 'H', title: 'Hùng đã nhận ca “Đổ rác”', note: 'Chợ ca · quà cảm ơn', amount: 20_000, tone: 'ink' },
];

export const TICKER_INTERVAL_MS = 4000;

export interface TickerState {
  index: number;
  /** Số lần đã đổi sự kiện. */
  steps: number;
}

/**
 * Sự kiện kế tiếp, hoặc `null` khi đã đi hết một vòng và quay về sự kiện đầu. Chỉ chạy một vòng để nội dung
 * không tự đổi mãi (WCAG 2.2.2), và lúc dừng thẻ trở lại đúng như ảnh thiết kế.
 */
export function advanceTicker(state: TickerState, length: number): TickerState | null {
  if (state.steps >= length) return null;
  return { index: (state.index + 1) % length, steps: state.steps + 1 };
}

/** Chỉ đổi khi người xem thấy được thẻ, không trỏ chuột / focus vào nó và không bật giảm chuyển động. */
export function shouldRunTicker(s: { reduceMotion: boolean | null; inView: boolean; pageVisible: boolean; paused: boolean }): boolean {
  return !s.reduceMotion && s.inView && s.pageVisible && !s.paused;
}
