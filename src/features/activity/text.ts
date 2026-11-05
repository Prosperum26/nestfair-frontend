import {
  Activity as ActivityIcon,
  ArrowLeftRight,
  Ban,
  Camera,
  CalendarOff,
  CircleCheck,
  CirclePause,
  Crown,
  Dice5,
  Landmark,
  type LucideIcon,
  Receipt,
  Repeat,
  RotateCcw,
  TriangleAlert,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { firstName } from '@/lib/date.ts';
import { houseClock } from '@/lib/house-time.ts';
import { formatVnd } from '@/lib/format.ts';
import type { Activity } from './types.ts';

/** Tên dài hơn thế này thì cắt "…" (câu đầy đủ vẫn có trong `title`). */
export const NAME_MAX = 24;

export interface ActivityLine {
  icon: LucideIcon;
  text: string;
}

const clip = (s: string) => (s.length > NAME_MAX ? `${s.slice(0, NAME_MAX - 1)}…` : s);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown): number => (typeof v === 'number' ? v : 0);
/** "2026-10-23" → "23.10". */
const dm = (ds: unknown) => {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(str(ds));
  return m ? `${m[2]}.${m[1]}` : '';
};
const range = (a: unknown, b: unknown) => (str(a) === str(b) ? dm(a) : `${dm(a)}–${dm(b)}`);
/** "2026-W44" → "W44". */
const week = (key: unknown) => str(key).split('-').at(-1) ?? '';
const quote = (s: unknown) => `“${str(s)}”`;

/**
 * Ghép câu cho một hoạt động (đặc tả #5 mục 10.3). Người xem là người gây ra / người được nhắc tới thì
 * thay tên bằng "Bạn" / "bạn". Không bao giờ có lý do riêng hay số tiền quà.
 */
export function activityLine(a: Activity, meUserId?: string | null): ActivityLine {
  const p = a.params;
  const isMe = (id: unknown) => !!meUserId && id === meUserId;
  const actor = isMe(a.actorUserId) ? 'Bạn' : clip(firstName(a.actorName));
  const person = (id: unknown, name: unknown) => (isMe(id) ? 'bạn' : clip(firstName(str(name)) || 'ai đó'));
  const target = person(p.targetUserId, p.targetName);
  const chore = quote(p.choreTitle);

  switch (a.type) {
    case 'chore.submitted':
      return { icon: Camera, text: `${actor} vừa nộp ảnh ${chore}` };
    case 'chore.verified':
      return { icon: CircleCheck, text: `${actor} đã duyệt ca ${chore} của ${target}` };
    case 'chore.rejected':
      return { icon: RotateCcw, text: `${actor} yêu cầu ${target} làm lại ca ${chore}` };
    case 'chore.missed':
      return { icon: TriangleAlert, text: num(p.count) > 1 ? `${actor} bỏ ${num(p.count)} ca` : `${actor} bỏ ca ${chore}` };
    case 'chore.auto_approved':
      return { icon: CircleCheck, text: `${num(p.count)} ca được tự duyệt sau ${num(p.afterHours) || 48} giờ` };
    case 'chore.missed_streak':
      return { icon: TriangleAlert, text: `${target === 'bạn' ? 'Bạn' : target} bỏ ${num(p.streak)} ca liên tiếp` };
    case 'chore.paused':
      return {
        icon: CirclePause,
        text: `${actor} tạm ngưng việc ${chore}${num(p.cancelled) > 0 ? ` (${num(p.cancelled)} ca bị hủy)` : ''}`,
      };
    case 'schedule.generated':
      return { icon: Repeat, text: a.actorUserId ? `${actor} đã tạo lịch tuần ${week(p.weekKey)}` : `Lịch tuần ${week(p.weekKey)} đã được tạo` };
    case 'schedule.rerolled':
      return { icon: Repeat, text: `${actor} đã xáo lại lịch tuần ${week(p.weekKey)}` };
    case 'override.force_done':
      return { icon: Crown, text: `${actor} xác nhận ca ${chore} của ${target} (trưởng phòng quyết)` };
    case 'override.force_reject':
      return { icon: Crown, text: `${actor} yêu cầu ${target} làm lại ca ${chore} (trưởng phòng quyết)` };
    case 'override.reassign':
      return { icon: Crown, text: `${actor} giao ca ${chore} cho ${clip(firstName(str(p.toName)) || 'người khác')}` };
    case 'override.cancel':
      return { icon: Crown, text: `${actor} hủy ca ${chore} của ${target}` };
    case 'absence.created':
      return {
        icon: CalendarOff,
        text:
          p.targetUserId === a.actorUserId
            ? `${actor} khai vắng ${range(p.startDate, p.endDate)}`
            : `${actor} khai vắng cho ${target} ${range(p.startDate, p.endDate)}`,
      };
    case 'break.created':
      return {
        icon: CalendarOff,
        text: `${actor} khai nghỉ cả nhà ${range(p.startDate, p.endDate)}${num(p.cancelled) > 0 ? ` (${num(p.cancelled)} ca bị hủy)` : ''}`,
      };
    case 'wheel.result': {
      const names = Array.isArray(p.participantNames) ? (p.participantNames as string[]) : [];
      const ids = Array.isArray(p.participantIds) ? (p.participantIds as string[]) : [];
      const list = names.map((n, i) => (isMe(ids[i]) ? 'bạn' : clip(firstName(n)))).join(', ');
      const winner = isMe(p.winnerUserId) ? 'Bạn' : clip(firstName(str(p.winnerName)));
      const out = a.actorUserId && !ids.includes(a.actorUserId) ? ` (${actor} không tham gia)` : '';
      return { icon: Dice5, text: `${actor} quay ${quote(p.taskTitle)} với ${list}${out} · ${winner} trúng` };
    }
    case 'wheel.voided':
      return { icon: Ban, text: `${actor} hủy vòng quay ${quote(p.taskTitle)}` };
    case 'member.joined':
      return { icon: UserPlus, text: `${actor} vừa vào nhà` };
    case 'member.left':
      // Trưởng phòng xóa người khác thì actor là trưởng phòng, người bị xóa nằm trong params.
      return p.kicked
        ? { icon: UserMinus, text: `${actor} đã xóa ${person(p.userId, p.name)} khỏi nhà` }
        : { icon: UserMinus, text: `${actor} đã rời nhà` };
    case 'swap.accepted':
      return { icon: ArrowLeftRight, text: `${actor} nhận trực dùm ca ${chore} của ${target}${p.withGift ? ' kèm quà' : ''}` };
    case 'expense.created':
      return { icon: Receipt, text: `${actor} vừa thêm khoản ${quote(p.title)} ${formatVnd(num(p.amount))}` };
    case 'debt.settled':
      return { icon: Landmark, text: `${actor} đã trả ${target} ${formatVnd(num(p.amount))}` };
    default:
      return { icon: ActivityIcon, text: `${actor} có hoạt động mới` };
  }
}

/** Giờ của mục ticker theo giờ nhà: `HH:mm` trong ngày; khác ngày thì `dd.mm HH:mm`. */
export function activityTime(iso: string, now: Date = new Date()): string {
  const at = houseClock(iso);
  return at.dayKey === houseClock(now).dayKey ? at.hm : `${at.ddmm} ${at.hm}`;
}
