/**
 * tRPC Router for Cloudflare D1
 * This is a rewritten version of server/routers.ts for D1/Workers compatibility
 * 
 * Migration Status:
 * - ✅ Auth router (COMPLETE - login, logout, register, changePassword)
 * - ⏳ Profile router (TODO)
 * - ⏳ Assessment router (TODO)
 * - ⏳ Competencies router (TODO)
 * - ⏳ Other routers (TODO)
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc-d1";
import { createUserToken } from "./_core/jwt-workers";
import { getDefaultCookieOptions, COOKIE_NAMES } from "./_core/cookies-workers";
import * as schema from "../drizzle/schema-d1";
import bcrypt from "bcryptjs";

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
   * Returns instructions for frontend to clear cookie
   */
  logout: publicProcedure.mutation(() => {
    return {
      success: true,
      clearCookie: true,
      cookieName: COOKIE_NAMES.SESSION,
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
      const token = await createUserToken(user, jwtSecret);
      
      return {
        success: true,
        token, // Frontend will store this in cookie or localStorage
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
   * User registration
   */
  register: publicProcedure
    .input(z.object({
      username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位').regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
      password: z.string().min(6, '密码至少6位'),
      email: z.string().email('请输入有效的邮箱地址').optional(),
      name: z.string().min(1, '请输入姓名').optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, env } = ctx;
      
      // Check if username already exists
      const [existingUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, input.username))
        .limit(1);
      
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '用户名已存在，请选择其他用户名',
        });
      }
      
      // Check if email already exists (if provided)
      if (input.email) {
        const [existingEmail] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, input.email))
          .limit(1);
        
        if (existingEmail) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '该邮箱已被注册',
          });
        }
      }
      
      // Generate password hash
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(input.password, salt);
      
      // Generate openId (local users use local_ prefix)
      const openId = `local_${input.username}`;
      
      // Create user
      const [newUser] = await db
        .insert(schema.users)
        .values({
          username: input.username,
          passwordHash,
          openId,
          name: input.name || input.username,
          email: input.email || null,
          loginMethod: 'local',
          role: 'user',
        })
        .returning();
      
      // Create JWT token
      const jwtSecret = env.JWT_SECRET || 'default-secret-change-me';
      const token = await createUserToken(newUser, jwtSecret);
      
      return {
        success: true,
        message: '注册成功',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      };
    }),

  /**
   * Change password (protected)
   */
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6, '新密码至少6位'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Get user with password hash
      const [dbUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);
      
      if (!dbUser || !dbUser.passwordHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '当前用户不支持密码登录',
        });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(input.currentPassword, dbUser.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '当前密码错误',
        });
      }
      
      // Generate new password hash
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(input.newPassword, salt);
      
      // Update password
      await db
        .update(schema.users)
        .set({ 
          passwordHash: newHash,
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
