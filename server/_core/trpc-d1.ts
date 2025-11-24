/**
 * tRPC Adapter for Cloudflare Pages Functions
 * This replaces Express-based tRPC setup with fetch-compatible handler
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { initializeD1Database, Env, Database } from '../db-d1';
import { verifyJWT, extractBearerToken } from './jwt-workers';
import { getCookie } from './cookies-workers';
import superjson from 'superjson';

/**
 * Context type for tRPC procedures in D1 environment
 */
export interface D1TRPCContext {
  db: Database;
  env: Env;
  user?: {
    id: number;
    role: 'user' | 'admin';
    email?: string;
    name?: string;
  } | null;
  request: Request;
}

/**
 * Create context for tRPC procedures
 * This is called for every request
 */
export async function createD1Context(
  opts: FetchCreateContextFnOptions & { env: Env }
): Promise<D1TRPCContext> {
  const { req, env } = opts;
  
  // Initialize database
  const db = initializeD1Database(env);
  
  // Extract user from JWT token
  let user: D1TRPCContext['user'] = null;
  
  try {
    const jwtSecret = env.JWT_SECRET || 'default-secret-change-me-in-production';
    
    // Try to get token from Authorization header first
    const authHeader = req.headers.get('authorization');
    let token = extractBearerToken(authHeader);
    
    // If not in header, try cookie
    if (!token) {
      token = getCookie(req, 'session');
    }
    
    // Verify token if found
    if (token) {
      const payload = await verifyJWT(token, jwtSecret);
      user = {
        id: payload.userId,
        role: payload.role,
        email: payload.email,
        name: payload.name,
      };
    }
  } catch (error) {
    // Invalid or expired token, continue with null user
    console.error('Token verification failed:', error);
  }
  
  return {
    db,
    env,
    user,
    request: req,
  };
}

/**
 * Initialize tRPC with D1 context
 */
const t = initTRPC.context<D1TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error
            ? error.cause.message
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure builders
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now TypeScript knows user is not null
    },
  });
});

/**
 * Admin-only procedure
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  return next({ ctx });
});

/**
 * Middleware type exports
 */
export const middleware = t.middleware;
export type Context = D1TRPCContext;
