import {type PrismaClient} from '@prisma/client';

const TOURS = [
  {
    key: 'home-onboarding:v1',
    name: 'Home onboarding',
  },
] as const;

export async function seedTours(prisma: PrismaClient) {
  for (const tour of TOURS) {
    await prisma.tour.upsert({
      where: {key: tour.key},
      update: {
        name: tour.name,
      },
      create: {
        isActive: true,
        key: tour.key,
        name: tour.name,
      },
    });
  }
}
