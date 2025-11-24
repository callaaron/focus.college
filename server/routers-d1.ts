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
 * Profile Router
 */
const profileRouter = router({
  /**
   * Get current user profile
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, user.id))
      .limit(1);
    
    return profile || null;
  }),

  /**
   * Get profile completion status
   */
  getCompletion: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, user.id))
      .limit(1);
    
    if (!profile) {
      return {
        completionRate: 0,
        missingFields: [
          "行业类型", "公司规模", "发展阶段", "当前岗位",
          "管理级别", "直接下属人数", "团队总人数", "管理年限"
        ]
      };
    }

    const fields = [
      { key: 'industry', label: '行业类型' },
      { key: 'companySize', label: '公司规模' },
      { key: 'companyStage', label: '发展阶段' },
      { key: 'currentRole', label: '当前岗位' },
      { key: 'managementLevel', label: '管理级别' },
      { key: 'directReports', label: '直接下属人数' },
      { key: 'teamSize', label: '团队总人数' },
      { key: 'yearsOfManagement', label: '管理年限' },
    ];

    const missingFields: string[] = [];
    let filledCount = 0;

    for (const field of fields) {
      const value = (profile as any)[field.key];
      // For number fields, 0 is a valid value
      if (value === null || value === undefined || value === '') {
        missingFields.push(field.label);
      } else {
        filledCount++;
      }
    }

    const completionRate = Math.round((filledCount / fields.length) * 100);

    return {
      completionRate,
      missingFields
    };
  }),

  /**
   * Create user profile
   */
  create: protectedProcedure
    .input(z.object({
      industry: z.string(),
      industryId: z.number().optional(),
      companySize: z.enum(["startup", "small", "medium", "large"]),
      companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]),
      currentRole: z.string(),
      positionId: z.number().optional(),
      managementLevel: z.enum(["executive", "senior", "middle", "junior"]),
      directReports: z.number(),
      teamSize: z.number(),
      yearsOfManagement: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Check if profile already exists
      const [existing] = await db
        .select()
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, user.id))
        .limit(1);
      
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '用户画像已存在，请使用更新接口',
        });
      }
      
      await db.insert(schema.userProfiles).values({
        userId: user.id,
        industry: input.industry,
        industryId: input.industryId || null,
        companySize: input.companySize,
        companyStage: input.companyStage,
        currentRole: input.currentRole,
        positionId: input.positionId || null,
        managementLevel: input.managementLevel,
        directReports: input.directReports,
        teamSize: input.teamSize,
        yearsOfManagement: input.yearsOfManagement,
        profileCompleted: true,
      });
      
      return { success: true };
    }),

  /**
   * Update user profile
   */
  update: protectedProcedure
    .input(z.object({
      industry: z.string().optional(),
      industryId: z.number().optional(),
      companySize: z.enum(["startup", "small", "medium", "large"]).optional(),
      companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]).optional(),
      currentRole: z.string().optional(),
      positionId: z.number().optional(),
      managementLevel: z.enum(["executive", "senior", "middle", "junior"]).optional(),
      directReports: z.number().optional(),
      teamSize: z.number().optional(),
      yearsOfManagement: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Check if profile exists
      const [existing] = await db
        .select()
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, user.id))
        .limit(1);
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户画像不存在，请先创建',
        });
      }
      
      // Filter out undefined values
      const updates: any = {};
      if (input.industry !== undefined) updates.industry = input.industry;
      if (input.industryId !== undefined) updates.industryId = input.industryId;
      if (input.companySize !== undefined) updates.companySize = input.companySize;
      if (input.companyStage !== undefined) updates.companyStage = input.companyStage;
      if (input.currentRole !== undefined) updates.currentRole = input.currentRole;
      if (input.positionId !== undefined) updates.positionId = input.positionId;
      if (input.managementLevel !== undefined) updates.managementLevel = input.managementLevel;
      if (input.directReports !== undefined) updates.directReports = input.directReports;
      if (input.teamSize !== undefined) updates.teamSize = input.teamSize;
      if (input.yearsOfManagement !== undefined) updates.yearsOfManagement = input.yearsOfManagement;
      updates.updatedAt = Math.floor(Date.now() / 1000);
      
      await db
        .update(schema.userProfiles)
        .set(updates)
        .where(eq(schema.userProfiles.userId, user.id));
      
      return { success: true };
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
