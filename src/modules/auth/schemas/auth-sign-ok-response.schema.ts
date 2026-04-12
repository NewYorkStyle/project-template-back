import {z} from 'zod';

export const authSignOkResponseSchema = z
  .object({
    userId: z.uuid().openapi({
      description: 'Идентификатор пользователя (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
  })
  .openapi('AuthSignOkResponseDto');

export type TAuthSignOkResponseDto = z.infer<typeof authSignOkResponseSchema>;
