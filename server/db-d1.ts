/**
 * Cloudflare D1 Database Connection
 * This replaces server/db.ts for D1 environment
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../drizzle/schema-d1';

/**
 * Environment bindings interface for Cloudflare Workers/Pages
 */
export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  NODE_ENV?: string;
}

/**
 * Initialize Drizzle ORM with D1 database
 * This function should be called in your Pages Functions/Workers handlers
 * 
 * @param env - Cloudflare Workers/Pages environment bindings
 * @returns Drizzle ORM instance connected to D1
 * 
 * @example
 * ```ts
 * // In a Pages Function:
 * export async function onRequest(context) {
 *   const db = initializeD1Database(context.env);
 *   const users = await db.select().from(schema.users);
 *   // ...
 * }
 * ```
 */
export function initializeD1Database(env: Env) {
  if (!env.DB) {
    throw new Error('D1 Database binding (DB) not found in environment');
  }
  
  return drizzle(env.DB, { schema });
}

/**
 * Type helper for database instance
 */
export type Database = ReturnType<typeof initializeD1Database>;

// Re-export schema for convenience
export { schema };
