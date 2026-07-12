import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/*
 * Storing the Prisma Client on the global object in development prevents 
 * Next.js hot-reloading from creating duplicate connections on every code change.
 */
export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
