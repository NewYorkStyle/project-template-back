import {z} from 'zod';

export const userProfileSchema = z
  .object({
    email: z.string().openapi({
      description: 'User email address',
      example: 'test@mail.com',
    }),
    name: z.string().nullable().openapi({
      description: 'User first name',
      example: 'John',
    }),
    patronymic: z.string().nullable().openapi({
      description: 'User patronymic / middle name',
      example: 'Ivanovich',
    }),
    surname: z.string().nullable().openapi({
      description: 'User last name',
      example: 'Doe',
    }),
  })
  .openapi('UserProfileDto');

export type TUserProfileDto = z.infer<typeof userProfileSchema>;
