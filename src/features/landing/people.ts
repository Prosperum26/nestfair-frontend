import type { AvatarTone } from '@/components/ui/tones.ts';
import type { PersonKey } from './debt-demo.ts';

/** Màu cố định của 4 người trong Nhà 12A trên mọi minh họa của landing. */
export const PERSON_TONE: Record<PersonKey, AvatarTone> = { H: 'lil', T: 'mint', M: 'yellow', Q: 'sky' };

/** Lớp SVG cho nút người trên sơ đồ nợ (nền, viền, chữ). */
export const PERSON_SVG: Record<AvatarTone, { circle: string; text: string }> = {
  lil: { circle: 'fill-lil-bg stroke-lil-v', text: 'fill-lil' },
  mint: { circle: 'fill-mint-bg stroke-mint-v', text: 'fill-mint' },
  yellow: { circle: 'fill-hl-soft stroke-mai-v', text: 'fill-hl-ink' },
  sky: { circle: 'fill-sky-bg stroke-sky-v', text: 'fill-sky' },
};

/** Màu thanh chia tiền và chấm người trên minh họa. */
export const PERSON_BAR: Record<PersonKey, string> = { H: 'bg-lil-v', T: 'bg-mint-v', M: 'bg-mai-v', Q: 'bg-sky-v' };
