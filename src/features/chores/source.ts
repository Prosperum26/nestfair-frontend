import type { AssignmentSource } from './types.ts';

const LABELS: Record<AssignmentSource, string | null> = {
  ROTATION: null,
  SWAP: 'Đổi ca',
  COVER: 'Trực dùm',
  PAYBACK: 'Làm bù',
  WHEEL: 'Quay may mắn',
  REASSIGN: 'Giao lại',
};

/** Nhãn nguồn của ca; lịch xoay vòng bình thường không cần nhãn. */
export function sourceLabel(source: AssignmentSource): string | null {
  return LABELS[source];
}
