import { type AvatarTone, avatarToneFor } from '@/components/ui/tones.ts';

/**
 * Màu thành viên trên vòng (Design.md 2.1, cột "Màu đậm (biểu đồ, vòng quay)"). Canvas cần giá trị màu thật
 * nên lặp lại token ở đây: nền nhạt / màu đậm / chữ.
 */
const PALETTE: Record<AvatarTone, { light: string; vivid: string; text: string }> = {
  lil: { light: '#ece6fd', vivid: '#8f78ea', text: '#5b45c2' },
  mint: { light: '#d9f0e5', vivid: '#2e9a72', text: '#1a6b4f' },
  yellow: { light: '#fbefb0', vivid: '#d9b21a', text: '#6b5300' },
  sky: { light: '#ddeef8', vivid: '#3f8fc4', text: '#1d5f8a' },
};

export const INK = '#1c2333';
export const HL = '#f5d547';

/** Lát chẵn dùng nền nhạt + chữ màu thành viên, lát lẻ dùng màu đậm + chữ ink (xen kẽ như ảnh 17). */
export function sliceColors(userId: string, index: number): { fill: string; text: string } {
  const p = PALETTE[avatarToneFor(userId)];
  return index % 2 === 0 ? { fill: p.light, text: p.text } : { fill: p.vivid, text: INK };
}
