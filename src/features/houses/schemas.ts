import { z } from 'zod';

// Khớp CreateHouseDto backend.
export const createHouseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên nhà cần từ 2 đến 60 ký tự.')
    .max(60, 'Tên nhà cần từ 2 đến 60 ký tự.'),
  address: z
    .string()
    .trim()
    .max(120, 'Địa chỉ tối đa 120 ký tự.')
    .transform((v) => v || undefined),
  maxMembers: z.number().int().min(2).max(10),
});

export type CreateHouseFormInput = z.input<typeof createHouseSchema>;
export type CreateHouseFormValues = z.output<typeof createHouseSchema>;

/** Khớp UpdateHouseDto backend. `activeCount` là số người đang ở: sức chứa không được thấp hơn. */
export const houseInfoSchema = (activeCount: number) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Tên nhà cần từ 2 đến 60 ký tự.')
      .max(60, 'Tên nhà cần từ 2 đến 60 ký tự.'),
    // Rỗng được giữ nguyên: backend hiểu chuỗi rỗng là xóa địa chỉ.
    address: z.string().trim().max(120, 'Địa chỉ tối đa 120 ký tự.'),
    maxMembers: z
      .number()
      .int()
      .min(2, 'Nhà cần ít nhất 2 người.')
      .max(10, 'Nhà tối đa 10 người.')
      .refine((n) => n >= activeCount, `Nhà đang có ${activeCount} người, số người tối đa không thể thấp hơn.`),
  });

export type HouseInfoValues = z.output<ReturnType<typeof houseInfoSchema>>;

export const RULES_MAX = 1000;

export const rulesSchema = z.object({
  rules: z.string().trim().max(RULES_MAX, `Nội quy tối đa ${RULES_MAX} ký tự.`),
});

export type RulesValues = z.output<typeof rulesSchema>;
