import { z } from 'zod';

// Khớp CreateChoreDto backend.
export const choreSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tên việc cần từ 1 đến 60 ký tự.')
    .max(60, 'Tên việc cần từ 1 đến 60 ký tự.'),
  weight: z.number().int('Độ nặng phải là số nguyên.').min(1, 'Độ nặng từ 1 đến 5.').max(5, 'Độ nặng từ 1 đến 5.'),
});

export type ChoreFormValues = z.output<typeof choreSchema>;
