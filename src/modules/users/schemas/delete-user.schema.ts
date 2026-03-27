import {z} from 'zod';

export const deleteUserSchema = z
  .object({
    password: z.string().openapi({
      description: 'Current password confirmation',
      example: 'Qwerty123',
    }),
  })
  .openapi('DeleteUserDto');

export type TDeleteUserDto = z.infer<typeof deleteUserSchema>;
