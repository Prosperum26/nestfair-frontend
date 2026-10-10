import { CircleCheck, Clock, Image, RotateCcw, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/ui/tones.ts';
import type { AssignmentStatus } from './types.ts';

/** Thứ tự hiển thị khi cần liệt kê trạng thái. */
export const STATUS_ORDER: AssignmentStatus[] = ['TODO', 'REJECTED', 'PENDING_VERIFY', 'DONE', 'MISSED'];

const CHIPS: Record<AssignmentStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  TODO: { label: 'Chờ làm', tone: 'neutral', icon: Clock },
  PENDING_VERIFY: { label: 'Chờ duyệt', tone: 'yellow', icon: Image },
  DONE: { label: 'Hoàn thành', tone: 'mint', icon: CircleCheck },
  MISSED: { label: 'Quá hạn', tone: 'tom', icon: TriangleAlert },
  REJECTED: { label: 'Làm lại', tone: 'tom', icon: RotateCcw },
};

/** Enum DB → chip UI (AGENTS.md mục 9). */
export function statusChip(status: AssignmentStatus) {
  return CHIPS[status];
}
