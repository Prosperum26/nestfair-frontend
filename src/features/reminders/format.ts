import type { ReminderDto, ReminderSource } from './types.ts';

/** Mọi định dạng giờ / ngày trong module này theo giờ Việt Nam (UTC+7, không có DST). */
const VN_TZ = 'Asia/Ho_Chi_Minh';
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const MS_PER_DAY = 86_400_000;

/** Thứ ngắn kiểu Design.md: chỉ số 0 (Chủ nhật) … 6 (Thứ bảy). */
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

const pad = (n: number) => n.toString().padStart(2, '0');

interface VnParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * Lấy (năm, tháng, ngày, giờ, phút) theo lịch Việt Nam từ một thời điểm, bất kể múi giờ máy:
 * dùng Intl với timeZone cố định nên không phụ thuộc múi giờ hệ thống (không dùng getHours/getDate).
 */
function vnParts(date: Date): VnParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '0';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

/** Số thứ tự ngày lịch VN (chênh nhau đúng 1 giữa hai ngày liên tiếp), dùng để so "Hôm nay / Ngày mai". */
function vnDayNumber(date: Date): number {
  const p = vnParts(date);
  return Date.UTC(p.year, p.month - 1, p.day) / MS_PER_DAY;
}

/** "HH:mm" 24h theo giờ VN từ chuỗi ISO (offset bất kỳ). */
export function vnTime(iso: string): string {
  const p = vnParts(new Date(iso));
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export interface ReminderWhen {
  /** Giờ 24h "HH:mm" theo giờ VN. */
  time: string;
  /** "Hôm nay" / "Ngày mai" / cùng năm: "T5 08.10" / khác năm: "dd.mm.yyyy". */
  day: string;
}

/**
 * Tách thời điểm nhắc thành (giờ, ngày) để hiển thị. Ngày so theo lịch VN: giờ máy chạy múi giờ nào
 * cũng ra cùng kết quả, và 23:59 hay 00:00 đều thuộc đúng ngày VN của nó.
 */
export function reminderWhen(remindAt: string, now: Date): ReminderWhen {
  const at = vnParts(new Date(remindAt));
  const dayDiff = vnDayNumber(new Date(remindAt)) - vnDayNumber(now);
  let day: string;
  if (dayDiff === 0) day = 'Hôm nay';
  else if (dayDiff === 1) day = 'Ngày mai';
  else if (at.year === vnParts(now).year) {
    const weekday = new Date(Date.UTC(at.year, at.month - 1, at.day)).getUTCDay();
    day = `${WEEKDAY_SHORT[weekday]} ${pad(at.day)}.${pad(at.month)}`;
  } else day = `${pad(at.day)}.${pad(at.month)}.${at.year}`;
  return { time: `${pad(at.hour)}:${pad(at.minute)}`, day };
}

/**
 * n nhắc chưa gửi (`sentAt` null — đúng định nghĩa "upcoming" của backend) gần nhất,
 * sắp theo thời điểm tuyệt đối tăng dần (so timestamp, không so chuỗi vì offset có thể lẫn +07:00 và Z).
 * Không đổi mảng nhập vào.
 */
export function nextReminders(list: ReminderDto[], n: number): ReminderDto[] {
  return list
    .filter((r) => r.sentAt === null)
    .sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime())
    .slice(0, Math.max(0, n));
}

/** Nhãn nguồn nhắc cho chip: ASSISTANT "Từ trợ lý", USER "Của tôi", SYSTEM "Hệ thống". */
export function sourceLabel(source: ReminderSource): string {
  switch (source) {
    case 'ASSISTANT':
      return 'Từ trợ lý';
    case 'USER':
      return 'Của tôi';
    case 'SYSTEM':
      return 'Hệ thống';
  }
}

export interface LocalInputIso {
  /** ISO 8601 kèm offset +07:00, null khi đầu vào không dùng được. */
  iso: string | null;
  /** 'invalid': sai dạng / ngày giờ không có thật; 'past': không ở tương lai; null: hợp lệ. */
  error: 'invalid' | 'past' | null;
}

const LOCAL_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Giá trị input `datetime-local` (vd. "2026-10-26T08:05") người dùng gõ là giờ lịch VN
 * → ISO kèm +07:00, không phụ thuộc múi giờ máy. Dùng cho form tạo / sửa nhắc:
 * 'invalid' khi sai dạng hoặc ngày giờ không có thật (30.02, 24:05), 'past' khi thời điểm
 * không ở tương lai so với `now` (nhắc chỉ được đặt trước, đúng lỗi REMIND_AT_INVALID của backend).
 */
export function isoFromLocalInput(value: string, now: Date = new Date()): LocalInputIso {
  const m = LOCAL_INPUT_RE.exec(value.trim());
  if (!m) return { iso: null, error: 'invalid' };
  const [y, mo, d, h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? '0')];
  // Round-trip qua Date.UTC để bắt ngày giờ không có thật (Date.UTC tự "tràn" sang tháng / ngày kế tiếp).
  const check = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== mo - 1 ||
    check.getUTCDate() !== d ||
    check.getUTCHours() !== h ||
    check.getUTCMinutes() !== mi ||
    check.getUTCSeconds() !== s
  ) {
    return { iso: null, error: 'invalid' };
  }
  // Giờ tường VN → thời điểm tuyệt đối: lùi offset 7h.
  const instant = Date.UTC(y, mo - 1, d, h, mi, s) - VN_OFFSET_MS;
  if (instant <= now.getTime()) return { iso: null, error: 'past' };
  return { iso: `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] ?? '00'}+07:00`, error: null };
}
