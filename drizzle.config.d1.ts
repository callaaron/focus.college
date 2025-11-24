import { defineConfig } from "drizzle-kit";

/**
 * Drizzle configuration for Cloudflare D1
 * 
 * Usage:
 * 1. Local development: npx drizzle-kit generate --config=drizzle.config.d1.ts
 * 2. Push to D1: npx wrangler d1 migrations apply focus-college-db --local (for local testing)
 * 3. Push to production: npx wrangler d1 migrations apply focus-college-db --remote
 */

export default defineConfig({
  schema: "./drizzle/schema-d1.ts",
  out: "./drizzle/migrations-d1",
  dialect: "sqlite",
  driver: "d1-http",
});
