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
