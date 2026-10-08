export type Tone = 'neutral' | 'yellow' | 'mint' | 'tom' | 'lil' | 'sky' | 'ink' | 'hl';

/** Cặp nền/chữ theo bảng tone Design.md 2.1 (dùng cho IconTile, Chip). */
export const TONES: Record<Tone, string> = {
  neutral: 'bg-paper-2 text-ink-2',
  yellow: 'bg-hl-soft text-hl-ink',
  mint: 'bg-mint-bg text-mint',
  tom: 'bg-tom-bg text-tom',
  lil: 'bg-lil-bg text-lil',
  sky: 'bg-sky-bg text-sky',
  ink: 'bg-ink text-white',
  hl: 'bg-hl text-ink',
};

export type AvatarTone = 'lil' | 'mint' | 'yellow' | 'sky';

const AVATAR_ORDER: AvatarTone[] = ['lil', 'mint', 'yellow', 'sky'];

/** Màu avatar cố định theo id (cùng người luôn cùng màu ở mọi màn). */
export function avatarToneFor(seed: string): AvatarTone {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_ORDER[hash % AVATAR_ORDER.length];
}
