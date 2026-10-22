// Applies drizzle migrations to Neon. Locally (no DATABASE_URL) the app migrates its
// embedded PGlite database on startup, so there's nothing to do here.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL not set — skipping migrations (local dev uses PGlite).");
} else {
  await migrate(drizzle({ client: neon(url) }), { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
}
