import {z} from 'zod';

export const markTourSeenSchema = z
  .object({
    key: z.string().min(1).openapi({
      description: 'Уникальный ключ тура',
      example: 'feature-x:v1',
    }),
  })
  .openapi('MarkTourSeenDto');

export type TMarkTourSeenDto = z.infer<typeof markTourSeenSchema>;

export const markTourSeenOkResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Флаг успешной отметки тура',
      example: true,
    }),
  })
  .openapi('MarkTourSeenOkResponseDto');

export type TMarkTourSeenOkResponseDto = z.infer<
  typeof markTourSeenOkResponseSchema
>;
