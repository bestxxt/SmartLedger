import { prisma } from './src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.update({
    where: { email: 'test3@example.com' },
    data: { password: hashedPassword }
  });
  console.log('Password reset to 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
