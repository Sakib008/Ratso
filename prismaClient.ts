import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
