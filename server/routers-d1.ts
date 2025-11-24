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
import { eq, and, desc, sql } from "drizzle-orm";
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
 * Assessment Router - Question-based evaluation system
 */
const assessmentRouter = router({
  /**
   * Get assessment questions
   */
  getQuestions: protectedProcedure
    .input(z.object({
      competencyId: z.number().optional(),
      limit: z.number().optional().default(10),
      excludeAnswered: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Build query
      let query = db
        .select()
        .from(schema.assessmentQuestions)
        .where(eq(schema.assessmentQuestions.isActive, true));
      
      // Filter by competency if specified
      if (input.competencyId) {
        query = query.where(eq(schema.assessmentQuestions.competencyId, input.competencyId)) as any;
      }
      
      // Get questions
      let questions = await query
        .orderBy(schema.assessmentQuestions.sortOrder)
        .limit(input.limit);
      
      // Exclude answered questions if requested
      if (input.excludeAnswered) {
        const answeredQuestions = await db
          .select({ questionId: schema.userAnswers.questionId })
          .from(schema.userAnswers)
          .where(eq(schema.userAnswers.userId, user.id));
        
        const answeredIds = new Set(answeredQuestions.map(a => a.questionId));
        questions = questions.filter(q => !answeredIds.has(q.id));
      }
      
      return questions;
    }),

  /**
   * Create assessment session
   */
  startSession: protectedProcedure
    .input(z.object({
      sessionType: z.enum(["initial", "regular", "position"]),
      totalQuestions: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      const [session] = await db
        .insert(schema.assessmentSessions)
        .values({
          userId: user.id,
          sessionType: input.sessionType,
          totalQuestions: input.totalQuestions,
          answeredQuestions: 0,
          status: 'in_progress',
        })
        .returning();
      
      return { sessionId: session.id };
    }),

  /**
   * Submit answer for a question
   */
  submitAnswer: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      questionId: z.number(),
      competencyId: z.number(),
      answer: z.number().min(1).max(5), // Answer option 1-5
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Get question to find score mapping
      const [question] = await db
        .select()
        .from(schema.assessmentQuestions)
        .where(eq(schema.assessmentQuestions.id, input.questionId))
        .limit(1);
      
      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '题目不存在',
        });
      }
      
      // Map answer to score
      const scoreMap: Record<number, number> = {
        1: question.score1 || 20,
        2: question.score2 || 40,
        3: question.score3 || 60,
        4: question.score4 || 80,
        5: question.score5 || 100,
      };
      
      const score = scoreMap[input.answer] || 0;
      
      // Save answer
      await db.insert(schema.userAnswers).values({
        userId: user.id,
        sessionId: input.sessionId,
        questionId: input.questionId,
        competencyId: input.competencyId,
        answer: input.answer,
        score,
      });
      
      // Update session progress
      await db
        .update(schema.assessmentSessions)
        .set({ 
          answeredQuestions: sql`${schema.assessmentSessions.answeredQuestions} + 1`,
        })
        .where(eq(schema.assessmentSessions.id, input.sessionId));
      
      // Update or create competency score
      const [existingScore] = await db
        .select()
        .from(schema.competencyScores)
        .where(
          and(
            eq(schema.competencyScores.userId, user.id),
            eq(schema.competencyScores.competencyId, input.competencyId)
          )
        )
        .limit(1);
      
      if (existingScore) {
        // Update existing score
        const newQuestionnaireScore = Math.round(
          ((existingScore.questionnaireScore || 0) * (existingScore.practiceCount || 0) + score) /
          ((existingScore.practiceCount || 0) + 1)
        );
        
        // Calculate weighted final score
        const finalScore = Math.round(
          newQuestionnaireScore * (existingScore.questionnaireWeight / 100) +
          (existingScore.selfAssessmentScore || 0) * (existingScore.selfAssessmentWeight / 100) +
          (existingScore.aiAnalysisScore || 0) * (existingScore.aiAnalysisWeight / 100) +
          (existingScore.evidenceScore || 0) * (existingScore.evidenceWeight / 100)
        );
        
        const level = Math.min(5, Math.floor(finalScore / 20) + 1);
        
        await db
          .update(schema.competencyScores)
          .set({
            questionnaireScore: newQuestionnaireScore,
            finalScore,
            level,
            practiceCount: (existingScore.practiceCount || 0) + 1,
            lastPracticeAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
          })
          .where(eq(schema.competencyScores.id, existingScore.id));
      } else {
        // Create new score record
        const finalScore = Math.round(score * 0.4); // 40% weight for questionnaire
        const level = Math.min(5, Math.floor(finalScore / 20) + 1);
        
        await db.insert(schema.competencyScores).values({
          userId: user.id,
          competencyId: input.competencyId,
          questionnaireScore: score,
          finalScore,
          level,
          practiceCount: 1,
          lastPracticeAt: Math.floor(Date.now() / 1000),
        });
      }
      
      return { success: true, score };
    }),

  /**
   * Complete assessment session
   */
  completeSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      
      await db
        .update(schema.assessmentSessions)
        .set({
          status: 'completed',
          completedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(schema.assessmentSessions.id, input.sessionId));
      
      return { success: true };
    }),

  /**
   * Get user's assessment progress
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    // Get all sessions
    const sessions = await db
      .select()
      .from(schema.assessmentSessions)
      .where(eq(schema.assessmentSessions.userId, user.id))
      .orderBy(desc(schema.assessmentSessions.createdAt));
    
    // Get all answers
    const answers = await db
      .select()
      .from(schema.userAnswers)
      .where(eq(schema.userAnswers.userId, user.id));
    
    // Get competency scores
    const scores = await db
      .select()
      .from(schema.competencyScores)
      .where(eq(schema.competencyScores.userId, user.id));
    
    return {
      sessions,
      totalAnswers: answers.length,
      competencyScores: scores,
    };
  }),

  /**
   * Get user's competency scores
   */
  getScores: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const scores = await db
      .select()
      .from(schema.competencyScores)
      .where(eq(schema.competencyScores.userId, user.id));
    
    return scores;
  }),
});

/**
 * Competencies Router - Competency management
 */
const competenciesRouter = router({
  /**
   * Get all competencies
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    const competencies = await db
      .select()
      .from(schema.competencies)
      .orderBy(schema.competencies.sortOrder);
    
    return competencies;
  }),

  /**
   * Get competencies by domain
   */
  getByDomain: protectedProcedure
    .input(z.object({
      domainId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      
      const competencies = await db
        .select()
        .from(schema.competencies)
        .where(eq(schema.competencies.domainId, input.domainId))
        .orderBy(schema.competencies.sortOrder);
      
      return competencies;
    }),

  /**
   * Get all competency domains
   */
  getDomains: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    const domains = await db
      .select()
      .from(schema.competencyDomains)
      .orderBy(schema.competencyDomains.sortOrder);
    
    return domains;
  }),

  /**
   * Get user's competency scores
   */
  getUserScores: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const scores = await db
      .select()
      .from(schema.competencyScores)
      .where(eq(schema.competencyScores.userId, user.id));
    
    return scores;
  }),
});

/**
 * Organization Assessment Router
 */
const organizationRouter = router({
  /**
   * Get organization assessment
   */
  getAssessment: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const [assessment] = await db
      .select()
      .from(schema.organizationAssessments)
      .where(eq(schema.organizationAssessments.userId, user.id))
      .orderBy(desc(schema.organizationAssessments.createdAt))
      .limit(1);
    
    return assessment || null;
  }),

  /**
   * Submit organization assessment
   */
  submitAssessment: protectedProcedure
    .input(z.object({
      strategyScore: z.number().min(0).max(100),
      operationScore: z.number().min(0).max(100),
      organizationScore: z.number().min(0).max(100),
      innovationScore: z.number().min(0).max(100),
      detailedScores: z.string().optional(), // JSON string
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Create new assessment
      await db.insert(schema.organizationAssessments).values({
        userId: user.id,
        strategyScore: input.strategyScore,
        operationScore: input.operationScore,
        organizationScore: input.organizationScore,
        innovationScore: input.innovationScore,
        detailedScores: input.detailedScores || null,
      });
      
      // Also save to history
      await db.insert(schema.organizationAssessmentHistory).values({
        userId: user.id,
        strategyScore: input.strategyScore,
        operationScore: input.operationScore,
        organizationScore: input.organizationScore,
        innovationScore: input.innovationScore,
        questionAnswers: null,
        metricValues: null,
        assessmentDate: Math.floor(Date.now() / 1000),
      });
      
      return { success: true };
    }),

  /**
   * Get assessment history
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const history = await db
      .select()
      .from(schema.organizationAssessmentHistory)
      .where(eq(schema.organizationAssessmentHistory.userId, user.id))
      .orderBy(desc(schema.organizationAssessmentHistory.assessmentDate))
      .limit(10);
    
    return history;
  }),
});

/**
 * Industries Router - Industry data
 */
const industriesRouter = router({
  /**
   * Get all industries
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    const industries = await db
      .select()
      .from(schema.industries);
    
    return industries;
  }),
});

/**
 * Positions Router - Position data
 */
const positionsRouter = router({
  /**
   * Get all positions
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    const positions = await db
      .select()
      .from(schema.positions);
    
    return positions;
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
  competencies: competenciesRouter,
  organization: organizationRouter,
  industries: industriesRouter,
  positions: positionsRouter,
  // TODO: Add more routers as needed:
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
