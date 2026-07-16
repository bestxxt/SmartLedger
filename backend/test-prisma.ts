import { prisma } from './src/prisma';
async function run() {
  try {
    const users = await prisma.user.findMany();
    console.log(users);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
