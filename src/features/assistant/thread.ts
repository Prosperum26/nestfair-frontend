import type { ReminderWhen } from '@/features/reminders/format.ts';
import type { AssistantCategory, AssistantMessageDto } from './types.ts';

/**
 * Hàm thuần gom tin chat theo ngày (màn 19, vạch ngày "HÔM NAY · 06.10").
 * Mọi phép tính ngày/giờ theo lịch Việt Nam (UTC+7, không DST) — cùng cách với
 * reminders/format.ts nên 23:59 và 00:00 hôm sau luôn thuộc đúng ngày VN của nó,
 * bất kể máy chạy múi giờ nào.
 */
const VN_TZ = 'Asia/Ho_Chi_Minh';
const MS_PER_DAY = 86_400_000;

const pad = (n: number) => n.toString().padStart(2, '0');

interface VnParts {
  year: number;
  month: number;
  day: number;
}

function vnParts(date: Date): VnParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '0';
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')) };
}

/** Số thứ tự ngày lịch VN (chênh nhau đúng 1 giữa hai ngày liên tiếp), dùng để so với "hôm nay". */
function vnDayNumber(date: Date): number {
  const p = vnParts(date);
  return Date.UTC(p.year, p.month - 1, p.day) / MS_PER_DAY;
}

/**
 * Nhãn vạch ngày (ảnh 19) đã viết hoa cho font mono: hôm nay "HÔM NAY · dd.mm",
 * ngày khác "dd.mm.yyyy" (ngay cả khi cùng năm — giữ nhất quán với tin cũ hơn).
 */
export function dayDividerLabel(date: Date, now: Date): string {
  const p = vnParts(date);
  if (vnDayNumber(date) === vnDayNumber(now)) return `HÔM NAY · ${pad(p.day)}.${pad(p.month)}`;
  return `${pad(p.day)}.${pad(p.month)}.${p.year}`;
}

export interface ThreadDayGroup {
  /**
   * Nhãn vạch ngày đã viết hoa cho font mono `over`: hôm nay "HÔM NAY · dd.mm",
   * ngày khác "dd.mm.yyyy" (ngay cả khi cùng năm — giữ nhất quán với ngày cũ).
   */
  label: string;
  /** Tin của ngày đó, giữ nguyên thứ tự cũ → mới như đầu vào. */
  messages: AssistantMessageDto[];
}

/** Gom tin chat liên tiếp theo ngày lịch VN; input là tin cũ → mới (trang API trả về). Không đổi mảng nhập. */
export function groupMessagesByDay(messages: AssistantMessageDto[], now: Date): ThreadDayGroup[] {
  const groups: ThreadDayGroup[] = [];
  for (const message of messages) {
    const label = dayDividerLabel(new Date(message.createdAt), now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.messages.push(message);
    else groups.push({ label, messages: [message] });
  }
  return groups;
}

/**
 * Cụm xác nhận sau khi tạo nhắc từ nút hành động (ảnh 19: "Đã tạo nhắc nhở hôm nay 20:00"):
 * "Hôm nay" / "Ngày mai" viết thường; nhãn ngày khác giữ nguyên, thêm giờ sau dấu phẩy.
 */
export function reminderConfirmation(when: ReminderWhen): string {
  if (when.day === 'Hôm nay') return `hôm nay ${when.time}`;
  if (when.day === 'Ngày mai') return `ngày mai ${when.time}`;
  return `${when.day}, ${when.time}`;
}

/** Nhãn loại tin dưới tin trợ lý (ảnh 19): "19:02 · Sự cố trong phòng". */
export function categoryLabel(category: AssistantCategory | null): string {
  switch (category) {
    case 'INCIDENT':
      return 'Sự cố trong phòng';
    case 'TIP':
      return 'Mẹo';
    case 'EMOTIONAL':
      return 'Ứng xử';
    case 'REMINDER':
      return 'Nhắc nhở';
    case 'OTHER':
      return 'Khác';
    default:
      return 'Khác';
  }
}
