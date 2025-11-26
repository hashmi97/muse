import { PrismaClient } from '@prisma/client';

// Singleton Prisma client to avoid hot-reload connection storms
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}
