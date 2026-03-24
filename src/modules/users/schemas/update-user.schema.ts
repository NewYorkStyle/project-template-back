import {z} from 'zod';

/** Только поля профиля; креды и refreshToken меняются отдельными потоками. */
export const updateUserSchema = z
  .object({
    name: z.string().optional().openapi({
      description: 'User first name',
      example: 'John',
    }),
    patronymic: z.string().optional().openapi({
      description: 'User patronymic / middle name',
      example: 'Ivanovich',
    }),
    surname: z.string().optional().openapi({
      description: 'User last name',
      example: 'Doe',
    }),
  })
  .openapi('UpdateUserDto');

export type TUpdateUserDto = z.infer<typeof updateUserSchema>;
