import { prisma } from '../src/prisma';

async function reset() {
  const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
  if (user) {
    await prisma.category.deleteMany({ where: { userId: user.id } });
    console.log('Deleted old categories for test user.');
  }
}

reset().catch(console.error).finally(() => prisma.$disconnect());
