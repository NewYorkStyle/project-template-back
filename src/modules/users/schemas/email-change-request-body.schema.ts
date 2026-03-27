import {z} from 'zod';

export const emailChangeRequestBodySchema = z
  .object({
    newEmail: z.string().openapi({
      description: 'New email address for account',
      example: 'newemail@example.com',
    }),
  })
  .openapi('EmailChangeRequestBodyDto');

export type TEmailChangeRequestBodyDto = z.infer<
  typeof emailChangeRequestBodySchema
>;
