import {type PrismaClient} from '@prisma/client';

import {E_PERMISSIONS} from '../../src/modules/permissions/constants';

export async function seedPermissions(prisma: PrismaClient) {
  const permissions = [
    {
      name: E_PERMISSIONS.EMAIL_VERIFIED,
      description: 'Признак подтверждённой почты',
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {name: permission.name},
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }
}
