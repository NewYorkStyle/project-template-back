import 'dotenv/config';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '@prisma/client';

import {seedPermissions} from './permissions.seed';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('Seeding started...');

  await seedPermissions(prisma);

  console.log('Seeding finished');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
