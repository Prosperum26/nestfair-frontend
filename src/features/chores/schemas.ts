import { z } from 'zod';

const DUE_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** "YYYY-MM-DD" có phải ngày có thật không (loại 2026-02-30). */
function isRealDate(d: string): boolean {
  if (!DATE_ONLY.test(d)) return false;
  const date = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === d;
}

const dateField = z.string().refine(isRealDate, 'Nhập ngày đúng dạng dd/mm/yyyy.');
const optionalText = z
  .string()
  .trim()
  .max(200, 'Lý do tối đa 200 ký tự.')
  .transform((v) => v || undefined);

// Khớp CreateChoreDto backend.
export const choreSchema = z
  .object({
    title: z.string().trim().min(1, 'Tên việc cần từ 1 đến 60 ký tự.').max(60, 'Tên việc cần từ 1 đến 60 ký tự.'),
    weight: z.number().int('Độ nặng phải là số nguyên.').min(1, 'Độ nặng từ 1 đến 5.').max(5, 'Độ nặng từ 1 đến 5.'),
    frequency: z.enum(['DAILY', 'WEEKLY', 'ADHOC']),
    recurrenceDays: z.array(z.number().int().min(1).max(7)),
    dueTime: z.string().regex(DUE_TIME, 'Giờ hạn phải có dạng HH:mm, ví dụ 21:00.'),
    rotationMode: z.enum(['WEEK_BLOCK', 'PER_OCCURRENCE']),
    occurrenceGap: z.number().int().min(1, 'Giãn cách từ 1 đến 6 lần.').max(6, 'Giãn cách từ 1 đến 6 lần.'),
  })
  .superRefine((v, ctx) => {
    if (v.frequency === 'WEEKLY' && v.recurrenceDays.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['recurrenceDays'], message: 'Chọn ít nhất một ngày trong tuần.' });
    }
  });

export type ChoreFormValues = z.output<typeof choreSchema>;

const END_AFTER_START = 'Ngày kết thúc phải sau hoặc trùng ngày bắt đầu.';

// Khớp CreateAbsenceDto backend (userId chỉ dùng khi trưởng phòng khai hộ).
export const absenceSchema = z
  .object({
    userId: z.string().optional(),
    startDate: dateField,
    endDate: dateField,
    reason: optionalText.optional(),
  })
  .refine((v) => v.endDate >= v.startDate, { path: ['endDate'], message: END_AFTER_START });

export type AbsenceFormValues = z.output<typeof absenceSchema>;

// Khớp CreateBreakDto backend.
export const breakSchema = z
  .object({
    startDate: dateField,
    endDate: dateField,
    reason: optionalText.optional(),
  })
  .refine((v) => v.endDate >= v.startDate, { path: ['endDate'], message: END_AFTER_START });

export type BreakFormValues = z.output<typeof breakSchema>;

// Khớp UpdateChoreSettingsDto backend.
export const settingsSchema = z.object({
  choreGraceHours: z.number().int('Ân hạn phải là số giờ nguyên.').min(1, 'Ân hạn từ 1 đến 24 giờ.').max(24, 'Ân hạn từ 1 đến 24 giờ.'),
  maxSlotsPerPersonPerDay: z.number().int('Số ca phải là số nguyên.').min(1, 'Số ca mỗi ngày từ 1 đến 6.').max(6, 'Số ca mỗi ngày từ 1 đến 6.'),
});

export type SettingsFormValues = z.output<typeof settingsSchema>;
