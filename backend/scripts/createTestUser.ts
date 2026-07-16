import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'test@test.com';
  const password = 'test';
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Test user already exists! Email: test@test.com | Password: test');
    return;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Test User'
    }
  });
  
  console.log('Test user created successfully!');
  console.log('Email: test@test.com');
  console.log('Password: test');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
