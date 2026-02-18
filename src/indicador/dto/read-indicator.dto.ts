import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const ReadIndicatorSchema = z.object({
  startDate: z
    .string()
    .optional()
    .default(() =>
      dayjs().subtract(30, 'day').tz('America/Sao_Paulo').format('YYYY-MM-DD'),
    ),

  endDate: z
    .string()
    .optional()
    .default(() => dayjs().tz('America/Sao_Paulo').format('YYYY-MM-DD')),

  typeMaintenance: z
    .string()
    .default('1')
    .refine((val) => /^(\d+,)*\d+$/.test(val), {
      message: 'Use apenas números separados por vírgula.',
    })
    .transform((val) => val.split(',').map(Number)),

  id_cliente: z.coerce.number().optional().default(405),
});

export type ReadIndicatorDTO = z.infer<typeof ReadIndicatorSchema>;
