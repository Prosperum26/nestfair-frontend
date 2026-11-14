/**
 * Trình tự minh họa "Rút gọn nợ" trên landing: `idle` (chưa cuộn tới) → `before` (vẽ 6 khoản nợ chéo)
 * → `after` (gom còn 2 giao dịch). `run` tăng mỗi lần Xem lại để sơ đồ vẽ lại từ trống.
 */
export type DebtPhase = 'idle' | 'before' | 'after';
export interface DebtPlayback {
  phase: DebtPhase;
  run: number;
}
export type DebtPlaybackEvent = 'enter' | 'drawn' | 'replay';

/** Chờ 6 đường nợ vẽ xong (lần lượt 0,08 giây, mỗi đường 0,32 giây) rồi mới gom. */
export const AFTER_DELAY_MS = 1100;

export const initialPlayback = (reduceMotion: boolean | null): DebtPlayback => ({ phase: reduceMotion ? 'after' : 'idle', run: 0 });

export function debtPlayback(s: DebtPlayback, event: DebtPlaybackEvent): DebtPlayback {
  if (event === 'enter' && s.phase === 'idle') return { ...s, phase: 'before' };
  if (event === 'drawn' && s.phase === 'before') return { ...s, phase: 'after' };
  if (event === 'replay' && s.phase === 'after') return { phase: 'before', run: s.run + 1 };
  return s;
}
