import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * In development, Next.js/tsx hot-reloads create multiple instances.
 * This pattern ensures only one connection pool exists.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
