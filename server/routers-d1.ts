/**
 * tRPC Router for Cloudflare D1
 * This is a rewritten version of server/routers.ts for D1/Workers compatibility
 * 
 * Migration Status:
 * - ✅ Auth router (basic structure)
 * - ⏳ Profile router (TODO)
 * - ⏳ Assessment router (TODO)
 * - ⏳ Competencies router (TODO)
 * - ⏳ Other routers (TODO)
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc-d1";
import * as schema from "../drizzle/schema-d1";
import bcrypt from "bcryptjs";

/**
 * Helper: Create JWT token (using Web Crypto API for Workers)
 * TODO: Implement proper JWT creation/verification for Workers environment
 */
async function createJWT(payload: any, secret: string): Promise<string> {
  // Placeholder - needs Web Crypto API implementation
  // For now, return a simple token (NOT SECURE - just for development)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Helper: Verify JWT token
 */
async function verifyJWT(token: string, secret: string): Promise<any> {
  // Placeholder - needs Web Crypto API implementation
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
  } catch {
    throw new Error('Invalid token');
  }
}

/**
 * Helper: Create Set-Cookie header value
 */
function createCookieHeader(name: string, value: string, options: {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
}): string {
  const parts = [`${name}=${value}`];
  
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  
  return parts.join('; ');
}

/**
 * Authentication Router
 */
const authRouter = router({
  /**
   * Get current user info
   */
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user || null;
  }),

  /**
   * Logout (clear session)
   * Note: In Workers, we can't directly clear cookies
   * Instead, we return a Set-Cookie header with expired cookie
   */
  logout: publicProcedure.mutation(() => {
    // Return success - frontend will handle cookie clearing
    // Or we can return a special header instruction
    return {
      success: true,
      clearCookie: true, // Frontend can read this and clear the cookie
    } as const;
  }),

  /**
   * Local username/password login
   */
  localLogin: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, env } = ctx;
      
      // Find user by username
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, input.username))
        .limit(1);
      
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '用户名或密码错误',
        });
      }
      
      // Verify password
      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '用户名或密码错误',
        });
      }
      
      // Update last signed in timestamp
      const now = Math.floor(Date.now() / 1000); // Unix timestamp
      await db
        .update(schema.users)
        .set({ lastSignedIn: now })
        .where(eq(schema.users.id, user.id));
      
      // Create JWT token
      const jwtSecret = env.JWT_SECRET || 'default-secret-change-me';
      const token = await createJWT({
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      }, jwtSecret);
      
      return {
        success: true,
        token, // Frontend will store this
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  /**
   * Change password (protected)
   */
  changePassword: protectedProcedure
    .input(z.object({
      oldPassword: z.string().min(1),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '请先登录',
        });
      }
      
      // Get user with password hash
      const [dbUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);
      
      if (!dbUser || !dbUser.passwordHash) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        });
      }
      
      // Verify old password
      const isValid = await bcrypt.compare(input.oldPassword, dbUser.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '原密码错误',
        });
      }
      
      // Hash new password
      const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
      
      // Update password
      await db
        .update(schema.users)
        .set({ 
          passwordHash: newPasswordHash,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(schema.users.id, user.id));
      
      return {
        success: true,
        message: '密码修改成功',
      };
    }),
});

/**
 * Profile Router (Stub - TODO: Implement)
 */
const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Implement profile fetching
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Profile router not yet implemented in D1 version',
    });
  }),
});

/**
 * Assessment Router (Stub - TODO: Implement)
 */
const assessmentRouter = router({
  getQuestions: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Implement question fetching
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Assessment router not yet implemented in D1 version',
    });
  }),
});

/**
 * Main App Router
 * Combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  assessment: assessmentRouter,
  // TODO: Add more routers as they're migrated:
  // competencies: competenciesRouter,
  // organization: organizationRouter,
  // scenarios: scenariosRouter,
  // learning: learningRouter,
  // achievements: achievementsRouter,
  // wiki: wikiRouter,
  // feedback: feedbackRouter,
  // admin: adminRouter,
});

/**
 * Export router type for client
 */
export type AppRouter = typeof appRouter;
