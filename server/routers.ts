import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { z } from "zod";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as demoAccountsDb from "./demo-accounts-db";
import * as demoAnalyticsDb from "./demo-analytics-db";
import * as wikiDb from "./db/wiki";
import { getDb } from "./db";
import { calculateWeightedScore, determineLevel } from "./scoreCalculation";
import { feedbacks, assessmentSessions, userAnswers, industries, positions, industryCompetencies, positionCompetencies, changelogs, users } from "../drizzle/schema";
import bcrypt from "bcryptjs";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // 本地用户名密码登录
    localLogin: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        
        // 查找用户
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.username, input.username))
          .limit(1);
        
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '用户名或密码错误',
          });
        }
        
        // 验证密码
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '用户名或密码错误',
          });
        }
        
        // 更新最后登录时间
        await database
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, user.id));
        
        // 创建session - 使用openId（本地用户在数据库中已设置openId）
        if (!user.openId) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '用户数据错误：缺少openId',
          });
        }
        
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.username || '',
        });
        
        // 设置cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    // 修改密码
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6, '新密码至少6位'),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        
        // 获取当前用户
        const [user] = await database
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);
        
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '当前用户不支持密码登录',
          });
        }
        
        // 验证当前密码
        const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '当前密码错误',
          });
        }
        
        // 生成新密码哈希
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(input.newPassword, salt);
        
        // 更新密码
        await database
          .update(users)
          .set({ 
            passwordHash: newHash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));
        
        return {
          success: true,
          message: '密码修改成功',
        };
      }),
    // 用户注册
    register: publicProcedure
      .input(z.object({
        username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位').regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
        password: z.string().min(6, '密码至少6位'),
        email: z.string().email('请输入有效的邮箱地址').optional(),
        name: z.string().min(1, '请输入姓名').optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        
        // 检查用户名是否已存在
        const [existingUser] = await database
          .select()
          .from(users)
          .where(eq(users.username, input.username))
          .limit(1);
        
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '用户名已存在，请选择其他用户名',
          });
        }
        
        // 如果提供了邮箱，检查邮箱是否已存在
        if (input.email) {
          const [existingEmail] = await database
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);
          
          if (existingEmail) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: '该邮箱已被注册',
            });
          }
        }
        
        // 生成密码哈希
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(input.password, salt);
        
        // 生成openId（本地用户使用 local_ 前缀）
        const openId = `local_${input.username}`;
        
        // 创建用户
        const [newUser] = await database
          .insert(users)
          .values({
            username: input.username,
            passwordHash,
            openId,
            name: input.name || input.username,
            email: input.email,
            loginMethod: 'local',
            role: 'user', // 默认角色为普通用户
          })
          .$returningId();
        
        // 创建session
        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name || input.username,
        });
        
        // 设置cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        
        return {
          success: true,
          message: '注册成功',
          user: {
            id: newUser.id,
            username: input.username,
            name: input.name || input.username,
            email: input.email,
            role: 'user',
          },
        };
      }),
  }),

  // ==================== Scenarios (问题/场景) ====================
  scenarios: router({
    // 提交新的管理问题
    submit: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 获取用户画像
        const userProfile = await db.getUserProfile(ctx.user.id);
        
        // 获取所有能力作为上下文
        const allCompetencies = await db.getAllCompetencies();
        const competenciesContext = allCompetencies.map(c => 
          `- ${c.name} (${c.category}): ${c.description}`
        ).join('\n');

        // 构建用户背景信息
        const userContext = userProfile ? `
**用户背景**：
- 行业：${userProfile.industry || '未知'}
- 公司规模：${userProfile.companySize === 'startup' ? '初创(<50人)' : userProfile.companySize === 'small' ? '小型(50-200人)' : userProfile.companySize === 'medium' ? '中型(200-1000人)' : '大型(1000+人)'}
- 当前岗位：${userProfile.currentRole || '未知'}
- 管理级别：${userProfile.managementLevel === 'executive' ? '高管(CEO/CXO/VP)' : userProfile.managementLevel === 'senior' ? '高级管理者(总监/高级经理)' : userProfile.managementLevel === 'middle' ? '中层管理者(经理/主管)' : '基层管理者(组长/Team Lead)'}
- 管理年限：${userProfile.yearsOfManagement || 0}年
- 直接下属：${userProfile.directReports || 0}人` : '';

        // 使用AI分析问题
        const analysisPrompt = `作为一位经验丰富的管理顾问，请分析以下管理问题：

**问题标题**：${input.title}
**详细描述**：${input.description}
**公司阶段**：${input.companyStage || '未知'}${userContext}

**可用的管理能力清单**：
${competenciesContext}

请按照以下结构提供分析（请结合用户的行业特点、管理级别和公司阶段提供针对性建议）：

1. **问题诊断**：
   - 问题的表现和影响
   - 根本原因分析（从系统、流程、人员、文化等角度）
   - 结合用户所在行业和管理级别的特殊挑战

2. **解决建议**：
   - 短期行动（立即可执行，1-2周）
   - 中期优化（1-3个月）
   - 长期建设（系统化解决方案）
   - 风险提示和注意事项

3. **所需管理能力**：
   - 从上述能力清单中选择3-5个最相关的能力
   - 每个能力必须从清单中精确匹配名称
   - 说明为什么这个能力对解决问题至关重要
   - 重要程度评分（1-5，5为最重要）

请以JSON格式返回：
{
  "analysis": "问题诊断内容（使用Markdown格式，包含标题和分点）",
  "suggestions": "解决建议内容（使用Markdown格式，分短中长期）",
  "competencies": [
    {
      "name": "能力名称（必须与清单中完全一致）",
      "importance": 5,
      "category": "所属模块",
      "reason": "为什么这个能力重要"
    }
  ]
}`;

        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位经验丰富的管理顾问，擅长分析管理问题并提供实用建议。" },
            { role: "user", content: analysisPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "management_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  analysis: { type: "string" },
                  suggestions: { type: "string" },
                  competencies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        importance: { type: "number" },
                        category: { type: "string" },
                        reason: { type: "string" }
                      },
                      required: ["name", "importance", "category", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["analysis", "suggestions", "competencies"],
                additionalProperties: false
              }
            }
          }
        });

        const content = aiResponse.choices[0].message.content;
        const aiResult = JSON.parse(typeof content === 'string' ? content : "{}");

        // 保存场景记录
        await db.createScenario({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          aiAnalysis: aiResult.analysis,
          aiSuggestions: aiResult.suggestions,
          identifiedCompetencies: JSON.stringify(aiResult.competencies),
          companyStage: input.companyStage || "seed",
        });

        return aiResult;
      }),

    // 获取用户的所有场景
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserScenarios(ctx.user.id);
    }),

    // 获取单个场景详情
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getScenarioById(input.id);
      }),
  }),

  // ==================== Competencies (管理能力) ====================
  competencies: router({
    // 获取所有能力
    list: protectedProcedure.query(async () => {
      return await db.getAllCompetencies();
    }),

    // 根据用户画像推荐专项能力（三层模型：通用+行业+岗位）
    getRecommended: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];

      const userProfile = await db.getUserProfile(ctx.user.id);
      if (!userProfile) {
        return [];
      }

      const allCompetencies = await db.getAllCompetencies();
      const userCompetencies = await db.getUserCompetencies(ctx.user.id);
      
      // 创建用户能力分数映射
      const userScoreMap = new Map<number, number>();
      userCompetencies.forEach(uc => {
        userScoreMap.set(uc.competencyId, uc.finalScore);
      });

      const recommendations: Array<{
        competency: any;
        reason: string;
        priority: number;
        source: 'universal' | 'industry' | 'position' | 'gap';
        currentScore?: number;
        targetScore?: number;
        gap?: number;
      }> = [];

      // === 第一层：通用能力（所有创业者必备）===
      const coreCompetencies = allCompetencies.filter(c => c.isCore);
      coreCompetencies.forEach(comp => {
        const currentScore = userScoreMap.get(comp.id) || 0;
        const gap = 80 - currentScore; // 通用能力目标80分
        
        if (gap > 20) { // 只推荐差距大于20分的
          recommendations.push({
            competency: comp,
            reason: `通用核心能力，所有创业者必备，当前得分${currentScore}，建议提升至80分`,
            priority: 10 - Math.floor(gap / 10), // 差距越大优先级越高
            source: 'universal',
            currentScore,
            targetScore: 80,
            gap
          });
        }
      });

      // === 第二层：行业特定能力 ===
      if (userProfile.industry) {
        // 查找行业ID
        const [industryRecord] = await database
          .select()
          .from(industries)
          .where(eq(industries.name, userProfile.industry))
          .limit(1);

        if (industryRecord) {
          // 获取该行业的关键能力
          const industryCompetencyRelations = await database
            .select()
            .from(industryCompetencies)
            .where(eq(industryCompetencies.industryId, industryRecord.id));

          for (const rel of industryCompetencyRelations) {
            const comp = allCompetencies.find(c => c.id === rel.competencyId);
            if (!comp) continue;

            const currentScore = userScoreMap.get(comp.id) || 0;
            const targetScore = rel.importance * 20; // importance 1-5 对应 20-100分
            const gap = targetScore - currentScore;

            if (gap > 15 && !recommendations.find(r => r.competency.id === comp.id)) {
              recommendations.push({
                competency: comp,
                reason: `${userProfile.industry}行业关键能力（重要性${rel.importance}/5）：${rel.description}`,
                priority: 8 + rel.importance, // 7-13之间
                source: 'industry',
                currentScore,
                targetScore,
                gap
              });
            }
          }
        }
      }

      // === 第三层：岗位特定能力 ===
      if (userProfile.currentRole) {
        // 查找匹配的岗位
        const [positionRecord] = await database
          .select()
          .from(positions)
          .where(eq(positions.name, userProfile.currentRole))
          .limit(1);

        if (positionRecord) {
          // 获取该岗位的关键能力
          const positionCompetencyRelations = await database
            .select()
            .from(positionCompetencies)
            .where(eq(positionCompetencies.positionId, positionRecord.id));

          for (const rel of positionCompetencyRelations) {
            const comp = allCompetencies.find(c => c.id === rel.competencyId);
            if (!comp) continue;

            const currentScore = userScoreMap.get(comp.id) || 0;
            const targetScore = rel.requiredLevel * 20; // requiredLevel 1-5 对应 20-100分
            const gap = targetScore - currentScore;

            if (gap > 15) {
              // 如果已经在推荐列表中（来自行业或通用），提高优先级
              const existing = recommendations.find(r => r.competency.id === comp.id);
              if (existing) {
                existing.priority += 3; // 提高优先级
                existing.reason += ` | 同时是${userProfile.currentRole}岗位核心能力（要求等级${rel.requiredLevel}/5）`;
              } else {
                recommendations.push({
                  competency: comp,
                  reason: `${userProfile.currentRole}岗位核心能力（要求等级${rel.requiredLevel}/5，重要性${rel.importance}/5）：${rel.description}`,
                  priority: 6 + rel.importance, // 7-11之间
                  source: 'position',
                  currentScore,
                  targetScore,
                  gap
                });
              }
            }
          }
        }
      }

      // === 第四层：短板能力（得分<60）===
      const gapCompetencies = userCompetencies.filter(uc => uc.finalScore < 60);
      gapCompetencies.forEach(uc => {
        const comp = allCompetencies.find(c => c.id === uc.competencyId);
        if (!comp) return;

        const existing = recommendations.find(r => r.competency.id === comp.id);
        if (existing) {
          existing.priority += 5; // 短板额外提高优先级
          existing.reason = `【能力短板】${existing.reason}`;
        } else {
          recommendations.push({
            competency: comp,
            reason: `能力短板（当前${uc.finalScore}分<60分），急需提升`,
            priority: 15, // 最高优先级
            source: 'gap',
            currentScore: uc.finalScore,
            targetScore: 70,
            gap: 70 - uc.finalScore
          });
        }
      });

      // 按优先级排序，去重，返回前10个
      const uniqueRecommendations = recommendations
        .reduce((acc, curr) => {
          const existing = acc.find(r => r.competency.id === curr.competency.id);
          if (!existing) {
            acc.push(curr);
          }
          return acc;
        }, [] as typeof recommendations)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 10);

      return uniqueRecommendations;
    }),

    // AI生成能力提升建议
    getAIRecommendations: protectedProcedure.query(async ({ ctx }) => {
      const userProfile = await db.getUserProfile(ctx.user.id);
      const userCompetencies = await db.getUserCompetencies(ctx.user.id);
      const allCompetencies = await db.getAllCompetencies();
      
      if (!userProfile) {
        return { recommendations: [], learningPath: "" };
      }
      
      // 计算8个维度的平均得分
      const categoryScores: Record<string, { total: number, count: number }> = {};
      userCompetencies.forEach(uc => {
        const comp = allCompetencies.find(c => c.id === uc.competencyId);
        if (comp) {
          if (!categoryScores[comp.category]) {
            categoryScores[comp.category] = { total: 0, count: 0 };
          }
          categoryScores[comp.category].total += uc.score;
          categoryScores[comp.category].count += 1;
        }
      });
      
      const categoryScoresArray = Object.entries(categoryScores).map(([category, data]) => ({
        category,
        avgScore: Math.round(data.total / data.count)
      })).sort((a, b) => a.avgScore - b.avgScore);
      
      // 找出最弱的维度
      const weakestCategories = categoryScoresArray.slice(0, 3);
      
      // 找出得分低于60分的能力
      const weakCompetencies = userCompetencies.filter(uc => uc.score < 60);
      
      // 构建上下文
      const context = `
**用户背景**：
- 行业：${userProfile.industry || '未知'}
- 公司规模：${userProfile.companySize === 'startup' ? '初创(<50人)' : userProfile.companySize === 'small' ? '小型(50-200人)' : userProfile.companySize === 'medium' ? '中型(200-1000人)' : '大型(1000+人)'}
- 当前岗位：${userProfile.currentRole || '未知'}
- 管理级别：${userProfile.managementLevel === 'executive' ? '高管' : userProfile.managementLevel === 'senior' ? '高级管理者' : userProfile.managementLevel === 'middle' ? '中层管理者' : '基层管理者'}
- 管理年限：${userProfile.yearsOfManagement || 0}年
- 企业发展阶段：${userProfile.companyStage}

**能力现状**：
${categoryScoresArray.map(c => `- ${c.category}：${c.avgScore}分`).join('\n')}

**最弱维度**：${weakestCategories.map(c => c.category).join('、')}

**短板能力数量**：${weakCompetencies.length}个能力得分低于60分
`;
      
      // 调用AI生成建议
      const prompt = `你是一位资深的管理顾问和教练。请根据以下用户信息，生成个性化的能力提升建议和学习路径。

${context}

请提供：
1. **核心建议**：3-5条针对性的能力提升建议，每条包括：
   - 能力名称
   - 为什么这个能力对用户重要
   - 具体的提升方法（实践项目、学习资源、行动计划）

2. **3个月学习路径**：分为三个阶段，每个阶段包括：
   - 阶段目标
   - 重点能力
   - 实践任务
   - 预期成果

请使用Markdown格式输出，语言简洁专业，具有可操作性。`;
      
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "你是一位资深的管理顾问和教练，擅长帮助管理者提升能力。" },
          { role: "user", content: prompt }
        ],
      });
      
      const aiRecommendations = response.choices[0]?.message?.content || "暂无建议";
      
      return {
        recommendations: aiRecommendations,
        weakestCategories: weakestCategories.map(c => c.category),
        weakCompetenciesCount: weakCompetencies.length,
      };
    }),

    // 获取单个能力详情
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCompetencyById(input.id);
      }),

    // 获取用户的单个能力进度
    getUserCompetency: protectedProcedure
      .input(z.object({ competencyId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserCompetency(ctx.user.id, input.competencyId);
      }),

    // 获取能力的学习资源
    getResources: protectedProcedure
      .input(z.object({ competencyId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCompetencyResources(input.competencyId);
      }),

    // 生成AI能力提升建议
    getImprovementSuggestions: protectedProcedure.query(async ({ ctx }) => {
      const userComps = await db.getUserCompetencies(ctx.user.id);
      const allComps = await db.getAllCompetencies();
      
      // 计算每个能力的加权得分
      const competencyScores = userComps.map(uc => {
        const comp = allComps.find(c => c.id === uc.competencyId);
        const { finalScore } = calculateWeightedScore({
          questionnaireScore: uc.questionnaireScore || 0,
          aiAssessed: uc.aiAssessed || 0,
          selfAssessed: uc.selfAssessed || 0,
        });
        
        return {
          competency: comp,
          finalScore,
          questionnaireScore: uc.questionnaireScore || 0,
          aiAssessed: uc.aiAssessed || 0,
          selfAssessed: uc.selfAssessed || 0,
        };
      });
      
      // 识别短板（得分<60的能力）
      const weaknesses = competencyScores
        .filter(cs => cs.finalScore < 60)
        .sort((a, b) => a.finalScore - b.finalScore)
        .slice(0, 5);
      
      // 识别自评偏差（自评与客观评分差异>1级）
      const biases = competencyScores
        .filter(cs => {
          const objectiveScore = (cs.questionnaireScore * 0.6 + cs.aiAssessed * 0.4);
          return Math.abs(cs.selfAssessed - objectiveScore) > 1;
        })
        .map(cs => ({
          ...cs,
          bias: cs.selfAssessed - (cs.questionnaireScore * 0.6 + cs.aiAssessed * 0.4),
        }));
      
      // 生成AI建议
      const prompt = `作为一名管理能力提升顾问，请基于以下数据生成个性化的能力提升建议：

**能力短板：**
${weaknesses.map(w => `- ${w.competency?.name}：综合得分${w.finalScore}分（问卷${w.questionnaireScore}/5、AI分析${w.aiAssessed}/5、自评${w.selfAssessed}/5）`).join('\n')}

**自评偏差：**
${biases.slice(0, 3).map(b => `- ${b.competency?.name}：${b.bias > 0 ? '自评过高' : '自评过低'}（偏差${Math.abs(b.bias).toFixed(1)}级）`).join('\n')}

请提供：
1. **短板分析**：简要分析为什么这些能力是短板，对管理者的影响
2. **学习路径**：按优先级排序，建议先提升哪些能力
3. **行动计划**：针对每个短板能力，提供3-5条具体的实践建议

请用Markdown格式返回，简洁易读。`;
      
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: '你是一名专业的管理能力提升顾问，擅长基于数据分析提供个性化的学习建议。' },
          { role: 'user', content: prompt },
        ],
      });
      
      const suggestions = response.choices[0].message.content;
      
      return {
        weaknesses: weaknesses.map(w => ({
          name: w.competency?.name,
          category: w.competency?.category,
          finalScore: w.finalScore,
          questionnaireScore: w.questionnaireScore,
          aiAssessed: w.aiAssessed,
          selfAssessed: w.selfAssessed,
        })),
        biases: biases.slice(0, 3).map(b => ({
          name: b.competency?.name,
          bias: b.bias,
        })),
        aiSuggestions: suggestions,
      };
    }),

    // 获取用户的能力进度
    myProgress: protectedProcedure.query(async ({ ctx }) => {
      const userComps = await db.getUserCompetencies(ctx.user.id);
      const allComps = await db.getAllCompetencies();
      
      // 合并能力信息和用户进度
      return allComps.map(comp => {
        const userComp = userComps.find(uc => uc.competencyId === comp.id);
        return {
          ...comp,
          userProgress: userComp || {
            currentLevel: 0,
            selfAssessed: 0,
            aiAssessed: 0,
            practiceCount: 0,
            status: "not_started" as const
          }
        };
      });
    }),

    // 更新能力进度
    updateProgress: protectedProcedure
      .input(z.object({
        competencyId: z.number(),
        selfAssessed: z.number().optional(),
        status: z.enum(["not_started", "learning", "mastered"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getUserCompetency(ctx.user.id, input.competencyId);
        
        await db.upsertUserCompetency({
          userId: ctx.user.id,
          competencyId: input.competencyId,
          selfAssessed: input.selfAssessed ?? existing?.selfAssessed ?? 0,
          currentLevel: existing?.currentLevel ?? 0,
          aiAssessed: existing?.aiAssessed ?? 0,
          practiceCount: existing?.practiceCount ?? 0,
          status: input.status ?? existing?.status ?? "not_started",
        });

        // 自动更新企业能力评分
        await db.autoUpdateOrganizationCapability(ctx.user.id);

        return { success: true };
      }),
    
    // 获取能力对比数据（用户 vs 行业平均）
    getIndustryComparison: protectedProcedure.query(async ({ ctx }) => {
      const userProfile = await db.getUserProfile(ctx.user.id);
      const userComps = await db.getUserCompetencies(ctx.user.id);
      const allComps = await db.getAllCompetencies();
      
      // 按维度计算用户平均分数
      const categoryScores: Record<string, { total: number, count: number }> = {};
      userComps.forEach(uc => {
        const comp = allComps.find(c => c.id === uc.competencyId);
        if (comp) {
          if (!categoryScores[comp.category]) {
            categoryScores[comp.category] = { total: 0, count: 0 };
          }
          categoryScores[comp.category].total += uc.score;
          categoryScores[comp.category].count += 1;
        }
      });
      
      const userScores = Object.entries(categoryScores).map(([category, data]) => ({
        category,
        score: Math.round(data.total / data.count) || 0
      }));
      
      // 模拟行业平均数据（基于行业和职位）
      // 在实际场景中，这里应该从数据库统计真实用户数据
      const industryAverages: Record<string, number> = {
        "战略规划": 65,
        "创新变革": 62,
        "决策思维": 68,
        "业务执行": 70,
        "沟通协作": 72,
        "自我管理": 66,
        "团队管理": 64,
        "人才发展": 60,
      };
      
      // 根据行业调整基准值
      if (userProfile?.industry) {
        if (userProfile.industry.includes("互联网") || userProfile.industry.includes("科技")) {
          industryAverages["创新变革"] += 5;
          industryAverages["决策思维"] += 3;
        }
        if (userProfile.industry.includes("制造") || userProfile.industry.includes("生产")) {
          industryAverages["业务执行"] += 5;
          industryAverages["团队管理"] += 3;
        }
        if (userProfile.industry.includes("金融") || userProfile.industry.includes("咨询")) {
          industryAverages["战略规划"] += 5;
          industryAverages["决策思维"] += 5;
        }
      }
      
      // 根据职位调整基准值
      if (userProfile?.currentRole) {
        if (userProfile.currentRole.includes("CEO") || userProfile.currentRole.includes("总裁")) {
          industryAverages["战略规划"] += 8;
          industryAverages["决策思维"] += 8;
        }
        if (userProfile.currentRole.includes("CTO") || userProfile.currentRole.includes("技术")) {
          industryAverages["创新变革"] += 8;
          industryAverages["业务执行"] += 5;
        }
        if (userProfile.currentRole.includes("COO") || userProfile.currentRole.includes("运营")) {
          industryAverages["业务执行"] += 8;
          industryAverages["团队管理"] += 5;
        }
      }
      
      const industryScores = Object.entries(industryAverages).map(([category, score]) => ({
        category,
        score
      }));
      
      // 计算差距分析
      const gaps = userScores.map(userScore => {
        const industryScore = industryScores.find(is => is.category === userScore.category);
        const gap = userScore.score - (industryScore?.score || 0);
        return {
          category: userScore.category,
          userScore: userScore.score,
          industryScore: industryScore?.score || 0,
          gap,
          status: gap >= 10 ? "leading" : gap >= 0 ? "average" : gap >= -10 ? "below" : "weak"
        };
      });
      
      return {
        userScores,
        industryScores,
        gaps,
        industry: userProfile?.industry || "未设置",
        role: userProfile?.currentRole || "未设置",
      };
    }),

    // 增强的差距分析（基于三层模型）
    getGapAnalysis: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return null;

      const userProfile = await db.getUserProfile(ctx.user.id);
      if (!userProfile) {
        return null;
      }

      const allCompetencies = await db.getAllCompetencies();
      const userCompetencies = await db.getUserCompetencies(ctx.user.id);
      const domains = await db.getAllDomains();

      // 用户能力分数映射
      const userScoreMap = new Map<number, number>();
      userCompetencies.forEach(uc => {
        userScoreMap.set(uc.competencyId, uc.finalScore);
      });

      interface GapItem {
        competency: any;
        currentScore: number;
        targetScore: number;
        gap: number;
        priority: number;
        reason: string;
        source: 'universal' | 'industry' | 'position';
        domain: string;
      }

      const gaps: GapItem[] = [];

      // === 1. 通用能力差距 ===
      const coreCompetencies = allCompetencies.filter(c => c.isCore);
      coreCompetencies.forEach(comp => {
        const currentScore = userScoreMap.get(comp.id) || 0;
        const targetScore = 80; // 通用能力目标
        const gap = targetScore - currentScore;

        if (gap > 0) {
          const domain = domains.find(d => d.id === comp.domainId);
          gaps.push({
            competency: comp,
            currentScore,
            targetScore,
            gap,
            priority: gap > 30 ? 10 : gap > 20 ? 8 : 6,
            reason: '通用核心能力，所有创业者必备',
            source: 'universal',
            domain: domain?.name || '未知域'
          });
        }
      });

      // === 2. 行业能力差距 ===
      if (userProfile.industry) {
        const [industryRecord] = await database
          .select()
          .from(industries)
          .where(eq(industries.name, userProfile.industry))
          .limit(1);

        if (industryRecord) {
          const industryCompetencyRelations = await database
            .select()
            .from(industryCompetencies)
            .where(eq(industryCompetencies.industryId, industryRecord.id));

          for (const rel of industryCompetencyRelations) {
            const comp = allCompetencies.find(c => c.id === rel.competencyId);
            if (!comp) continue;

            const currentScore = userScoreMap.get(comp.id) || 0;
            const targetScore = rel.importance * 20;
            const gap = targetScore - currentScore;

            if (gap > 0) {
              const existing = gaps.find(g => g.competency.id === comp.id);
              const domain = domains.find(d => d.id === comp.domainId);

              if (existing) {
                // 更新目标分数为更高值
                if (targetScore > existing.targetScore) {
                  existing.targetScore = targetScore;
                  existing.gap = targetScore - currentScore;
                }
                existing.priority += rel.importance;
                existing.reason += ` | ${userProfile.industry}行业关键能力`;
              } else {
                gaps.push({
                  competency: comp,
                  currentScore,
                  targetScore,
                  gap,
                  priority: 7 + rel.importance,
                  reason: `${userProfile.industry}行业关键能力（重要性${rel.importance}/5）`,
                  source: 'industry',
                  domain: domain?.name || '未知域'
                });
              }
            }
          }
        }
      }

      // === 3. 岗位能力差距 ===
      if (userProfile.currentRole) {
        const [positionRecord] = await database
          .select()
          .from(positions)
          .where(eq(positions.name, userProfile.currentRole))
          .limit(1);

        if (positionRecord) {
          const positionCompetencyRelations = await database
            .select()
            .from(positionCompetencies)
            .where(eq(positionCompetencies.positionId, positionRecord.id));

          for (const rel of positionCompetencyRelations) {
            const comp = allCompetencies.find(c => c.id === rel.competencyId);
            if (!comp) continue;

            const currentScore = userScoreMap.get(comp.id) || 0;
            const targetScore = rel.requiredLevel * 20;
            const gap = targetScore - currentScore;

            if (gap > 0) {
              const existing = gaps.find(g => g.competency.id === comp.id);
              const domain = domains.find(d => d.id === comp.domainId);

              if (existing) {
                if (targetScore > existing.targetScore) {
                  existing.targetScore = targetScore;
                  existing.gap = targetScore - currentScore;
                }
                existing.priority += rel.importance + 2;
                existing.reason += ` | ${userProfile.currentRole}岗位核心能力`;
              } else {
                gaps.push({
                  competency: comp,
                  currentScore,
                  targetScore,
                  gap,
                  priority: 6 + rel.importance,
                  reason: `${userProfile.currentRole}岗位核心能力（要求等级${rel.requiredLevel}/5）`,
                  source: 'position',
                  domain: domain?.name || '未知域'
                });
              }
            }
          }
        }
      }

      // 按优先级和差距排序
      gaps.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return b.gap - a.gap;
      });

      // 计算按域分组的统计
      const domainStats = domains.map(domain => {
        const domainGaps = gaps.filter(g => g.domain === domain.name);
        const avgGap = domainGaps.length > 0
          ? domainGaps.reduce((sum, g) => sum + g.gap, 0) / domainGaps.length
          : 0;
        const totalGap = domainGaps.reduce((sum, g) => sum + g.gap, 0);

        return {
          domain: domain.name,
          gapCount: domainGaps.length,
          avgGap: Math.round(avgGap),
          totalGap: Math.round(totalGap),
          priority: totalGap > 200 ? 'high' : totalGap > 100 ? 'medium' : 'low'
        };
      }).filter(s => s.gapCount > 0)
        .sort((a, b) => b.totalGap - a.totalGap);

      // 计算总体统计
      const totalGaps = gaps.length;
      const criticalGaps = gaps.filter(g => g.gap > 30).length;
      const avgGap = gaps.length > 0
        ? gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length
        : 0;

      return {
        gaps: gaps.slice(0, 20), // 返回前20个差距最大的
        domainStats,
        summary: {
          totalGaps,
          criticalGaps, // 差距>30分
          avgGap: Math.round(avgGap),
          universalGaps: gaps.filter(g => g.source === 'universal').length,
          industryGaps: gaps.filter(g => g.source === 'industry').length,
          positionGaps: gaps.filter(g => g.source === 'position').length,
        },
        profile: {
          industry: userProfile.industry,
          role: userProfile.currentRole,
          companyStage: userProfile.companyStage,
        }
      };
    }),
  }),

  // ==================== Assessments (能力评估) ====================
  assessments: router({
    // 提交评估证据
    submit: protectedProcedure
      .input(z.object({
        competencyId: z.number(),
        scenarioId: z.number().optional(),
        evidenceType: z.enum(["meeting_notes", "audio", "self_report", "ai_analysis"]),
        evidenceContent: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 使用AI评估能力掌握程度
        const competency = await db.getCompetencyById(input.competencyId);
        if (!competency) throw new Error("Competency not found");

        const evalPrompt = `评估以下证据材料，判断用户在"${competency.name}"这项管理能力上的掌握程度。

能力描述：${competency.description}
L1标准：${competency.level1Criteria}
L2标准：${competency.level2Criteria}
L3标准：${competency.level3Criteria}

证据材料：
${input.evidenceContent}

请评估用户当前达到的级别（0=未掌握, 1=L1基础, 2=L2熟练, 3=L3精通），并给出评估理由。

返回JSON格式：
{
  "assessedLevel": 1,
  "reasoning": "评估理由"
}`;

        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位专业的管理能力评估专家。" },
            { role: "user", content: evalPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "competency_assessment",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  assessedLevel: { type: "number" },
                  reasoning: { type: "string" }
                },
                required: ["assessedLevel", "reasoning"],
                additionalProperties: false
              }
            }
          }
        });

        const content2 = aiResponse.choices[0].message.content;
        const evalResult = JSON.parse(typeof content2 === 'string' ? content2 : "{}");

        // 保存评估记录
        await db.createAssessment({
          userId: ctx.user.id,
          competencyId: input.competencyId,
          scenarioId: input.scenarioId,
          evidenceType: input.evidenceType,
          evidenceContent: input.evidenceContent,
          aiEvaluation: evalResult.reasoning,
          assessedLevel: evalResult.assessedLevel,
        });

        // 更新用户能力进度
        const existing = await db.getUserCompetency(ctx.user.id, input.competencyId);
        await db.upsertUserCompetency({
          userId: ctx.user.id,
          competencyId: input.competencyId,
          currentLevel: Math.max(existing?.currentLevel || 0, evalResult.assessedLevel),
          selfAssessed: existing?.selfAssessed || 0,
          aiAssessed: evalResult.assessedLevel,
          practiceCount: (existing?.practiceCount || 0) + 1,
          lastPracticed: new Date(),
          status: evalResult.assessedLevel >= 3 ? "mastered" : evalResult.assessedLevel >= 1 ? "learning" : "not_started",
        });

        // 自动更新企业能力评分
        await db.autoUpdateOrganizationCapability(ctx.user.id);

        return evalResult;
      }),

    // 上传证据文件（文档或音频）
    uploadEvidence: protectedProcedure
      .input(z.object({
        competencyId: z.number(),
        fileContent: z.string(), // base64 encoded file content
        fileName: z.string(),
        fileType: z.enum(["document", "audio"]),
      }))
      .mutation(async ({ ctx, input }) => {
        let evidenceText = "";
        
        if (input.fileType === "audio") {
          // 对于音频文件，使用语音转文字
          const { transcribeAudio } = await import("./_core/voiceTranscription");
          const { storagePut } = await import("./storage");
          
          // 先上传音频文件到S3
          const buffer = Buffer.from(input.fileContent, 'base64');
          const fileKey = `evidence/${ctx.user.id}/${Date.now()}-${input.fileName}`;
          const { url: audioUrl } = await storagePut(fileKey, buffer, "audio/mpeg");
          
          // 转录音频
          const transcription = await transcribeAudio({ audioUrl });
          if ('text' in transcription) {
            evidenceText = transcription.text;
          } else {
            throw new Error("语音转文字失败：" + transcription.error);
          }
        } else {
          // 对于文档，直接使用文本内容
          evidenceText = Buffer.from(input.fileContent, 'base64').toString('utf-8');
        }
        
        // 调用评估API
        const competency = await db.getCompetencyById(input.competencyId);
        if (!competency) throw new Error("Competency not found");

        const evalPrompt = `评估以下证据材料，判断用户在“${competency.name}”这项管理能力上的掌握程度。

能力描述：${competency.description}
L1标准：${competency.level1Criteria}
L2标准：${competency.level2Criteria}
L3标准：${competency.level3Criteria}

证据材料：
${evidenceText}

请评估用户当前达到的级别（0=未掌握, 1=L1基础, 2=L2熟练, 3=L3精通），并给出评估理由。

返回JSON格式：
{
  "assessedLevel": 1,
  "reasoning": "评估理由"
}`;

        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位专业的管理能力评估专家。" },
            { role: "user", content: evalPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "competency_assessment",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  assessedLevel: { type: "number" },
                  reasoning: { type: "string" }
                },
                required: ["assessedLevel", "reasoning"],
                additionalProperties: false
              }
            }
          }
        });

        const content = aiResponse.choices[0].message.content;
        const evalResult = JSON.parse(typeof content === 'string' ? content : "{}");

        // 保存评估记录
        await db.createAssessment({
          userId: ctx.user.id,
          competencyId: input.competencyId,
          evidenceType: input.fileType === "audio" ? "audio" : "meeting_notes",
          evidenceContent: evidenceText,
          aiEvaluation: evalResult.reasoning,
          assessedLevel: evalResult.assessedLevel,
        });

        // 更新用户能力进度
        const existing = await db.getUserCompetency(ctx.user.id, input.competencyId);
        await db.upsertUserCompetency({
          userId: ctx.user.id,
          competencyId: input.competencyId,
          currentLevel: Math.max(existing?.currentLevel || 0, evalResult.assessedLevel),
          selfAssessed: existing?.selfAssessed || 0,
          aiAssessed: evalResult.assessedLevel,
          practiceCount: (existing?.practiceCount || 0) + 1,
          lastPracticed: new Date(),
          status: evalResult.assessedLevel >= 3 ? "mastered" : evalResult.assessedLevel >= 1 ? "learning" : "not_started",
        });

        return {
          ...evalResult,
          evidenceText // 返回转录文本供用户查看
        };
      }),

    // 获取用户的评估历史
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAssessments(ctx.user.id);
    }),
  }),

  // ==================== Resources (学习资源) ====================
  resources: router({
    // 获取某个能力的学习资源
    list: protectedProcedure
      .input(z.object({ competencyId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCompetencyResources(input.competencyId);
      }),
  }),

  // ==================== Profile (用户画像) ====================
  profile: router({
    // 获取当前用户画像
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      return profile ?? null;
    }),

    // 获取信息完善度
    getCompletion: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      
      if (!profile) {
        return {
          completionRate: 0,
          missingFields: ["行业类型", "公司规模", "发展阶段", "当前岗位", "管理级别", "直接下属人数", "管理层级", "管理年限"]
        };
      }

      const fields = [
        { key: 'industry', label: '行业类型' },
        { key: 'companySize', label: '公司规模' },
        { key: 'companyStage', label: '发展阶段' },
        { key: 'currentRole', label: '当前岗位' },
        { key: 'managementLevel', label: '管理级别' },
        { key: 'directReports', label: '直接下属人数' },
        { key: 'managementLayers', label: '管理层级' },
        { key: 'yearsOfManagement', label: '管理年限' },
      ];

      const missingFields: string[] = [];
      let filledCount = 0;

      for (const field of fields) {
        const value = profile[field.key as keyof typeof profile];
        // For number fields, 0 is a valid value (e.g., 0 direct reports, 0 layers)
        // Only check for null, undefined, or empty string
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

    // 创建用户画像
    create: protectedProcedure
      .input(z.object({
        industry: z.string(),
        companySize: z.enum(["startup", "small", "medium", "large"]),
        companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]),
        currentRole: z.string(),
        managementLevel: z.enum(["executive", "senior", "middle", "junior"]),
        directReports: z.number(),
        managementLayers: z.number(),
        yearsOfManagement: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createUserProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // 更新用户画像
    update: protectedProcedure
      .input(z.object({
        industry: z.string().optional(),
        industryId: z.number().optional(), // 新增：关联行业库ID
        companySize: z.enum(["startup", "small", "medium", "large"]).optional(),
        companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]).optional(),
        currentRole: z.string().optional(),
        positionId: z.number().optional(), // 新增：关联职位库ID
        managementLevel: z.enum(["executive", "senior", "middle", "junior"]).optional(),
        directReports: z.number().optional(),
        managementLayers: z.number().optional(),
        yearsOfManagement: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ==================== Analysis (综合分析) ====================
  analysis: router({
    // 分析文档，评估多个能力维度
    analyzeDocument: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 获取用户画像
        const profile = await db.getUserProfile(ctx.user.id);
        const profileInfo = profile ? `\n用户背景：\n- 行业：${profile.industry}\n- 公司规模：${profile.companySize}\n- 公司阶段：${profile.companyStage}\n- 当前岗位：${profile.currentRole}\n- 管理级别：${profile.managementLevel}\n- 管理年限：${profile.yearsOfManagement}年` : '';

        // 获取所有能力
        const allCompetencies = await db.getAllCompetencies();

        // 构建AI分析prompt
        const analysisPrompt = `作为一位资深的管理能力评估专家，请深入分析以下工作资料，精准评估其中体现的管理能力水平。

${profileInfo}

**资料标题**：${input.title}

**资料内容**：
${input.content}

**可评估的管理能力列表（8个维度，35个能力）**：
${allCompetencies.map((c, i) => `${i + 1}. ${c.name} (${c.category}) - ${c.description}`).join('\n')}

**L1-L5分级标准**：
- **L1 (0-20分)**：初步认知，了解基本概念，偶尔在指导下应用
- **L2 (21-40分)**：基础实践，能在常见场景下独立应用，效果一般
- **L3 (41-60分)**：熟练掌握，能在多数场景下有效应用，取得良好效果
- **L4 (61-80分)**：精通专业，能在复杂场景下灵活应用，持续产出优秀成果
- **L5 (81-100分)**：行业专家，能创新方法论，指导他人，产生行业影响力

**评估要求**：
1. **多维度识别**：从资料中识别至少5个、最多10个管理能力，覆盖不同维度
2. **精准评级**：对每个能力给出L1-L5的等级评估和精确的0-100分数，严格遵循分级标准
3. **证据充分**：提供具体的分析依据，必须引用资料中的关键内容作为证据
4. **建议具体**：给出针对性的提升建议，包括具体的行动方向和学习资源
5. **综合评价**：给出全面的综合评价，分析优势和短板，提供总体发展建议

**输出格式**（JSON）：
{
  "competencies": [
    {
      "name": "能力名称（必须从能力列表中选择）",
      "category": "能力类别（8个维度之一）",
      "level": 3,
      "score": 65,
      "evidence": "从资料中可以看出...（必须引用具体内容）",
      "suggestion": "建议...（具体可执行的提升方向）"
    }
  ],
  "summary": "综合评价（分析优势、短板、总体水平）",
  "overallScore": 68
}`;

        // 调用LLM分析
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位资深的管理能力评估专家，擅长从工作资料中识别和评估管理能力水平。" },
            { role: "user", content: analysisPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "competency_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  competencies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string" },
                        level: { type: "integer" },
                        score: { type: "integer" },
                        evidence: { type: "string" },
                        suggestion: { type: "string" }
                      },
                      required: ["name", "category", "level", "score", "evidence", "suggestion"],
                      additionalProperties: false
                    }
                  },
                  summary: { type: "string" },
                  overallScore: { type: "integer" }
                },
                required: ["competencies", "summary", "overallScore"],
                additionalProperties: false
              }
            }
          }
        });

        const content = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        const analysis = JSON.parse(content);

        // 更新用户能力进度
        for (const comp of analysis.competencies) {
          // 查找对应的能力ID
          const competency = allCompetencies.find(c => c.name === comp.name);
          if (competency) {
            await db.upsertUserCompetency({
              userId: ctx.user.id,
              competencyId: competency.id,
              score: comp.score,
              currentLevel: comp.level,
              selfAssessed: 0, // 默认值，等待用户自评
              aiAssessed: comp.level,
              status: comp.score >= 80 ? 'mastered' : comp.score >= 60 ? 'learning' : 'not_started',
              practiceCount: 1,
              lastPracticed: new Date() // 记录最后实践时间
            });
          }
        }

        return analysis;
      }),
  }),

  // ==================== Achievements (成就系统) ====================
  achievements: router({
    // 获取所有成就定义
    list: protectedProcedure.query(async () => {
      return await db.getAllAchievements();
    }),

    // 获取用户已解锁的成就
    myAchievements: protectedProcedure.query(async ({ ctx }) => {
      const userAchs = await db.getUserAchievements(ctx.user.id);
      const allAchs = await db.getAllAchievements();
      
      // 合并成就信息和解锁状态
      return allAchs.map(ach => {
        const unlocked = userAchs.find(ua => ua.achievementId === ach.id);
        return {
          ...ach,
          unlocked: !!unlocked,
          unlockedAt: unlocked?.unlockedAt || null
        };
      });
    }),

    // 检查并解锁成就（在关键操作后调用）
    checkAndUnlock: protectedProcedure.mutation(async ({ ctx }) => {
      return await db.checkAndUnlockAchievements(ctx.user.id);
    }),
  }),

  // ==================== Admin (管理员) ====================
  admin: router({
    // 获取统计数据
    getStats: protectedProcedure.query(async ({ ctx }) => {
      // 检查管理员权限
      if (ctx.user.role !== 'admin') {
        throw new Error('无权限访问');
      }

      const stats = await db.getAdminStats();
      return stats;
    }),

    // 获取所有用户列表
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      // 检查管理员权限
      if (ctx.user.role !== 'admin') {
        throw new Error('无权限访问');
      }

      const users = await db.getAllUsersWithStats();
      return users;
    }),

    // 获取用户详情
    getUserDetail: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        // 检查管理员权限
        if (ctx.user.role !== 'admin') {
          throw new Error('无权限访问');
        }

        const userDetail = await db.getUserDetailForAdmin(input.userId);
        return userDetail;
      }),

    // ========== 行业管理 ==========
    industries: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以访问" });
        }
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
        return await database.select().from(industries);
      }),

      create: protectedProcedure
        .input(z.object({
          name: z.string(),
          code: z.string(),
          description: z.string().optional(),
          keyCharacteristics: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以创建" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          const result = await database.insert(industries).values(input);
          return { id: Number(result[0].insertId), success: true };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string(),
          code: z.string(),
          description: z.string().optional(),
          keyCharacteristics: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以更新" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          await database.update(industries).set({
            name: input.name,
            code: input.code,
            description: input.description,
            keyCharacteristics: input.keyCharacteristics,
          }).where(eq(industries.id, input.id));
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以删除" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          await database.delete(industries).where(eq(industries.id, input.id));
          return { success: true };
        }),

      // 专有能力关联管理
      getCompetencies: protectedProcedure
        .input(z.object({ industryId: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以访问" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          return await database.select().from(industryCompetencies).where(eq(industryCompetencies.industryId, input.industryId));
        }),

      addCompetency: protectedProcedure
        .input(z.object({
          industryId: z.number(),
          competencyId: z.number(),
          importance: z.number().min(1).max(5).default(3),
          description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以添加" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          const result = await database.insert(industryCompetencies).values(input);
          return { id: Number(result[0].insertId), success: true };
        }),

      removeCompetency: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以删除" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          await database.delete(industryCompetencies).where(eq(industryCompetencies.id, input.id));
          return { success: true };
        }),
    }),

    // ========== 职位管理 ==========
    positions: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以访问" });
        }
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
        return await database.select().from(positions);
      }),

      create: protectedProcedure
        .input(z.object({
          name: z.string(),
          code: z.string(),
          category: z.string(),
          level: z.enum(["executive", "senior", "middle", "junior"]),
          description: z.string().optional(),
          keyResponsibilities: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以创建" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          const result = await database.insert(positions).values(input);
          return { id: Number(result[0].insertId), success: true };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string(),
          code: z.string(),
          category: z.string(),
          level: z.enum(["executive", "senior", "middle", "junior"]),
          description: z.string().optional(),
          keyResponsibilities: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以更新" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          await database.update(positions).set({
            name: input.name,
            code: input.code,
            category: input.category,
            level: input.level,
            description: input.description,
            keyResponsibilities: input.keyResponsibilities,
          }).where(eq(positions.id, input.id));
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以删除" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          await database.delete(positions).where(eq(positions.id, input.id));
          return { success: true };
        }),

      // 核心能力关联管理
      getCompetencies: protectedProcedure
        .input(z.object({ positionId: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以访问" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          return await database.select().from(positionCompetencies).where(eq(positionCompetencies.positionId, input.positionId));
        }),

      addCompetency: protectedProcedure
        .input(z.object({
          positionId: z.number(),
          competencyId: z.number(),
          importance: z.number().min(1).max(5).default(3),
          requiredLevel: z.number().min(1).max(5).default(3),
          description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以添加" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          const result = await database.insert(positionCompetencies).values(input);
          return { id: Number(result[0].insertId), success: true };
        }),

      removeCompetency: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以删除" });
          }
          const database = await db.getDb();
          if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "数据库连接失败" });
          await database.delete(positionCompetencies).where(eq(positionCompetencies.id, input.id));
          return { success: true };
        }),
    }),
  }),

  // ==================== Organization (企业能力) ====================
  organization: router({
    // 获取企业能力评估
    getAssessment: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrganizationAssessment(ctx.user.id);
    }),

    // 保存企业能力评估
    saveAssessment: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        strategyScore: z.number(),
        operationScore: z.number(),
        organizationScore: z.number(),
        innovationScore: z.number(),
        detailedScores: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const assessmentId = await db.saveOrganizationAssessment({
          userId: ctx.user.id,
          ...input,
        });
        
        // 同时保存到历史记录表
        try {
          const detailedData = JSON.parse(input.detailedScores);
          await db.saveOrganizationAssessmentHistory({
            userId: ctx.user.id,
            strategyScore: input.strategyScore,
            operationScore: input.operationScore,
            organizationScore: input.organizationScore,
            innovationScore: input.innovationScore,
            questionAnswers: JSON.stringify(detailedData.questionAnswers || {}),
            metricValues: JSON.stringify(detailedData.metricValues || {}),
          });
        } catch (e) {
          console.error('Failed to save assessment history:', e);
        }
        
        return { success: true, assessmentId };
      }),

    // 获取评估历史记录
    getAssessmentHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(10),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getOrganizationAssessmentHistory(ctx.user.id, input.limit);
      }),

    // 基于发展阶段的能力基准对比
    compareBenchmark: protectedProcedure
      .input(z.object({
        companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]),
      }))
      .query(async ({ ctx, input }) => {
        // 获取用户的企业能力评估
        const assessment = await db.getOrganizationAssessment(ctx.user.id);
        if (!assessment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '请先完成企业能力评估' });
        }

        // 不同发展阶段的能力基准（根据行业标准制定）
        const benchmarks: Record<string, { strategy: number; operation: number; organization: number; innovation: number }> = {
          seed: { strategy: 50, operation: 45, organization: 40, innovation: 60 },
          angel: { strategy: 55, operation: 50, organization: 50, innovation: 65 },
          series_a: { strategy: 65, operation: 60, organization: 60, innovation: 70 },
          series_b: { strategy: 70, operation: 70, organization: 70, innovation: 75 },
          series_c: { strategy: 75, operation: 75, organization: 75, innovation: 75 },
          series_d: { strategy: 80, operation: 80, organization: 80, innovation: 75 },
          pre_ipo: { strategy: 85, operation: 85, organization: 85, innovation: 70 },
          public: { strategy: 90, operation: 90, organization: 90, innovation: 70 },
          mature: { strategy: 85, operation: 95, organization: 90, innovation: 65 },
        };

        const benchmark = benchmarks[input.companyStage];
        
        return {
          current: {
            strategy: assessment.strategyScore,
            operation: assessment.operationScore,
            organization: assessment.organizationScore,
            innovation: assessment.innovationScore,
          },
          benchmark,
          gaps: {
            strategy: assessment.strategyScore - benchmark.strategy,
            operation: assessment.operationScore - benchmark.operation,
            organization: assessment.organizationScore - benchmark.organization,
            innovation: assessment.innovationScore - benchmark.innovation,
          },
          stage: input.companyStage,
        };
      }),

    // 企业能力提升路径规划
    planImprovementPath: protectedProcedure.mutation(async ({ ctx }) => {
      const assessment = await db.getOrganizationAssessment(ctx.user.id);
      if (!assessment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '请先完成企业能力评估' });
      }

      const profile = await db.getUserProfile(ctx.user.id);
      const company = await db.getUserCompany(ctx.user.id);

      // 调用LLM生成能力提升路径
      const prompt = `你是一位企业管理咨询专家，请基于以下企业能力评估数据，制定一个分阶段的能力提升路径。

**公司信息**：
- 公司名称：${company?.name || '未知'}
- 行业：${profile?.industry || '未知'}
- 发展阶段：${profile?.companyStage || '未知'}
- 公司规模：${profile?.companySize || '未知'}

**当前能力评分**：
- 战略能力：${assessment.strategyScore}/100
- 运营能力：${assessment.operationScore}/100
- 组织能力：${assessment.organizationScore}/100
- 创新能力：${assessment.innovationScore}/100

请提供：
1. **短期目标**（3-6个月）：针对最薄弱的维度，列出3-5个具体的行动项
2. **中期目标**（6-12个月）：全面提升各项能力，列出3-5个关键举措
3. **长期目标**（12-24个月）：构建核心竞争力，列出2-3个战略重点

请以JSON格式返回，结构为：
{
  "shortTerm": [{ "title": "", "description": "", "priority": "high/medium/low" }],
  "midTerm": [{ "title": "", "description": "", "priority": "high/medium/low" }],
  "longTerm": [{ "title": "", "description": "", "priority": "high/medium/low" }]
}`;

      const response = await invokeLLM({
        messages: [
          { role: 'system', content: '你是一位企业管理咨询专家，擅长企业能力评估和组织发展。' },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'improvement_path',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                shortTerm: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                    required: ['title', 'description', 'priority'],
                    additionalProperties: false,
                  },
                },
                midTerm: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                    required: ['title', 'description', 'priority'],
                    additionalProperties: false,
                  },
                },
                longTerm: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                    required: ['title', 'description', 'priority'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['shortTerm', 'midTerm', 'longTerm'],
              additionalProperties: false,
            },
          },
        },
      });

      const aiResponse = response.choices[0].message.content;
      const path = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;

      return {
        success: true,
        path,
      };
    }),

    // 个人能力与企业能力的联动分析
    analyzeLinkage: protectedProcedure.mutation(async ({ ctx }) => {
      // 获取企业能力评估
      const orgAssessment = await db.getOrganizationAssessment(ctx.user.id);
      if (!orgAssessment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '请先完成企业能力评估' });
      }

      // 获取个人能力评估
      const userCompetencies = await db.getUserCompetencies(ctx.user.id);
      if (!userCompetencies || userCompetencies.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '请先完成个人能力评估' });
      }

      // 计算个人能力平均分
      const avgScore = userCompetencies.reduce((sum, c) => sum + c.score, 0) / userCompetencies.length;

      // 找出个人能力的强项和弱项
      const sortedCompetencies = [...userCompetencies].sort((a, b) => b.score - a.score);
      const strengths = sortedCompetencies.slice(0, 5);
      const weaknesses = sortedCompetencies.slice(-5);

      // 调用LLM进行联动分析
      const prompt = `你是一位企业管理咨询专家，请分析个人能力与企业能力的关联。

**企业能力评分**：
- 战略能力：${orgAssessment.strategyScore}/100
- 运营能力：${orgAssessment.operationScore}/100
- 组织能力：${orgAssessment.organizationScore}/100
- 创新能力：${orgAssessment.innovationScore}/100

**个人能力情况**：
- 平均分：${avgScore.toFixed(1)}/100
- 能力强项：${strengths.map(c => c.competencyName).join('、')}
- 能力弱项：${weaknesses.map(c => c.competencyName).join('、')}

请提供：
1. **贡献分析**：分析个人能力如何影响企业能力
2. **缺口识别**：指出企业能力短板对应的个人能力缺口
3. **提升建议**：给出3-5条具体的个人能力提升建议，以支持企业能力发展`;

      const response = await invokeLLM({
        messages: [
          { role: 'system', content: '你是一位企业管理咨询专家，擅长人才发展和组织能力建设。' },
          { role: 'user', content: prompt },
        ],
      });

      const aiResponse = response.choices[0].message.content;
      const analysis = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);

      return {
        success: true,
        orgCapability: {
          strategy: orgAssessment.strategyScore,
          operation: orgAssessment.operationScore,
          organization: orgAssessment.organizationScore,
          innovation: orgAssessment.innovationScore,
        },
        personalCapability: {
          avgScore,
          strengths: strengths.map(c => ({ name: c.competencyName, score: c.score })),
          weaknesses: weaknesses.map(c => ({ name: c.competencyName, score: c.score })),
        },
        aiAnalysis: analysis,
      };
    }),

    // AI分析企业能力
    analyzeCapability: protectedProcedure
      .input(z.object({
        assessmentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 获取评估数据
        const assessment = await db.getOrganizationAssessment(ctx.user.id);
        if (!assessment) {
          throw new Error('评估数据不存在');
        }

        // 获取用户画像
        const profile = await db.getUserProfile(ctx.user.id);
        const profileInfo = profile ? `
**公司背景**：
- 行业：${profile.industry || '未知'}
- 公司规模：${profile.companySize === 'startup' ? '初创(<50人)' : profile.companySize === 'small' ? '小型(50-200人)' : profile.companySize === 'medium' ? '中型(200-1000人)' : '大型(1000+人)'}
- 发展阶段：${profile.companyStage}` : '';

        // 调用LLM进行AI分析
        const prompt = `你是一位企业管理咨询专家，请基于以下企业能力评估数据，提供专业的分析和建议。

${profileInfo}

**能力评分**：
- 战略能力：${assessment.strategyScore}/100
- 运营能力：${assessment.operationScore}/100
- 组织能力：${assessment.organizationScore}/100
- 创新能力：${assessment.innovationScore}/100

请提供：
1. **能力分析**：分析企业在四大维度的优势和不足
2. **提升建议**：针对较弱的维度，提供3-5条具体可执行的改进建议`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: '你是一位企业管理咨询专家，擅长企业能力评估和组织发展。' },
            { role: 'user', content: prompt },
          ],
        });

        const aiResponse = response.choices[0].message.content;
        const responseText = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
        
        // 分离分析和建议
        const sections = responseText.split(/\n\n/);
        const aiAnalysis = sections.slice(0, Math.ceil(sections.length / 2)).join('\n\n');
        const aiSuggestions = sections.slice(Math.ceil(sections.length / 2)).join('\n\n');

        // 保存AI分析结果
        await db.updateOrganizationAnalysis(
          assessment.id,
          aiAnalysis,
          aiSuggestions
        );

        return {
          success: true,
          aiAnalysis,
          aiSuggestions,
        };
      }),

    // 获取公司信息
    getCompany: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCompany(ctx.user.id);
    }),

    // 创建公司
    createCompany: protectedProcedure
      .input(z.object({
        name: z.string(),
        industry: z.string().optional(),
        companySize: z.enum(["startup", "small", "medium", "large"]).optional(),
        companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 检查用户是否已经创建了公司
        const existingCompany = await db.getUserCompany(ctx.user.id);
        if (existingCompany) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '您已经创建了公司，每个用户只能创建一个公司',
          });
        }

        // 检查系统中是否已存在同名公司
        const existingCompanyByName = await db.getCompanyByName(input.name);
        if (existingCompanyByName) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `公司名称"${input.name}"已被使用，请使用其他名称`,
          });
        }

        const companyId = await db.createCompany({
          ownerId: ctx.user.id,
          ...input,
        });
        return { success: true, companyId };
      }),

    // 更新公司信息
    updateCompany: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        name: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.enum(["startup", "small", "medium", "large"]).optional(),
        companyStage: z.enum(["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]).optional(),
        description: z.string().optional(),
        organizationStructure: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 检查权限：只有owner或admin可以编辑公司信息
        const hasPermission = await db.isCompanyAdmin(ctx.user.id, input.companyId);
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "您没有权限编辑公司信息，只有管理员可以执行此操作"
          });
        }
        
        const { companyId, ...updateData } = input;
        await db.updateCompany(companyId, updateData);
        return { success: true };
      }),

    // 获取公司成员
    getMembers: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getCompanyMembers(input.companyId);
      }),

    // 添加公司成员
    addMember: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        userId: z.number(),
        role: z.string().optional(),
        department: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const memberId = await db.addCompanyMember(input);
        return { success: true, memberId };
      }),

    // 获取用户所属的所有公司（作为owner或member）
    getUserCompanies: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCompanies(ctx.user.id);
    }),

    // 通过email邀请员工
    inviteMemberByEmail: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        email: z.string().email(),
        role: z.string().optional(),
        department: z.string().optional(),
        permission: z.enum(["admin", "member"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 检查权限：只有owner或admin可以邀请员工
        const hasPermission = await db.isCompanyAdmin(ctx.user.id, input.companyId);
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "您没有权限邀请员工，只有管理员可以执行此操作"
          });
        }
        
        const { companyId, email, role, department, permission } = input;
        
        // 查找用户
        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "未找到该邮箱对应的用户，请确认用户已注册" 
          });
        }

        // 检查是否已经是成员
        const existingMembers = await db.getCompanyMembers(companyId);
        const isAlreadyMember = existingMembers.some(m => m.userId === user.id && m.isActive === 1);
        if (isAlreadyMember) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "该用户已经是公司成员" 
          });
        }

        const memberId = await db.addCompanyMember({
          companyId,
          userId: user.id,
          role,
          department,
          permission: permission || 'member',
        });

        // 获取公司信息
        const company = await db.getUserCompany(ctx.user.id);
        const companyName = company?.name || '公司';

        // 发送通知给被邀请的用户（如果是owner）
        try {
          await notifyOwner({
            title: `您已被邀请加入${companyName}`,
            content: `您已被邀请加入${companyName}，职位：${role || '成员'}，部门：${department || '未指定'}。请登录系统查看详情。`,
          });
        } catch (error) {
          console.error('发送邀请通知失败:', error);
          // 不阻塞邀请流程
        }

        return { success: true, memberId, userName: user.name };
      }),

    // 获取公司成员详细信息
    getMembersWithUserInfo: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getCompanyMembersWithUserInfo(input.companyId);
      }),

    // 更新成员信息
    updateMember: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        memberId: z.number(),
        role: z.string().optional(),
        department: z.string().optional(),
        permission: z.enum(["admin", "member"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 检查权限：只有owner或admin可以编辑成员信息
        const hasPermission = await db.isCompanyAdmin(ctx.user.id, input.companyId);
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "您没有权限编辑成员信息，只有管理员可以执行此操作"
          });
        }
        
        const { companyId, memberId, ...updateData } = input;
        await db.updateCompanyMember(memberId, updateData);
        return { success: true };
      }),

    // 移除成员
    removeMember: protectedProcedure
      .input(z.object({ 
        companyId: z.number(),
        memberId: z.number() 
      }))
      .mutation(async ({ ctx, input }) => {
        // 检查权限：只有owner或admin可以移除成员
        const hasPermission = await db.isCompanyAdmin(ctx.user.id, input.companyId);
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "您没有权限移除成员，只有管理员可以执行此操作"
          });
        }
        
        await db.removeCompanyMember(input.memberId);
        return { success: true };
      }),

    // 获取公司能力分析
    getCapabilityAnalytics: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getCompanyCapabilityAnalytics(input.companyId);
      }),

    // 获取员工能力对比
    getMembersCapabilityComparison: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getCompanyMembersCapabilityComparison(input.companyId);
      }),

    // 获取公司能力成长趋势
    getCapabilityTrends: protectedProcedure
      .input(z.object({ 
        companyId: z.number(),
        months: z.number().optional().default(6)
      }))
      .query(async ({ ctx, input }) => {
        return await db.getCompanyCapabilityTrends(input.companyId, input.months);
      }),

    // 获取用户个人能力成长趋势
    getUserCapabilityTrends: protectedProcedure
      .input(z.object({ 
        months: z.number().optional().default(6)
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserCapabilityTrends(ctx.user.id, input.months);
      }),

    // 创建能力快照（手动触发或定时任务）
    createSnapshot: protectedProcedure
      .mutation(async ({ ctx }) => {
        const snapshots = await db.createCapabilitySnapshot(ctx.user.id);
        return { success: true, count: snapshots.length };
      }),

    // 设置能力目标
    setCapabilityGoal: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
        goalType: z.enum(['industry_standard', 'custom']),
        industryId: z.number().optional(),
        positionId: z.number().optional(),
        goalData: z.string(), // JSON格式：{ competencyId: targetScore }
        description: z.string().optional(),
        targetDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const goalId = await db.upsertCapabilityGoal({
          ...input,
          userId: input.companyId ? undefined : ctx.user.id,
        });
        return { success: true, goalId };
      }),

    // 获取能力目标
    getCapabilityGoal: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getCapabilityGoal({
          companyId: input.companyId,
          userId: input.companyId ? undefined : ctx.user.id,
        });
      }),

    // 生成能力缺口分析
    analyzeCapabilityGap: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 获取目标
        const goal = await db.getCapabilityGoal({
          companyId: input.companyId,
          userId: input.companyId ? undefined : ctx.user.id,
        });

        if (!goal) {
          throw new Error('请先设置能力目标');
        }

        // 获取当前能力数据
        let currentCapabilities;
        if (input.companyId) {
          const analytics = await db.getCompanyCapabilityAnalytics(input.companyId);
          if (!analytics) {
            throw new Error('无法获取公司能力数据');
          }
          currentCapabilities = analytics.capabilityDistribution;
        } else {
          const userCompetencies = await db.getUserCompetencies(ctx.user.id);
          currentCapabilities = userCompetencies.map(uc => ({
            competencyId: uc.competencyId,
            score: uc.score,
          }));
        }

        // 解析目标数据
        const goalData = JSON.parse(goal.goalData);

        // 计算缺口
        const gapData: any[] = [];
        const priorityCapabilities: any[] = [];

        for (const [competencyIdStr, targetScore] of Object.entries(goalData)) {
          const competencyId = parseInt(competencyIdStr);
          const current = currentCapabilities.find((c: any) => c.competencyId === competencyId);
          const currentScore = current ? ('avgScore' in current ? current.avgScore : current.score) : 0;
          const gap = (targetScore as number) - currentScore;

          if (gap > 0) {
            const competency = await db.getCompetencyById(competencyId);
            gapData.push({
              competencyId,
              competencyName: competency?.name || '未知能力',
              currentScore,
              targetScore,
              gap,
            });

            if (gap >= 20) {
              priorityCapabilities.push({
                competencyId,
                competencyName: competency?.name || '未知能力',
                gap,
              });
            }
          }
        }

        // 按缺口大小排序
        gapData.sort((a, b) => b.gap - a.gap);
        priorityCapabilities.sort((a, b) => b.gap - a.gap);

        // 调用AI生成培训建议
        const topGaps = gapData.slice(0, 5);
        const gapSummary = topGaps.map(g => `${g.competencyName}：当前${g.currentScore}分，目标${g.targetScore}分，缺口${g.gap}分`).join('\n');

        const aiPrompt = `作为一名专业的管理能力培训顾问，请基于以下能力缺口分析，提供具体的培训建议和行动计划：

**能力缺口：**
${gapSummary}

请提供：
1. **优先级排序**：哪些能力应该优先提升，为什么？
2. **培训建议**：针对每个优先能力，提供3-5条具体可执行的提升建议
3. **学习资源**：推荐相关的书籍、课程或实践项目`;

        const aiResponse = await invokeLLM({
          messages: [
            { role: 'system', content: '你是一名专业的管理能力培训顾问。' },
            { role: 'user', content: aiPrompt },
          ],
        });

        const aiContent = aiResponse.choices[0].message.content;
        const aiRecommendations = typeof aiContent === 'string' ? aiContent : JSON.stringify(aiContent);

        // 保存分析结果
        const analysisId = await db.createCapabilityGapAnalysis({
          companyId: input.companyId,
          userId: input.companyId ? undefined : ctx.user.id,
          goalId: goal.id,
          gapData: JSON.stringify(gapData),
          priorityCapabilities: JSON.stringify(priorityCapabilities),
          aiRecommendations,
          trainingPlan: aiRecommendations, // 可以后续单独生成
        });

        return {
          success: true,
          analysisId,
          gapData,
          priorityCapabilities,
          aiRecommendations,
        };
      }),

    // 获取最新的能力缺口分析
    getLatestCapabilityGapAnalysis: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const analysis = await db.getLatestCapabilityGapAnalysis({
          companyId: input.companyId,
          userId: input.companyId ? undefined : ctx.user.id,
        });

        if (!analysis) return null;

        return {
          ...analysis,
          gapData: JSON.parse(analysis.gapData),
          priorityCapabilities: analysis.priorityCapabilities ? JSON.parse(analysis.priorityCapabilities) : [],
        };
      }),
  }),

  // ==================== Report (报告生成) ====================
  report: router({
    // 生成成长报告PDF
    generatePDF: protectedProcedure
      .input(z.object({
        period: z.enum(["week", "month", "quarter", "year"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { generateGrowthReportPDF } = await import("./pdfService");
        
        // 获取用户数据
        const user = ctx.user;
        const competencies = await db.getUserCompetencies(user.id);
        const scenarios = await db.getUserScenarios(user.id);
        
        // 计算模块得分
        const moduleScores: Record<string, {total: number; count: number}> = {};
        competencies.forEach((comp: any) => {
          const category = comp.category;
          if (!moduleScores[category]) {
            moduleScores[category] = {total: 0, count: 0};
          }
          moduleScores[category].total += (comp.userProgress as any)?.score || 0;
          moduleScores[category].count += 1;
        });
        
        const moduleScoresArray = Object.entries(moduleScores).map(([module, data]) => ({
          module,
          score: Math.round(data.total / data.count)
        }));
        
        // 统计完成的挑战
        const completedScenarios = scenarios.filter((s: any) => s.status === "completed");
        
        // 计算能力提升（模拟数据，实际应从历史快照获取）
        const improvement = 15;
        
        // 计算平均得分
        const averageScore = moduleScoresArray.length > 0
          ? Math.round(moduleScoresArray.reduce((sum, m) => sum + m.score, 0) / moduleScoresArray.length)
          : 0;
        
        // 生成成长亮点
        const highlights: string[] = [];
        if (improvement > 0) {
          highlights.push(`能力显著提升：${input.period === "month" ? "本月" : input.period === "quarter" ? "本季度" : "本年度"}平均能力提升了 ${improvement} 分，成长速度超过 80% 的用户`);
        }
        if (completedScenarios.length > 0) {
          highlights.push(`挑战完成度高：${input.period === "month" ? "本月" : input.period === "quarter" ? "本季度" : "本年度"}完成了 ${completedScenarios.length} 个挑战，展现出色的执行力`);
        }
        if (moduleScoresArray.some(m => m.score >= 80)) {
          const masteredModules = moduleScoresArray.filter(m => m.score >= 80).map(m => m.module).join("、");
          highlights.push(`达到精通水平：${masteredModules} 模块已达到精通水平`);
        }
        
        // 准备PDF数据
        const reportData = {
          userName: user.name || user.email || "用户",
          period: input.period,
          periodLabel: input.period === "month" ? "本月" : input.period === "quarter" ? "本季度" : "本年度",
          generatedAt: new Date().toLocaleString("zh-CN"),
          improvement,
          completedChallenges: completedScenarios.length,
          totalChallenges: scenarios.length,
          masteredCompetencies: competencies.filter((c: any) => (c.userProgress as any)?.status === "mastered").length,
          averageScore,
          moduleScores: moduleScoresArray,
          completedScenarios: completedScenarios.slice(0, 10).map((s: any) => ({
            title: s.title,
            competencyName: s.competencyName || "未知能力",
            category: s.category || "未知类别",
            points: s.points || 10,
          })),
          highlights,
        };
        
        // 生成PDF
        const pdfBuffer = await generateGrowthReportPDF(reportData);
        
        // 返回base64编码的PDF
        return {
          success: true,
          pdf: pdfBuffer.toString("base64"),
          filename: `成长报告_${reportData.periodLabel}_${new Date().getTime()}.pdf`,
        };
      }),
  }),

  // ==================== Industry & Position (行业和职位库) ====================
  industry: router({
    // 获取所有行业
    list: publicProcedure.query(async () => {
      const database = await db.getDb();
      if (!database) return [];
      return await database.select().from(industries).orderBy(industries.name);
    }),
    
    // 获取单个行业详情
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return null;
        const [industry] = await database.select().from(industries).where(eq(industries.id, input.id)).limit(1);
        return industry || null;
      }),
  }),
  
  position: router({
    // 获取所有职位
    list: publicProcedure.query(async () => {
      const database = await db.getDb();
      if (!database) return [];
      return await database.select().from(positions).orderBy(positions.level, positions.name);
    }),
    
    // 按层级筛选职位
    listByLevel: publicProcedure
      .input(z.object({ level: z.enum(["executive", "senior", "middle", "junior"]).optional() }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return [];
        if (input.level) {
          return await database.select().from(positions).where(eq(positions.level, input.level)).orderBy(positions.name);
        }
        return await database.select().from(positions).orderBy(positions.level, positions.name);
      }),
    
    // 获取单个职位详情
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return null;
        const [position] = await database.select().from(positions).where(eq(positions.id, input.id)).limit(1);
        return position || null;
      }),

    // 获取用户能力数据（用于职位详情页）
    getUserAbilities: protectedProcedure
      .input(z.object({ positionId: z.number() }))
      .query(async ({ ctx, input }) => {
        // 获取职位的核心能力要求
        const positionComps = await db.getPositionCompetencies(input.positionId);
        
        // 获取用户的所有能力评分
        const userComps = await db.getUserCompetencies(ctx.user.id);
        
        // 构建能力对比数据
        const abilities = positionComps.map((pc: any) => {
          // 查找用户对应能力的当前等级和分数
          const userComp = userComps.find((uc: any) => uc.competencyId === pc.competencyId);
          
          return {
            competencyId: pc.competencyId,
            competencyName: pc.competencyName,
            competencyCategory: pc.competencyCategory,
            requiredLevel: pc.requiredLevel,
            importance: pc.importance,
            currentLevel: userComp?.currentLevel || 0,
            currentScore: userComp?.score || 0,
            gap: pc.requiredLevel - (userComp?.currentLevel || 0),
          };
        });
        
        return abilities;
      }),
  }),

  // ==================== Feedback (用户反馈) ====================
  feedback: router({
    // 提交反馈
    submit: protectedProcedure
      .input(z.object({
        type: z.enum(["feature", "bug", "improvement", "other"]),
        title: z.string(),
        description: z.string(),
        contact: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) {
          throw new Error("数据库不可用");
        }

        await database.insert(feedbacks).values({
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          description: input.description,
          contact: input.contact,
        });

        return { success: true };
      }),

    // 获取用户的反馈列表
    list: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) {
        return [];
      }

      return await database
        .select()
        .from(feedbacks)
        .where(eq(feedbacks.userId, ctx.user.id))
        .orderBy(desc(feedbacks.createdAt));
    }),
  }),

  // ==================== 问卷评估 ====================
  assessment: router({
    // 获取历史评估数据（用于成长报告）
    getHistoryData: protectedProcedure
      .input(z.object({
        period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
      }))
      .query(async ({ ctx, input }) => {
        // 获取用户的当前能力评分
        const userCompetencies = await db.getUserCompetencies(ctx.user.id);
        const allCompetencies = await db.getAllCompetencies();
        
        // 计算时间范围
        const now = new Date();
        let startDate = new Date();
        let dataPoints = 6; // 默认6个数据点
        
        switch (input.period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            dataPoints = 7;
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            dataPoints = 4; // 4周
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            dataPoints = 3; // 3个月
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            dataPoints = 12; // 12个月
            break;
        }

        // 获取历史评估会话
        const sessions = await db.getUserAssessmentSessions(ctx.user.id);
        const completedSessions = sessions.filter(s => 
          s.status === 'completed' && 
          s.completedAt && 
          new Date(s.completedAt) >= startDate
        );

        // 获取所有答题记录
        const answers = await db.getUserAnswers(ctx.user.id);
        
        // 计算8个维度的历史趋势数据
        const categories = [
          '战略规划', '创新变革', '决策思维', '业务执行',
          '沟通协作', '自我管理', '团队管理', '人才发展'
        ];
        
        // 按类别分组当前能力
        const categoryScores: Record<string, number[]> = {};
        categories.forEach(cat => {
          const compsInCategory = allCompetencies.filter(c => c.category === cat);
          const scores = compsInCategory.map(comp => {
            const userComp = userCompetencies.find(uc => uc.competencyId === comp.id);
            return userComp?.score || 0;
          });
          categoryScores[cat] = scores;
        });

        return {
          userCompetencies,
          allCompetencies,
          categoryScores,
          completedSessions,
          totalAnswers: answers.length,
          period: input.period,
          dataPoints,
        };
      }),
    // 开始新的评估会话
    startSession: protectedProcedure
      .input(z.object({
        sessionType: z.enum(["initial", "validation"]),
        totalQuestions: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = await db.createAssessmentSession({
          userId: ctx.user.id,
          sessionType: input.sessionType,
          totalQuestions: input.totalQuestions,
          completedQuestions: 0,
          status: "in_progress",
        });
        
        return { sessionId };
      }),
    
    // 获取评估会话的题目
    getSessionQuestions: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        // Get session info
        const database = await db.getDb();
        if (!database) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '数据库连接失败',
          });
        }
        
        const [session] = await database
          .select()
          .from(assessmentSessions)
          .where(eq(assessmentSessions.id, input.sessionId))
          .limit(1);
        
        if (!session) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '评估会话不存在',
          });
        }
        
        if (session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权访问此评估会话',
          });
        }
        
        // Get questions for this session type
        const questions = await database
          .select()
          .from(assessmentQuestions)
          .limit(session.totalQuestions);
        
        // Get user's answers for this session
        const answers = await database
          .select()
          .from(userAnswers)
          .where(eq(userAnswers.userId, ctx.user.id));
        
        return {
          session,
          questions,
          answers,
          progress: {
            total: session.totalQuestions,
            completed: session.completedQuestions,
            percentage: Math.round((session.completedQuestions / session.totalQuestions) * 100),
          },
        };
      }),
    
    // 临时调试API：获取所有能力名称
    getAllCompetencyNames: publicProcedure
      .query(async () => {
        const allCompetencies = await db.getAllCompetencies();
        return allCompetencies.map(c => ({ id: c.id, name: c.name, category: c.category }));
      }),
    
    // 根据能力ID获取题目
    getQuestionsByCompetency: protectedProcedure
      .input(z.object({
        competencyId: z.string(),
        limit: z.number().optional().default(5),
      }))
      .query(async ({ ctx, input }) => {
        const questions = await db.getQuestionsByCompetency(input.competencyId);
        
        // 获取用户已答题目
        const answeredQuestions = await db.getUserAnsweredQuestions(ctx.user.id);
        const answeredIds = new Set(answeredQuestions.map(a => a.questionId));
        
        // 标记已答题目
        const questionsWithStatus = questions.map(q => ({
          ...q,
          answered: answeredIds.has(q.id),
        }));
        
        // 返回指定数量，优先返回未答题目
        const unanswered = questionsWithStatus.filter(q => !q.answered);
        const answered = questionsWithStatus.filter(q => q.answered);
        
        return [...unanswered, ...answered].slice(0, input.limit);
      }),

    // 获取问卷题目
    getQuestions: protectedProcedure
      .input(z.object({
        questionType: z.enum(["initial", "validation"]),
        limit: z.number().optional(),
        excludeAnswered: z.boolean().default(true), // 默认排除已答题目
      }))
      .query(async ({ ctx, input }) => {
        let questions = await db.getQuestionsByType(input.questionType, input.limit);
        
        // 如果需要排除已答题目
        if (input.excludeAnswered) {
          const answeredQuestions = await db.getUserAnsweredQuestions(ctx.user.id);
          const answeredIds = new Set(answeredQuestions.map(a => a.questionId));
          questions = questions.filter(q => !answeredIds.has(q.id));
          
          // 如果指定了limit，确保返回足够的题目
          if (input.limit && questions.length < input.limit) {
            // 如果去重后题目不足，补充一些已答题目（但优先显示未答题目）
            const allQuestions = await db.getQuestionsByType(input.questionType, input.limit);
            questions = allQuestions.slice(0, input.limit);
          }
        }
        
        return questions;
      }),
    
    // 提交答案（单题答题，立即更新能力分数）
    submitAnswer: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        competencyId: z.string(), // 添加能力ID
        selectedOption: z.string(),
        assessedLevel: z.number(),
        sessionType: z.enum(["initial", "validation"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // 保存答题记录
        await db.createUserAnswer({
          userId: ctx.user.id,
          questionId: input.questionId,
          selectedOption: input.selectedOption,
          assessedLevel: input.assessedLevel,
          sessionType: input.sessionType,
        });
        
        // 获取该能力的所有题目
        const allQuestions = await db.getQuestionsByCompetency(input.competencyId);
        // 获取用户对该能力的所有答题记录
        const userAnswers = await db.getUserAnswers(ctx.user.id);
        const competencyAnswers = userAnswers.filter(a => 
          allQuestions.some(q => q.id === a.questionId)
        );
        
        // 计算问卷平均分
        const avgQuestionnaireLevel = competencyAnswers.length > 0
          ? competencyAnswers.reduce((sum, a) => sum + a.assessedLevel, 0) / competencyAnswers.length
          : input.assessedLevel;
        
        // 获取或创建用户能力记录
        const allCompetencies = await db.getAllCompetencies();
        
        // 尝试多种匹配方式：1. 直接匹配 name  2. 匹配 ID  3. 模糊匹配
        let competency = allCompetencies.find(c => c.name === input.competencyId);
        
        if (!competency) {
          // 尝试通过ID匹配
          const competencyId = parseInt(input.competencyId);
          if (!isNaN(competencyId)) {
            competency = allCompetencies.find(c => c.id === competencyId);
          }
        }
        
        if (!competency) {
          // 尝试模糊匹配（将英文标识符转换为中文）
          // 根据数据库中实际的能力名称建立映射表
          const nameMap: Record<string, string> = {
            'strategy_planning': '战略规划与执行',
            'business_model': '商业模式创新',
            'market_analysis': '市场洞察与分析',
            'goal_management': '目标管理与分解',
            'change_management': '变革管理',
            'risk_management': '风险识别与应对',
            'resource_allocation': '资源配置优化',
            'data_driven': '数据驱动决策',
            'project_management': '项目管理',
            'process_optimization': '流程优化',
            'quality_management': '质量管理',
            'supply_chain': '供应链协调',
            'cost_control': '成本控制',
            'agile': '敏捷迭代',
            'cross_functional': '跨部门协作',
            'problem_solving': '问题解决',
            'time_management': '时间管理',
            'team_building': '团队建设',
            'recruitment': '人才招聘与选拔',
            'performance_management': '绩效管理',
            'motivation': '激励与认可',
            'conflict_resolution': '冲突解决',
            'empowerment': '授权与赋能',
            'communication': '沟通与影响力',
            'coaching': '教练与辅导',
            'culture': '文化塑造',
            'succession': '继任者培养',
            'emotional_intelligence': '情绪管理',
            'stress_management': '压力应对',
            'self_reflection': '自我反思',
            'growth_mindset': '成长型思维',
            'decision_making': '决策力',
            'empathy': '同理心',
            'resilience': '抗挫折能力',
            'long_term_thinking': '长期主义',
          };
          
          const chineseName = nameMap[input.competencyId];
          if (chineseName) {
            competency = allCompetencies.find(c => c.name === chineseName);
          }
        }
        
        if (!competency) {
          console.error(`[submitAnswer] 能力不存在: ${input.competencyId}, 所有能力:`, allCompetencies.map(c => ({ id: c.id, name: c.name })));
          throw new TRPCError({ code: "NOT_FOUND", message: `能力不存在: ${input.competencyId}` });
        }
        
        const allUserCompetencies = await db.getUserCompetencies(ctx.user.id);
        const existingCompetency = allUserCompetencies.find(c => c.competencyId === competency.id);
        
        // 使用公式计算综合得分：score = (selfAssessed * 0.2 + aiAssessed * 0.3 + questionnaireScore * 0.5) * 20
        const selfAssessed = existingCompetency?.selfAssessed || 0;
        const aiAssessed = existingCompetency?.aiAssessed || 0;
        const questionnaireScore = avgQuestionnaireLevel;
        
        const { weightedLevel, finalScore } = calculateWeightedScore({
          questionnaireScore,
          aiAssessed,
          selfAssessed,
        });
        const newLevel = determineLevel(weightedLevel);
        
        // 更新用户能力记录
        await db.upsertUserCompetency({
          userId: ctx.user.id,
          competencyId: competency.id,
          currentLevel: newLevel,
          selfAssessed,
          aiAssessed,
          questionnaireScore,
          score: finalScore,
          practiceCount: existingCompetency?.practiceCount || 0,
          lastPracticed: existingCompetency?.lastPracticed,
          status: finalScore >= 80 ? 'mastered' : finalScore >= 60 ? 'learning' : 'not_started',
        });
        
        return { 
          success: true, 
          newScore: finalScore,
          newLevel,
        };
      }),
    
    // 完成评估会话并更新能力数据
    completeSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        answers: z.array(z.object({
          competencyName: z.string(), // 使用能力名称而非ID
          assessedLevel: z.number(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        // 更新会话状态
        await db.updateAssessmentSession(input.sessionId, {
          status: "completed",
          completedAt: new Date(),
        });
        
        // 获取所有能力定义
        const allCompetencies = await db.getAllCompetencies();
        
        // 根据答题结果更新用户能力数据
        for (const answer of input.answers) {
          // 通过名称查找能力ID
          const competency = allCompetencies.find(c => c.name === answer.competencyName);
          if (!competency) continue;
          
          const allUserCompetencies = await db.getUserCompetencies(ctx.user.id);
          const existingCompetency = allUserCompetencies.find(c => c.competencyId === competency.id);
          
          if (existingCompetency) {
            // 更新现有能力评分（使用加权平均算法）
            const newQuestionnaireScore = answer.assessedLevel;
            const { weightedLevel, finalScore } = calculateWeightedScore({
              questionnaireScore: newQuestionnaireScore,
              aiAssessed: existingCompetency.aiAssessed || 0,
              selfAssessed: existingCompetency.selfAssessed || 0,
            });
            const newLevel = determineLevel(weightedLevel);
            
            await db.upsertUserCompetency({
              userId: ctx.user.id,
              competencyId: competency.id,
              currentLevel: newLevel,
              selfAssessed: existingCompetency.selfAssessed,
              aiAssessed: existingCompetency.aiAssessed,
              questionnaireScore: newQuestionnaireScore,
              score: finalScore,
              practiceCount: existingCompetency.practiceCount,
              lastPracticed: existingCompetency.lastPracticed,
              status: finalScore >= 80 ? 'mastered' : finalScore >= 60 ? 'learning' : 'not_started',
            });
          } else {
            // 创建新的能力记录（只有问卷得分）
            const { weightedLevel, finalScore } = calculateWeightedScore({
              questionnaireScore: answer.assessedLevel,
              aiAssessed: 0,
              selfAssessed: 0,
            });
            const newLevel = determineLevel(weightedLevel);
            
            await db.upsertUserCompetency({
              userId: ctx.user.id,
              competencyId: competency.id,
              currentLevel: newLevel,
              selfAssessed: 0,
              aiAssessed: 0,
              questionnaireScore: answer.assessedLevel,
              score: finalScore,
              practiceCount: 0,
              lastPracticed: new Date(),
              status: "learning",
            });
          }
        }
        
        return { success: true };
      }),
    
    // 获取用户的评估历史
    getUserSessions: protectedProcedure
      .query(async ({ ctx }) => {
        const sessions = await db.getUserAssessmentSessions(ctx.user.id);
        return sessions;
      }),
    
    // 获取用户的答题记录
    getUserAnswers: protectedProcedure
      .input(z.object({
        sessionType: z.enum(["initial", "validation"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const answers = await db.getUserAnswers(ctx.user.id, input.sessionType);
        return answers;
      }),
    
    // 获取学习资料推荐
    getLearningResources: protectedProcedure
      .input(z.object({
        competencyName: z.string(),
        questionScenario: z.string().optional(),
        userLevel: z.number().min(1).max(5).optional(),
      }))
      .query(async ({ input }) => {
        const prompt = `作为一个管理能力提升专家，请为「${input.competencyName}」能力推荐3篇学习资料。

${input.questionScenario ? `场景背景：${input.questionScenario}` : ''}
${input.userLevel ? `用户当前等级：L${input.userLevel}` : ''}

请返回JSON格式，包含3个学习资料，每个资料包含：
- title: 资料标题（简洁有吸引力）
- description: 资料简介（50-100字）
- keyPoints: 学习要点数组（3-5个要点）
- resourceType: 资料类型（“文章”、“视频”、“课程”、“书籍”之一）
- difficulty: 难度等级（1-5，1最简单）

要求：
1. 资料应该具有实用性和可操作性
2. 难度递进，从基础到进阶
3. 结合实际工作场景
4. 提供明确的学习路径`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "你是一个管理能力提升专家，擅长推荐学习资料。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "learning_resources",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        keyPoints: {
                          type: "array",
                          items: { type: "string" },
                        },
                        resourceType: { type: "string" },
                        difficulty: { type: "number" },
                      },
                      required: ["title", "description", "keyPoints", "resourceType", "difficulty"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["resources"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI返回内容为空" });
        }

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const result = JSON.parse(contentStr);
        return result.resources;
      }),
    
    // ==================== 管理后台API ====================
    // 获取所有题目（管理员）
    getAllQuestions: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以访问" });
        }
        return await db.getAllQuestions();
      }),
    
    // 创建题目（管理员）
    createQuestion: protectedProcedure
      .input(z.object({
        competencyId: z.string(),
        questionType: z.enum(["initial", "validation"]),
        scenario: z.string(),
        question: z.string(),
        options: z.string(), // JSON string
        difficulty: z.number().min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以创建题目" });
        }
        const questionId = await db.createQuestion(input);
        return { id: questionId, success: true };
      }),
    
    // 更新题目（管理员）
    updateQuestion: protectedProcedure
      .input(z.object({
        id: z.number(),
        competencyId: z.string(),
        questionType: z.enum(["initial", "validation"]),
        scenario: z.string(),
        question: z.string(),
        options: z.string(),
        difficulty: z.number().min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以更新题目" });
        }
        await db.updateQuestion(input.id, {
          competencyId: input.competencyId,
          questionType: input.questionType,
          scenario: input.scenario,
          question: input.question,
          options: input.options,
          difficulty: input.difficulty,
        });
        return { success: true };
      }),
    
    // 删除题目（管理员）
    deleteQuestion: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以删除题目" });
        }
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
    
    // 获取答题统计（管理员）
    getStatistics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以查看统计" });
        }
        return await db.getQuestionStatistics();
      }),
  }),

  // ==================== 学习路径推荐 ====================
  learning: router({
    // 生成学习路径推荐
    generatePath: protectedProcedure
      .input(z.object({
        competencyId: z.string(),
        targetLevel: z.number().min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        // 获取用户当前能力等级
        const allCompetencies = await db.getAllCompetencies();
        const competency = allCompetencies.find(c => c.name === input.competencyId);
        
        if (!competency) {
          throw new TRPCError({ code: "NOT_FOUND", message: "能力不存在" });
        }
        
        const userCompetency = await db.getUserCompetency(ctx.user.id, competency.id);
        const currentLevel = userCompetency ? Math.round(userCompetency.currentLevel) : 1;
        
        if (currentLevel >= input.targetLevel) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "您的当前能力等级已达到或超过目标等级" 
          });
        }
        
        // 使用AI生成学习路径
        const prompt = `作为一位经验丰富的管理能力发展顾问，请为以下能力发展需求生成个性化学习路径：

**能力名称**：${competency.name}
**能力描述**：${competency.description}
**当前等级**：L${currentLevel}
**目标等级**：L${input.targetLevel}

请提供：
1. **学习路径标题**：简洁有吸引力的标题
2. **路径描述**：详细说明学习路径的目标和价值
3. **预计时长**：例如"3个月"、"6周"
4. **学习资源**：6-10个适合的学习资源，包括：
   - 课程（在线课程、MBA课程等）
   - 书籍（经典管理书籍）
   - 文章（权威文章、案例分析）
   - 视频（TED演讲、大师讲座）
   - 实践项目（实际工作中可以尝试的项目）

每个资源请包含：
- title: 资源名称
- type: "course"|"book"|"article"|"video"|"project"|"practice"
- description: 详细描述
- url: 链接（如果有）
- author: 作者或机构
- platform: 平台（如Coursera、得到、知乎等）
- difficulty: "beginner"|"intermediate"|"advanced"
- estimatedTime: 预计学习时长

请以JSON格式返回：
{
  "title": "学习路径标题",
  "description": "路径描述",
  "estimatedDuration": "预计时长",
  "resources": [
    {
      "title": "资源名称",
      "type": "course",
      "description": "资源描述",
      "url": "https://...",
      "author": "作者",
      "platform": "平台",
      "difficulty": "intermediate",
      "estimatedTime": "4周"
    }
  ]
}`;
        
        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位经验丰富的管理能力发展顾问。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "learning_path",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  estimatedDuration: { type: "string" },
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        type: { type: "string", enum: ["course", "book", "article", "video", "project", "practice"] },
                        description: { type: "string" },
                        url: { type: "string" },
                        author: { type: "string" },
                        platform: { type: "string" },
                        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        estimatedTime: { type: "string" },
                      },
                      required: ["title", "type", "description", "difficulty", "estimatedTime"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "description", "estimatedDuration", "resources"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const messageContent = aiResponse.choices[0].message.content;
        const contentString = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
        const pathData = JSON.parse(contentString || "{}");
        
        // 创建学习路径
        const pathId = await db.createLearningPath({
          userId: ctx.user.id,
          competencyId: input.competencyId,
          currentLevel,
          targetLevel: input.targetLevel,
          title: pathData.title,
          description: pathData.description,
          estimatedDuration: pathData.estimatedDuration,
        });
        
        // 创建学习资源
        for (let i = 0; i < pathData.resources.length; i++) {
          const resource = pathData.resources[i];
          await db.createLearningResource({
            pathId,
            type: resource.type,
            title: resource.title,
            description: resource.description,
            url: resource.url || "",
            author: resource.author || "",
            platform: resource.platform || "",
            difficulty: resource.difficulty,
            estimatedTime: resource.estimatedTime,
            order: i + 1,
          });
        }
        
        return { pathId, ...pathData };
      }),
    
    // 获取用户的所有学习路径
    getMyPaths: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserLearningPaths(ctx.user.id);
      }),
    
    // 获取学习路径详情
    getPathDetail: protectedProcedure
      .input(z.object({
        pathId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const path = await db.getLearningPathById(input.pathId);
        if (!path || path.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "学习路径不存在" });
        }
        
        const resources = await db.getLearningResourcesByPath(input.pathId);
        const progressList = await db.getAllLearningProgressForPath(ctx.user.id, input.pathId);
        
        // 合并资源和进度
        const resourcesWithProgress = resources.map(resource => {
          const progress = progressList.find(p => p.resourceId === resource.id);
          return {
            ...resource,
            progress: progress || { status: "not_started", progress: 0 },
          };
        });
        
        return {
          ...path,
          resources: resourcesWithProgress,
        };
      }),
    
    // 更新学习进度
    updateProgress: protectedProcedure
      .input(z.object({
        resourceId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updateData: any = {
          userId: ctx.user.id,
          resourceId: input.resourceId,
        };
        
        if (input.status) updateData.status = input.status;
        if (input.progress !== undefined) updateData.progress = input.progress;
        if (input.notes !== undefined) updateData.notes = input.notes;
        
        // 如果状态变为 in_progress 且还没有 startedAt，设置 startedAt
        if (input.status === "in_progress") {
          const existing = await db.getUserLearningProgress(ctx.user.id, input.resourceId);
          if (!existing || !existing.startedAt) {
            updateData.startedAt = new Date();
          }
        }
        
        // 如果状态变为 completed，设置 completedAt
        if (input.status === "completed") {
          updateData.completedAt = new Date();
          updateData.progress = 100;
        }
        
        await db.updateLearningProgress(updateData);
        
        return { success: true };
      }),
    
    // 获取推荐学习资源（基于能力分数和答题表现）
    getRecommendedResources: protectedProcedure
      .input(z.object({
        competencyId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        // 获取用户能力数据
        const allCompetencies = await db.getAllCompetencies();
        const competency = allCompetencies.find(c => c.id.toString() === input.competencyId);
        
        if (!competency) {
          throw new TRPCError({ code: "NOT_FOUND", message: "能力不存在" });
        }
        
        const userCompetency = await db.getUserCompetency(ctx.user.id, competency.id);
        
        const currentScore = userCompetency?.score || 0;
        const currentLevel = userCompetency?.currentLevel || 1;
        
        // 使用AI生成个性化资源推荐
        const prompt = `作为一位经验丰富的管理能力发展顾问，请为以下能力发展需求推荐学习资源：

**能力名称**：${competency.name}
**能力描述**：${competency.description}
**当前分数**：${currentScore}/100
**当前等级**：L${Math.round(currentLevel)}

请推荐5-8个最适合当前水平的学习资源，帮助用户提升该能力。资源类型包括：
- 文章（article）：权威文章、案例分析、行业报告
- 视频（video）：TED演讲、大师讲座、实战分享
- 实战项目（project）：可以在工作中尝试的实际项目

每个资源请包含：
- title: 资源名称
- type: "article"|"video"|"project"
- description: 详细描述（为什么推荐、能学到什么）
- url: 链接（真实可访问的链接，如果没有则为空字符串）
- author: 作者或机构
- difficulty: "beginner"|"intermediate"|"advanced"（根据当前等级L${Math.round(currentLevel)}推荐合适难度）
- estimatedTime: 预计学习时长（如"30分钟"、"2小时"、"1周"）
- reason: 推荐理由（1-2句话说明为什么适合当前水平）

请以JSON格式返回：
{
  "resources": [
    {
      "title": "资源名称",
      "type": "article",
      "description": "资源描述",
      "url": "https://...",
      "author": "作者",
      "difficulty": "intermediate",
      "estimatedTime": "30分钟",
      "reason": "推荐理由"
    }
  ]
}`;
        
        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位经验丰富的管理能力发展顾问。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "resource_recommendations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        type: { type: "string", enum: ["article", "video", "project"] },
                        description: { type: "string" },
                        url: { type: "string" },
                        author: { type: "string" },
                        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        estimatedTime: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["title", "type", "description", "url", "author", "difficulty", "estimatedTime", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["resources"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const messageContent = aiResponse.choices[0].message.content;
        const contentString = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
        const result = JSON.parse(contentString || "{}");
        
        return {
          competency: {
            id: competency.id,
            name: competency.name,
            currentScore,
            currentLevel: Math.round(currentLevel),
          },
          resources: result.resources || [],
        };
      }),
  }),

  // 职位推荐系统
  positionRecommendation: router({
    // 基于能力分数、成长速度和学习历史推荐职位
    recommend: protectedProcedure.query(async ({ ctx }) => {
      // 获取用户能力评估
      const userCompetencies = await db.getUserCompetencies(ctx.user.id);
      if (!userCompetencies || userCompetencies.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '请先完成能力评估' });
      }

      // 获取用户能力成长趋势（最近6个月）
      const growthTrends = await db.getUserCapabilityTrends(ctx.user.id, 6);
      
      // 计算成长速度（如果有历史数据）
      let growthRate = 0; // 0-1之间，0=无成长，1=快速成长
      if (growthTrends && growthTrends.length >= 2) {
        const firstSnapshot = growthTrends[0];
        const lastSnapshot = growthTrends[growthTrends.length - 1];
        const avgScoreFirst = firstSnapshot.avgScore || 0;
        const avgScoreLast = lastSnapshot.avgScore || 0;
        const scoreDiff = avgScoreLast - avgScoreFirst;
        // 假设6个月增长20分为快速成长
        growthRate = Math.min(Math.max(scoreDiff / 20, 0), 1);
      }

      // 获取答题历史（学习积极性）
      const dbInstance = await getDb();
      const answerHistory = dbInstance ? await dbInstance.select()
        .from(userAnswers)
        .where(eq(userAnswers.userId, ctx.user.id))
        .limit(100) : [];
      
      // 计算学习积极性（0-1之间）
      const learningActivity = Math.min(answerHistory.length / 50, 1); // 50道题为积极

      // 获取所有职位
      const allPositions = await db.getAllPositions();
      
      // 为每个职位计算匹配度
      const recommendations = [];
      
      for (const position of allPositions) {
        // 获取职位的能力要求
        const positionCompetencies = await db.getPositionCompetencies(position.id);
        
        if (positionCompetencies.length === 0) continue;
        
        // 计算匹配度
        let totalMatch = 0;
        let totalWeight = 0;
        const gaps = [];
        
        for (const posComp of positionCompetencies) {
          const userComp = userCompetencies.find(uc => uc.competencyId === posComp.competencyId);
          const userLevel = userComp ? userComp.currentLevel : 0;
          const requiredLevel = posComp.requiredLevel;
          const importance = posComp.importance;
          
          // 匹配度 = min(userLevel / requiredLevel, 1) * importance
          const match = Math.min(userLevel / requiredLevel, 1.2) * importance; // 允许超过20%
          totalMatch += match;
          totalWeight += importance;
          
          if (userLevel < requiredLevel) {
            gaps.push({
              competencyName: posComp.competencyName,
              currentLevel: userLevel,
              requiredLevel,
              gap: requiredLevel - userLevel,
            });
          }
        }
        
        // 基础匹配度
        const baseMatchScore = (totalMatch / totalWeight) * 100;
        
        // 成长潜力加成（快速成长的用户可以推荐更高要求的职位）
        const growthBonus = growthRate * 10; // 最多+10分
        const learningBonus = learningActivity * 5; // 最多+5分
        
        // 最终匹配度 = 基础匹配度 + 成长加成
        const finalMatchScore = Math.min(baseMatchScore + growthBonus + learningBonus, 120); // 最高120分
        
        // 计算推荐类型
        let recommendationType = 'current'; // current/stretch/aspirational
        if (baseMatchScore >= 80) {
          recommendationType = 'current'; // 当前能力匹配
        } else if (baseMatchScore >= 60 && (growthRate > 0.5 || learningActivity > 0.5)) {
          recommendationType = 'stretch'; // 有挑战性但可达成
        } else if (baseMatchScore >= 40 && growthRate > 0.7 && learningActivity > 0.7) {
          recommendationType = 'aspirational'; // 需要持续成长
        }
        
        recommendations.push({
          position,
          matchScore: Math.round(finalMatchScore),
          baseMatchScore: Math.round(baseMatchScore),
          growthBonus: Math.round(growthBonus),
          learningBonus: Math.round(learningBonus),
          recommendationType,
          gaps: gaps.sort((a, b) => b.gap - a.gap).slice(0, 5),
          totalCompetencies: positionCompetencies.length,
          metRequirements: positionCompetencies.length - gaps.length,
        });
      }
      
      // 按匹配度排序，返回前10个
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
    }),

    // 获取职位发展路径
    getCareerPath: protectedProcedure
      .input(z.object({
        currentPositionId: z.number(),
        targetPositionId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const currentPos = await db.getPositionById(input.currentPositionId);
        const targetPos = await db.getPositionById(input.targetPositionId);
        
        if (!currentPos || !targetPos) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '职位不存在' });
        }
        
        // 获取两个职位的能力要求
        const currentCompetencies = await db.getPositionCompetencies(input.currentPositionId);
        const targetCompetencies = await db.getPositionCompetencies(input.targetPositionId);
        
        // 找出需要提升的能力
        const competenciesToImprove = [];
        
        for (const targetComp of targetCompetencies) {
          const currentComp = currentCompetencies.find(c => c.competencyId === targetComp.competencyId);
          const currentLevel = currentComp?.requiredLevel || 0;
          const targetLevel = targetComp.requiredLevel;
          
          if (targetLevel > currentLevel) {
            competenciesToImprove.push({
              competencyName: targetComp.competencyName,
              currentLevel,
              targetLevel,
              gap: targetLevel - currentLevel,
              importance: targetComp.importance,
            });
          }
        }
        
        return {
          currentPosition: currentPos,
          targetPosition: targetPos,
          competenciesToImprove: competenciesToImprove.sort((a, b) => b.importance - a.importance),
          estimatedTime: `${Math.ceil(competenciesToImprove.length / 2)}-${Math.ceil(competenciesToImprove.length / 1.5)} 个月`,
        };
      }),
  }),

  // 公司组织架构管理
  orgStructure: router({
    // 获取公司组织架构
    getStructure: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const company = await db.getCompanyById(input.companyId);
        if (!company) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '公司不存在' });
        }
        
        // 解析组织架构JSON
        const structure = company.organizationStructure 
          ? JSON.parse(company.organizationStructure) 
          : null;
        
        return {
          companyId: company.id,
          companyName: company.name,
          structure,
        };
      }),

    // 保存组织架构
    saveStructure: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        structure: z.any(), // JSON结构
      }))
      .mutation(async ({ ctx, input }) => {
        const hasPermission = await db.isCompanyAdmin(ctx.user.id, input.companyId);
        if (!hasPermission) {
          throw new TRPCError({ code: 'FORBIDDEN', message: '没有权限' });
        }

        await db.updateCompany(input.companyId, {
          organizationStructure: JSON.stringify(input.structure),
        });

        return { success: true };
      }),

    // 匹配职位（根据岗位名称匹配数据库中的职位）
    matchPositions: protectedProcedure
      .input(z.object({
        positionNames: z.array(z.string()),
      }))
      .query(async ({ ctx, input }) => {
        const matches: Record<string, any> = {};
        
        for (const name of input.positionNames) {
          // 简单的模糊匹配
          const position = await db.findPositionByName(name);
          if (position) {
            // 获取职位的能力要求
            const competencies = await db.getPositionCompetencies(position.id);
            matches[name] = {
              position,
              competencies,
            };
          } else {
            matches[name] = null;
          }
        }
        
        return matches;
      }),

    // 确认公司信息（创建后的信息核对）
    confirmCompanyInfo: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        confirmed: z.boolean(),
        organizationStructure: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const hasPermission = await db.isCompanyAdmin(ctx.user.id, input.companyId);
        if (!hasPermission) {
          throw new TRPCError({ code: 'FORBIDDEN', message: '没有权限' });
        }

        // 如果提供了组织架构，更新它
        if (input.organizationStructure) {
          await db.updateCompany(input.companyId, {
            organizationStructure: JSON.stringify(input.organizationStructure),
          });
        }

        return { success: true };
      }),
  }),


  // ==================== 企业能力评估 ====================
  organizationAssessment: router({
    // 获取企业能力评估
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getOrganizationAssessment(ctx.user.id);
      }),
    
    // 保存企业能力评估
    save: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
        strategyScore: z.number().min(0).max(100),
        operationScore: z.number().min(0).max(100),
        organizationScore: z.number().min(0).max(100),
        innovationScore: z.number().min(0).max(100),
        detailedScores: z.string(), // JSON string with detailed scores
      }))
      .mutation(async ({ ctx, input }) => {
        const assessmentId = await db.saveOrganizationAssessment({
          userId: ctx.user.id,
          ...input,
        });
        
        // Save to history
        await db.saveOrganizationAssessmentHistory({
          userId: ctx.user.id,
          strategyScore: input.strategyScore,
          operationScore: input.operationScore,
          organizationScore: input.organizationScore,
          innovationScore: input.innovationScore,
        });
        
        return { success: true, assessmentId };
      }),
    
    // 获取评估历史
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getOrganizationAssessmentHistory(ctx.user.id, input.limit);
      }),
  }),

  // ==================== 岗位与能力要求 ====================
  positions: router({
    // 获取所有岗位
    getAll: publicProcedure
      .query(async () => {
        return await db.getAllPositions();
      }),
    
    // 获取岗位详情
    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getPositionById(input.id);
      }),
    
    // 获取岗位能力要求
    getCompetencies: publicProcedure
      .input(z.object({
        positionId: z.number(),
      }))
      .query(async ({ input }) => {
        const positionComps = await db.getPositionCompetencies(input.positionId);
        const allComps = await db.getAllCompetencies();
        
        return positionComps.map(pc => ({
          ...pc,
          competencyName: allComps.find(c => c.id === pc.competencyId)?.name || '',
        }));
      }),
  }),

  // ==================== 问卷题库 ====================
  questions: router({
    // 获取指定能力的题目
    getByCompetency: protectedProcedure
      .input(z.object({
        competencyId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getQuestionsByCompetency(input.competencyId);
      }),
    
    // 获取指定类型的题目
    getByType: protectedProcedure
      .input(z.object({
        type: z.enum(["self_assessment", "scenario", "behavioral", "knowledge"]),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return await db.getQuestionsByType(input.type, input.limit);
      }),
    
    // 获取所有题目（管理员）
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return await db.getAllQuestions();
      }),
    
    // 创建题目（管理员）
    create: protectedProcedure
      .input(z.object({
        competencyId: z.number(),
        question: z.string(),
        questionType: z.enum(["self_assessment", "scenario", "behavioral", "knowledge"]),
        option1: z.string(),
        option2: z.string(),
        option3: z.string(),
        option4: z.string(),
        option5: z.string(),
        score1: z.number().default(20),
        score2: z.number().default(40),
        score3: z.number().default(60),
        score4: z.number().default(80),
        score5: z.number().default(100),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        targetLevel: z.number().default(3),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const questionId = await db.createQuestion(input);
        return { success: true, questionId };
      }),
    
    // 更新题目（管理员）
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          question: z.string().optional(),
          option1: z.string().optional(),
          option2: z.string().optional(),
          option3: z.string().optional(),
          option4: z.string().optional(),
          option5: z.string().optional(),
          difficulty: z.enum(["easy", "medium", "hard"]).optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        await db.updateQuestion(input.id, input.data);
        return { success: true };
      }),
    
    // 删除题目（软删除，管理员）
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
    
    // 获取题库统计信息
    getStatistics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return await db.getQuestionStatistics();
      }),
  }),

  // ==================== 学习路径 ====================
  learningPaths: router({
    // 获取用户的学习路径
    getMy: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserLearningPaths(ctx.user.id);
      }),
    
    // 获取路径详情
    getById: protectedProcedure
      .input(z.object({
        pathId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const path = await db.getLearningPathById(input.pathId);
        if (!path || path.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "学习路径不存在" });
        }
        
        const resources = await db.getLearningResourcesByPath(input.pathId);
        const progress = await db.getAllLearningProgressForPath(ctx.user.id, input.pathId);
        
        return {
          ...path,
          resources,
          progress,
        };
      }),
    
    // 基于缺口生成学习路径
    generateFromGaps: protectedProcedure
      .input(z.object({
        competencyIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        const pathId = await db.generateLearningPathFromGaps(ctx.user.id, input.competencyIds);
        if (!pathId) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: "无法生成学习路径，可能是没有相关学习资源" 
          });
        }
        return { success: true, pathId };
      }),
    
    // 更新学习进度
    updateProgress: protectedProcedure
      .input(z.object({
        pathId: z.number(),
        resourceId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed"]),
        progressPercent: z.number().min(0).max(100).optional(),
        timeSpent: z.number().optional(),
        notes: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const progressData: any = {
          userId: ctx.user.id,
          pathId: input.pathId,
          resourceId: input.resourceId,
          status: input.status,
        };
        
        if (input.progressPercent !== undefined) progressData.progressPercent = input.progressPercent;
        if (input.timeSpent !== undefined) progressData.timeSpent = input.timeSpent;
        if (input.notes !== undefined) progressData.notes = input.notes;
        if (input.rating !== undefined) progressData.rating = input.rating;
        
        if (input.status === 'in_progress' && !progressData.startedAt) {
          progressData.startedAt = new Date();
        }
        if (input.status === 'completed') {
          progressData.completedAt = new Date();
          progressData.progressPercent = 100;
        }
        
        await db.updateLearningProgress(progressData);
        
        // Update path progress
        const allProgress = await db.getAllLearningProgressForPath(ctx.user.id, input.pathId);
        const completedCount = allProgress.filter(p => p.status === 'completed').length;
        const path = await db.getLearningPathById(input.pathId);
        
        if (path) {
          await db.updateLearningPath(input.pathId, {
            completedResources: completedCount,
          });
          
          if (completedCount === path.totalResources && path.status !== 'completed') {
            await db.updateLearningPath(input.pathId, {
              status: 'completed',
              completedAt: new Date(),
            });
          }
        }
        
        return { success: true };
      }),
    
    // 获取学习资源
    getResources: protectedProcedure
      .input(z.object({
        competencyId: z.number().optional(),
        type: z.enum(["article", "video", "book", "course"]).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        let query = db.select().from(learningResources);
        
        if (input.competencyId) {
          query = query.where(eq(learningResources.competencyId, input.competencyId)) as any;
        }
        
        return await query;
      }),
  }),

  // ==================== 管理员功能 ====================
  admin: router({
    // 手动触发能力快照
    triggerSnapshot: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "Only administrators can trigger snapshots" 
          });
        }
        
        const { manualSnapshotTrigger } = await import("./cronJobs");
        const result = await manualSnapshotTrigger();
        
        return result;
      }),
    
    // 获取系统统计信息
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        
        return await db.getAdminStats();
      }),
    
    // 获取所有用户
    getAllUsers: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        
        return await db.getAllUsersWithStats();
      }),
  }),

  // ==================== Wiki功能介绍系统 ====================
  wiki: router({
    // 获取所有分类
    getCategories: publicProcedure
      .query(async () => {
        return await wikiDb.getAllWikiCategories();
      }),
    
    // 获取分类下的文章列表
    getArticlesByCategory: publicProcedure
      .input(z.object({
        categoryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await wikiDb.getArticlesByCategory(input.categoryId);
      }),
    
    // 获取单篇文章
    getArticle: publicProcedure
      .input(z.object({
        slug: z.string(),
      }))
      .query(async ({ input }) => {
        const article = await wikiDb.getWikiArticleBySlug(input.slug);
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "文章不存在" });
        }
        return article;
      }),
    
    // 搜索文章
    search: publicProcedure
      .input(z.object({
        keyword: z.string(),
      }))
      .query(async ({ input }) => {
        return await wikiDb.searchWikiArticles(input.keyword);
      }),
    
    // 获取所有文章（含分类信息）
    getAllArticles: publicProcedure
      .query(async () => {
        return await wikiDb.getAllWikiArticlesWithCategory();
      }),
  }),
  
  // Aliases for consistency with routers-d1.ts (plural forms)
  industries: router({
    list: publicProcedure.query(async () => {
      const database = await db.getDb();
      if (!database) return [];
      return await database.select().from(industries).orderBy(industries.name);
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return null;
        const [industry] = await database.select().from(industries).where(eq(industries.id, input.id)).limit(1);
        return industry || null;
      }),
  }),
});

export type AppRouter = typeof appRouter;
