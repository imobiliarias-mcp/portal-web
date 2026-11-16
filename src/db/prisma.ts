import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

export class MissingDatabaseUrlError extends Error {}

const globalStore = globalThis as unknown as { portalPrisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new MissingDatabaseUrlError("DATABASE_URL is not set");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** One client per process; reused across hot reloads in development. */
export function database(): PrismaClient {
  globalStore.portalPrisma ??= createClient();
  return globalStore.portalPrisma;
}
