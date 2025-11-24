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

  /**
   * Get user's competency progress (compatibility endpoint)
   */
  myProgress: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    // Get all competencies
    const allCompetencies = await db
      .select()
      .from(schema.competencies)
      .orderBy(schema.competencies.sortOrder);
    
    // Get user's scores
    const userScores = await db
      .select()
      .from(schema.competencyScores)
      .where(eq(schema.competencyScores.userId, user.id));
    
    // Merge competencies with user progress
    return allCompetencies.map(comp => {
      const score = userScores.find(s => s.competencyId === comp.id);
      return {
        ...comp,
        userProgress: score ? {
          currentLevel: score.level || 0,
          selfAssessed: score.selfAssessedScore || 0,
          aiAssessed: score.aiAssessedScore || 0,
          practiceCount: 0,
          status: (score.level || 0) >= 3 ? "mastered" : (score.level || 0) >= 1 ? "learning" : "not_started" as const
        } : {
          currentLevel: 0,
          selfAssessed: 0,
          aiAssessed: 0,
          practiceCount: 0,
          status: "not_started" as const
        }
      };
    });
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
 * Scenarios Router - 情境模拟系统
 */
const scenariosRouter = router({
  /**
   * Submit a new management scenario for AI analysis
   */
  submit: protectedProcedure
    .input(z.object({
      title: z.string().min(1, '标题不能为空'),
      description: z.string().min(10, '描述至少10个字符'),
      companyStage: z.enum(['seed', 'angel', 'series_a', 'series_b', 'series_c', 'series_d', 'pre_ipo', 'public', 'mature']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Get user profile for context
      const [userProfile] = await db
        .select()
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, user.id))
        .limit(1);
      
      // Get all competencies for context
      const allCompetencies = await db.select().from(schema.competencies);
      
      const competenciesContext = allCompetencies
        .map(c => `- ${c.name} (${c.category}): ${c.description}`)
        .join('\n');
      
      // Build user context
      const userContext = userProfile ? `
**用户背景**：
- 行业：${userProfile.industry || '未知'}
- 公司规模：${userProfile.companySize || '未知'}
- 当前岗位：${userProfile.currentRole || '未知'}
- 管理级别：${userProfile.managementLevel || '未知'}
- 管理年限：${userProfile.yearsOfManagement || 0}年
- 直接下属：${userProfile.directReports || 0}人` : '';
      
      // AI analysis (simplified - actual AI integration would go here)
      const aiResult = {
        analysis: `## 问题诊断\n\n基于您提交的场景"${input.title}"，这是一个典型的管理挑战。\n\n### 表现和影响\n${input.description}\n\n### 根本原因\n- 系统层面：流程不清晰\n- 人员层面：沟通不畅\n- 文化层面：协作不足`,
        suggestions: `## 解决建议\n\n### 短期行动（1-2周）\n1. 立即召开团队会议\n2. 明确责任分工\n\n### 中期优化（1-3个月）\n1. 优化工作流程\n2. 建立反馈机制\n\n### 长期建设\n1. 建立系统化管理体系\n2. 培养团队能力`,
        competencies: [
          { name: '战略思维', importance: 5, category: '战略模块', reason: '需要从全局角度思考问题' },
          { name: '团队管理', importance: 4, category: '团队模块', reason: '需要有效管理团队' },
          { name: '沟通协调', importance: 4, category: '人际模块', reason: '需要协调各方资源' },
        ],
      };
      
      // Save scenario
      const now = Math.floor(Date.now() / 1000);
      const [scenario] = await db
        .insert(schema.scenarios)
        .values({
          userId: user.id,
          title: input.title,
          description: input.description,
          aiAnalysis: aiResult.analysis,
          aiSuggestions: aiResult.suggestions,
          identifiedCompetencies: JSON.stringify(aiResult.competencies),
          companyStage: input.companyStage || 'seed',
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      
      return {
        ...aiResult,
        scenarioId: scenario.id,
      };
    }),
  
  /**
   * Get user's all scenarios
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const scenarios = await db
      .select()
      .from(schema.scenarios)
      .where(eq(schema.scenarios.userId, user.id))
      .orderBy(desc(schema.scenarios.createdAt));
    
    return scenarios;
  }),
  
  /**
   * Get single scenario detail
   */
  get: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      const [scenario] = await db
        .select()
        .from(schema.scenarios)
        .where(and(
          eq(schema.scenarios.id, input.id),
          eq(schema.scenarios.userId, user.id)
        ))
        .limit(1);
      
      if (!scenario) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '场景不存在',
        });
      }
      
      return scenario;
    }),
});

/**
 * Learning Router - 学习系统
 */
const learningRouter = router({
  /**
   * Generate personalized learning path
   */
  generatePath: protectedProcedure
    .input(z.object({
      competencyId: z.number(),
      targetLevel: z.number().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Get competency
      const [competency] = await db
        .select()
        .from(schema.competencies)
        .where(eq(schema.competencies.id, input.competencyId))
        .limit(1);
      
      if (!competency) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '能力不存在',
        });
      }
      
      // Get user's current level
      const [userComp] = await db
        .select()
        .from(schema.competencyScores)
        .where(and(
          eq(schema.competencyScores.userId, user.id),
          eq(schema.competencyScores.competencyId, input.competencyId)
        ))
        .limit(1);
      
      const currentLevel = userComp?.currentLevel || 1;
      
      if (currentLevel >= input.targetLevel) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '您的当前能力等级已达到或超过目标等级',
        });
      }
      
      // Generate learning path (simplified - actual AI would generate this)
      const pathData = {
        title: `${competency.name}能力提升计划（L${currentLevel} → L${input.targetLevel}）`,
        description: `这是一个为期${(input.targetLevel - currentLevel) * 2}个月的学习计划，旨在帮助您从L${currentLevel}提升到L${input.targetLevel}。`,
        estimatedDuration: `${(input.targetLevel - currentLevel) * 2}个月`,
        resources: [
          {
            title: `《${competency.name}实战指南》`,
            type: 'book',
            description: '系统介绍相关理论和实践案例',
            url: '',
            author: '管理大师',
            platform: '得到',
            difficulty: 'intermediate',
            estimatedTime: '2周',
          },
          {
            title: `${competency.name}在线课程`,
            type: 'course',
            description: '系统性的在线学习课程',
            url: '',
            author: '知名讲师',
            platform: 'Coursera',
            difficulty: 'intermediate',
            estimatedTime: '4周',
          },
        ],
      };
      
      // Save learning path
      const now = Math.floor(Date.now() / 1000);
      
      // Create resource IDs array (simplified - in production would create resources first)
      const resourceIds = pathData.resources.map((_, i) => i + 1).join(',');
      
      const [path] = await db
        .insert(schema.learningPaths)
        .values({
          userId: user.id,
          title: pathData.title,
          description: pathData.description,
          targetCompetencies: String(input.competencyId), // Store competency ID
          resourceIds: resourceIds,
          totalResources: pathData.resources.length,
          completedResources: 0,
          estimatedDays: (input.targetLevel - currentLevel) * 60, // ~2 months per level
          status: 'active',
          startedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      
      // Note: learningResources table structure is different
      // It's tied to competency, not to paths
      // We'll skip creating individual resources for now since the schema doesn't match
      
      return {
        pathId: path.id,
        ...pathData,
      };
    }),
  
  /**
   * Get user's learning paths
   */
  getMyPaths: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const paths = await db
      .select()
      .from(schema.learningPaths)
      .where(eq(schema.learningPaths.userId, user.id))
      .orderBy(desc(schema.learningPaths.createdAt));
    
    return paths;
  }),
  
  /**
   * Get learning path detail with resources and progress
   */
  getPathDetail: protectedProcedure
    .input(z.object({
      pathId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Get path
      const [path] = await db
        .select()
        .from(schema.learningPaths)
        .where(and(
          eq(schema.learningPaths.id, input.pathId),
          eq(schema.learningPaths.userId, user.id)
        ))
        .limit(1);
      
      if (!path) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '学习路径不存在',
        });
      }
      
      // Get competency resources (note: different schema structure)
      const competencyIds = path.targetCompetencies.split(',').map(Number);
      const resources = await db
        .select()
        .from(schema.learningResources)
        .where(sql`${schema.learningResources.competencyId} IN (${sql.join(competencyIds, sql`, `)})`);
      
      // Get progress for this path
      const progressList = await db
        .select()
        .from(schema.userLearningProgress)
        .where(and(
          eq(schema.userLearningProgress.userId, user.id),
          eq(schema.userLearningProgress.pathId, input.pathId)
        ));
      
      // Merge resources with progress
      const resourcesWithProgress = resources.map(resource => {
        const progress = progressList.find(p => p.resourceId === resource.id);
        return {
          ...resource,
          progress: progress ? {
            status: progress.status,
            progressPercent: progress.progressPercent,
            timeSpent: progress.timeSpent,
            notes: progress.notes,
            completedAt: progress.completedAt,
          } : {
            status: 'not_started',
            progressPercent: 0,
            timeSpent: 0,
          },
        };
      });
      
      return {
        ...path,
        resources: resourcesWithProgress,
      };
    }),
  
  /**
   * Update learning progress
   */
  updateProgress: protectedProcedure
    .input(z.object({
      pathId: z.number(),
      resourceId: z.number(),
      status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
      progressPercent: z.number().min(0).max(100).optional(),
      timeSpent: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Verify resource exists
      const [resource] = await db
        .select()
        .from(schema.learningResources)
        .where(eq(schema.learningResources.id, input.resourceId))
        .limit(1);
      
      if (!resource) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '学习资源不存在',
        });
      }
      
      // Check if progress exists
      const [existing] = await db
        .select()
        .from(schema.userLearningProgress)
        .where(and(
          eq(schema.userLearningProgress.userId, user.id),
          eq(schema.userLearningProgress.pathId, input.pathId),
          eq(schema.userLearningProgress.resourceId, input.resourceId)
        ))
        .limit(1);
      
      const now = Math.floor(Date.now() / 1000);
      
      if (existing) {
        // Update
        const updateData: any = { updatedAt: now };
        if (input.status) updateData.status = input.status;
        if (input.progressPercent !== undefined) updateData.progressPercent = input.progressPercent;
        if (input.timeSpent !== undefined) updateData.timeSpent = input.timeSpent;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.status === 'completed') updateData.completedAt = now;
        
        await db
          .update(schema.userLearningProgress)
          .set(updateData)
          .where(eq(schema.userLearningProgress.id, existing.id));
      } else {
        // Create
        await db.insert(schema.userLearningProgress).values({
          userId: user.id,
          pathId: input.pathId,
          resourceId: input.resourceId,
          status: input.status || 'not_started',
          progressPercent: input.progressPercent || 0,
          timeSpent: input.timeSpent || 0,
          notes: input.notes || null,
          startedAt: input.status === 'in_progress' ? now : null,
          completedAt: input.status === 'completed' ? now : null,
          createdAt: now,
          updatedAt: now,
        });
      }
      
      // Update path completion count if resource completed
      if (input.status === 'completed' && !existing) {
        const [path] = await db
          .select()
          .from(schema.learningPaths)
          .where(eq(schema.learningPaths.id, input.pathId))
          .limit(1);
        
        if (path) {
          await db
            .update(schema.learningPaths)
            .set({
              completedResources: (path.completedResources || 0) + 1,
              updatedAt: now,
            })
            .where(eq(schema.learningPaths.id, input.pathId));
        }
      }
      
      return { success: true };
    }),
});

/**
 * Achievements Router - 成就系统
 */
const achievementsRouter = router({
  /**
   * Get user's achievements
   */
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    const achievements = await db
      .select()
      .from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, user.id))
      .orderBy(desc(schema.userAchievements.unlockedAt));
    
    return achievements;
  }),
  
  /**
   * Get available achievements (not yet unlocked)
   */
  getAvailable: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    
    // Get all possible achievements (simplified - would normally fetch from achievements table)
    const possibleAchievements = [
      { id: 'first_assessment', name: '首次评估', description: '完成第一次能力评估', icon: '🎯', points: 10 },
      { id: 'first_scenario', name: '首次情境', description: '提交第一个管理情境', icon: '💼', points: 15 },
      { id: 'first_learning_path', name: '学习启航', description: '创建第一个学习计划', icon: '📚', points: 20 },
      { id: 'complete_5_resources', name: '勤学者', description: '完成5个学习资源', icon: '📖', points: 50 },
      { id: 'level_up_3', name: '能力提升', description: '任意能力提升3级', icon: '⬆️', points: 100 },
    ];
    
    // Get user's unlocked achievements
    const unlocked = await db
      .select()
      .from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, user.id));
    
    const unlockedIds = new Set(unlocked.map(a => a.achievementId));
    
    // Filter to only show available ones
    const available = possibleAchievements.filter(a => !unlockedIds.has(a.id));
    
    return available;
  }),
  
  /**
   * Check and award achievements (called internally after user actions)
   */
  checkAndAward: protectedProcedure
    .input(z.object({
      trigger: z.string(), // e.g., 'assessment_completed', 'scenario_submitted'
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Logic to check if achievements should be unlocked
      // This is a simplified version
      const newAchievements: string[] = [];
      
      if (input.trigger === 'assessment_completed') {
        // Check if this is first assessment
        const assessmentCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.assessmentSessions)
          .where(eq(schema.assessmentSessions.userId, user.id));
        
        if (assessmentCount[0]?.count === 1) {
          newAchievements.push('first_assessment');
        }
      }
      
      // Award new achievements
      const now = Math.floor(Date.now() / 1000);
      for (const achievementId of newAchievements) {
        await db.insert(schema.userAchievements).values({
          userId: user.id,
          achievementId,
          unlockedAt: now,
          createdAt: now,
        });
      }
      
      return {
        newAchievements,
      };
    }),
});

/**
 * Admin Router - 管理员功能
 */
const adminRouter = router({
  /**
   * Get all users (admin only)
   */
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const offset = (input.page - 1) * input.limit;
      
      // Build query
      let query = db.select().from(schema.users);
      
      if (input.search) {
        query = query.where(
          sql`${schema.users.username} LIKE ${`%${input.search}%`} OR ${schema.users.name} LIKE ${`%${input.search}%`} OR ${schema.users.email} LIKE ${`%${input.search}%`}`
        );
      }
      
      const users = await query
        .limit(input.limit)
        .offset(offset)
        .orderBy(desc(schema.users.createdAt));
      
      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users);
      
      return {
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          name: u.name,
          email: u.email,
          role: u.role,
          isDemo: u.isDemo,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
        total: countResult?.count || 0,
        page: input.page,
        limit: input.limit,
      };
    }),
  
  /**
   * Get user detail (admin only)
   */
  getUserDetail: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, input.userId))
        .limit(1);
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        });
      }
      
      // Get user's profile
      const [profile] = await db
        .select()
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, input.userId))
        .limit(1);
      
      // Get user's competency scores count
      const [scoresCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.competencyScores)
        .where(eq(schema.competencyScores.userId, input.userId));
      
      // Get user's assessment sessions count
      const [sessionsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.assessmentSessions)
        .where(eq(schema.assessmentSessions.userId, input.userId));
      
      return {
        ...user,
        passwordHash: undefined, // Don't expose password hash
        profile,
        stats: {
          competencyScores: scoresCount?.count || 0,
          assessmentSessions: sessionsCount?.count || 0,
        },
      };
    }),
  
  /**
   * Update user role (admin only)
   */
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(['user', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Prevent admin from changing their own role
      if (user.id === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '不能修改自己的权限',
        });
      }
      
      const now = Math.floor(Date.now() / 1000);
      
      await db
        .update(schema.users)
        .set({
          role: input.role,
          updatedAt: now,
        })
        .where(eq(schema.users.id, input.userId));
      
      return { success: true };
    }),
  
  /**
   * Delete user (admin only)
   */
  deleteUser: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      
      // Prevent admin from deleting themselves
      if (user.id === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '不能删除自己的账户',
        });
      }
      
      // Delete user (cascade will handle related records if configured)
      await db
        .delete(schema.users)
        .where(eq(schema.users.id, input.userId));
      
      return { success: true };
    }),
  
  /**
   * Reset user password (admin only)
   */
  resetUserPassword: adminProcedure
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(6, '密码至少6位'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      
      // Generate new password hash
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(input.newPassword, salt);
      
      const now = Math.floor(Date.now() / 1000);
      
      await db
        .update(schema.users)
        .set({
          passwordHash: newHash,
          updatedAt: now,
        })
        .where(eq(schema.users.id, input.userId));
      
      return { success: true };
    }),
  
  /**
   * Get system statistics (admin only)
   */
  getSystemStats: adminProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    
    // Get user counts
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users);
    
    const [demoUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.isDemo, 1));
    
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.role, 'admin'));
    
    // Get assessment count
    const [assessmentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.assessmentSessions);
    
    // Get scenario count
    const [scenarioCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.scenarios);
    
    // Get learning path count
    const [learningPathCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.learningPaths);
    
    return {
      users: {
        total: userCount?.count || 0,
        demo: demoUserCount?.count || 0,
        admin: adminCount?.count || 0,
        regular: (userCount?.count || 0) - (demoUserCount?.count || 0),
      },
      activities: {
        assessments: assessmentCount?.count || 0,
        scenarios: scenarioCount?.count || 0,
        learningPaths: learningPathCount?.count || 0,
      },
    };
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
  scenarios: scenariosRouter,
  learning: learningRouter,
  achievements: achievementsRouter,
  admin: adminRouter,
  // TODO: Add more routers as needed:
  // wiki: wikiRouter,
  // feedback: feedbackRouter,
});

/**
 * Export router type for client
 */
export type AppRouter = typeof appRouter;
