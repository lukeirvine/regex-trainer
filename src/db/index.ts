import "server-only";
import { neon } from "@neondatabase/serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

// Neon in production (DATABASE_URL comes from the Vercel Marketplace integration).
// Locally, with no DATABASE_URL, fall back to an embedded PGlite database in ./.pglite.
const globalForDb = globalThis as unknown as { dbPromise?: Promise<Db> };

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon({ client: neon(url), schema }) as unknown as Db;

  if (process.env.VERCEL) throw new Error("DATABASE_URL is not set");
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const db = drizzle({ client: new PGlite("./.pglite"), schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db as unknown as Db;
}

export function getDb(): Promise<Db> {
  globalForDb.dbPromise ??= createDb();
  return globalForDb.dbPromise;
}

export { schema };
