import {z} from 'zod';

import {E_PERMISSIONS} from '../../permissions/constants';

/** Только для e2e: создание пользователя (login → username в БД). */
export const testCreateUserSchema = z
  .object({
    email: z.string().openapi({
      description: 'Email пользователя',
      example: 'e2e@example.com',
    }),
    login: z.string().openapi({
      description: 'Уникальный логин (сохраняется как username)',
      example: 'e2e_user',
    }),
    password: z.string().openapi({
      description: 'Пароль в открытом виде (будет захеширован)',
      example: 'testpass123',
    }),
    name: z.string().optional().openapi({
      description: 'Имя',
    }),
    surname: z.string().optional().openapi({
      description: 'Фамилия',
    }),
    patronymic: z.string().optional().openapi({
      description: 'Отчество',
    }),
    refreshToken: z.string().nullable().optional().openapi({
      description: 'Опциональный refresh token (как в User)',
    }),
  })
  .openapi('TestCreateUserDto');

export type TTestCreateUserDto = z.infer<typeof testCreateUserSchema>;

export const testGrantPermissionsSchema = z
  .object({
    email: z.string().openapi({
      description: 'Email пользователя',
      example: 'e2e@example.com',
    }),
    permissions: z.array(z.enum(E_PERMISSIONS)).openapi({
      description: 'Список permissions',
      example: [E_PERMISSIONS.EMAIL_VERIFIED],
    }),
  })
  .openapi('TestGrantPermissionsDto');

export type TTestGrantPermissionsDto = z.infer<
  typeof testGrantPermissionsSchema
>;

export const testDeleteUserSchema = z
  .object({
    email: z.string().openapi({
      description: 'Email пользователя для удаления',
      example: 'e2e@example.com',
    }),
  })
  .openapi('TestDeleteUserDto');

export type TTestDeleteUserDto = z.infer<typeof testDeleteUserSchema>;

export const testCreateUserOkResponseSchema = z
  .string()
  .openapi('TestCreateUserOkResponseDto', {
    description: 'Пользователь создан',
    example: 'User created',
  });

export const testGrantPermissionsOkResponseSchema = z
  .string()
  .openapi('TestGrantPermissionsOkResponseDto', {
    description: 'Права выданы',
    example: 'Permissions granted',
  });

export const testDeleteUserOkResponseSchema = z
  .string()
  .openapi('TestDeleteUserOkResponseDto', {
    description: 'Пользователь удалён',
    example: 'User deleted',
  });
