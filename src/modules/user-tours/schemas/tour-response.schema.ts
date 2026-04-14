import {z} from 'zod';

export const tourResponseSchema = z
  .object({
    key: z.string().openapi({
      description: 'Уникальный ключ тура',
      example: 'feature-x:v1',
    }),
    seenAt: z.string().datetime().openapi({
      description: 'Дата и время просмотра',
      example: '2026-04-13T10:00:00.000Z',
    }),
  })
  .openapi('TourResponseDto');

export type TTourResponseDto = z.infer<typeof tourResponseSchema>;

export const userToursListSchema = z
  .object({
    tours: z.array(tourResponseSchema).openapi({
      description: 'Список просмотренных туров',
    }),
  })
  .openapi('UserToursListDto');

export type TUserToursListDto = z.infer<typeof userToursListSchema>;
