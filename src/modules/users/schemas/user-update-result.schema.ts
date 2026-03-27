import {z} from 'zod';

export const userUpdateResultSchema = z
  .object({
    name: z.string().nullable().openapi({
      description: 'Updated user first name',
      example: 'John',
    }),
    patronymic: z.string().nullable().openapi({
      description: 'Updated user patronymic / middle name',
      example: 'Ivanovich',
    }),
    surname: z.string().nullable().openapi({
      description: 'Updated user last name',
      example: 'Doe',
    }),
  })
  .openapi('UserUpdateResultDto');

export type TUserUpdateResultDto = z.infer<typeof userUpdateResultSchema>;
