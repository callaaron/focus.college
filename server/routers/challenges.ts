/**
 * 挑战系统 tRPC Router
 * 提供每日挑战、答题、积分、排行榜等功能
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { 
  challenges, 
  userChallenges, 
  dailyChallenges, 
  userPoints,
  achievements,
  userAchievements 
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const challengesRouter = router({
  /**
   * 获取今日挑战
   */
  getDailyChallenge: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库连接失败' });
    }

    const userId = ctx.user!.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 查找今日是否已分配挑战
    let dailyChallenge = await database
      .select()
      .from(dailyChallenges)
      .where(and(
        eq(dailyChallenges.userId, userId),
        eq(dailyChallenges.assignedDate, today)
      ))
      .limit(1);

    // 如果没有，随机分配一个
    if (dailyChallenge.length === 0) {
      // 获取用户已完成的挑战ID
      const completedChallengeIds = await database
        .select({ challengeId: userChallenges.challengeId })
        .from(userChallenges)
        .where(eq(userChallenges.userId, userId));
      
      const completedIds = completedChallengeIds.map(c => c.challengeId);

      // 获取未完成的挑战（如果全部完成，则重新开始）
      const availableChallenges = await database
        .select()
        .from(challenges)
        .where(eq(challenges.isActive, true))
        .limit(100);

      if (availableChallenges.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '暂无可用挑战' });
      }

      // 优先选择未完成的，如果都完成了就随机选
      let selectedChallenge = availableChallenges.find(
        c => !completedIds.includes(c.id)
      ) || availableChallenges[Math.floor(Math.random() * availableChallenges.length)];

      // 分配今日挑战
      await database.insert(dailyChallenges).values({
        userId,
        challengeId: selectedChallenge.id,
        assignedDate: today,
        isCompleted: false,
      });

      dailyChallenge = [{
        userId,
        challengeId: selectedChallenge.id,
        assignedDate: today,
        isCompleted: false,
      }];
    }

    // 获取挑战详情
    const challenge = await database
      .select()
      .from(challenges)
      .where(eq(challenges.id, dailyChallenge[0].challengeId))
      .limit(1);

    if (challenge.length === 0) {
      throw new TRPCError({ code: 'NOT_FOUND', message: '挑战不存在' });
    }

    // 解析JSON字段
    const challengeData = challenge[0];
    return {
      ...challengeData,
      scenario: JSON.parse(challengeData.scenario as string),
      options: JSON.parse(challengeData.options as string),
      tags: challengeData.tags ? JSON.parse(challengeData.tags as string) : [],
      isCompleted: dailyChallenge[0].isCompleted,
      assignedDate: dailyChallenge[0].assignedDate,
    };
  }),

  /**
   * 提交挑战答案
   */
  submitAnswer: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      selectedAnswer: z.number(),
      timeSpent: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库连接失败' });
      }

      const userId = ctx.user!.id;
      const today = new Date().toISOString().split('T')[0];

      // 获取挑战信息
      const challenge = await database
        .select()
        .from(challenges)
        .where(eq(challenges.id, input.challengeId))
        .limit(1);

      if (challenge.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '挑战不存在' });
      }

      const challengeData = challenge[0];
      const isCorrect = input.selectedAnswer === challengeData.correctAnswer;
      const pointsEarned = isCorrect ? challengeData.points : 0;

      // 检查是否已经回答过
      const existingAttempt = await database
        .select()
        .from(userChallenges)
        .where(and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, input.challengeId)
        ))
        .orderBy(desc(userChallenges.attemptNumber))
        .limit(1);

      const attemptNumber = existingAttempt.length > 0 
        ? existingAttempt[0].attemptNumber + 1 
        : 1;

      // 记录答题
      await database.insert(userChallenges).values({
        userId,
        challengeId: input.challengeId,
        selectedAnswer: input.selectedAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: input.timeSpent || 0,
        attemptNumber,
      });

      // 更新每日挑战状态
      await database
        .update(dailyChallenges)
        .set({ 
          isCompleted: true,
          completedAt: new Date()
        })
        .where(and(
          eq(dailyChallenges.userId, userId),
          eq(dailyChallenges.challengeId, input.challengeId),
          eq(dailyChallenges.assignedDate, today)
        ));

      // 更新用户积分
      await updateUserPoints(database, userId, isCorrect, pointsEarned);

      return {
        isCorrect,
        pointsEarned,
        correctAnswer: challengeData.correctAnswer,
        explanation: challengeData.explanation,
      };
    }),

  /**
   * 获取用户统计数据
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库连接失败' });
    }

    const userId = ctx.user!.id;

    // 获取或创建用户积分记录
    let userPointsData = await database
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    if (userPointsData.length === 0) {
      await database.insert(userPoints).values({
        userId,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalChallenges: 0,
        correctCount: 0,
      });

      userPointsData = await database
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId))
        .limit(1);
    }

    return userPointsData[0];
  }),

  /**
   * 获取挑战历史
   */
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库连接失败' });
      }

      const userId = ctx.user!.id;

      const history = await database
        .select({
          id: userChallenges.id,
          challengeId: userChallenges.challengeId,
          selectedAnswer: userChallenges.selectedAnswer,
          isCorrect: userChallenges.isCorrect,
          pointsEarned: userChallenges.pointsEarned,
          timeSpent: userChallenges.timeSpent,
          completedAt: userChallenges.completedAt,
          challengeTitle: challenges.title,
          challengeDifficulty: challenges.difficulty,
        })
        .from(userChallenges)
        .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
        .where(eq(userChallenges.userId, userId))
        .orderBy(desc(userChallenges.completedAt))
        .limit(input.limit)
        .offset(input.offset);

      return history;
    }),

  /**
   * 获取排行榜
   */
  getLeaderboard: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库连接失败' });
      }

      // 获取排行榜（按总积分排序）
      const leaderboard = await database
        .select({
          userId: userPoints.userId,
          totalPoints: userPoints.totalPoints,
          currentStreak: userPoints.currentStreak,
          totalChallenges: userPoints.totalChallenges,
          correctCount: userPoints.correctCount,
          rank: userPoints.rank,
        })
        .from(userPoints)
        .orderBy(desc(userPoints.totalPoints))
        .limit(input.limit);

      // 获取用户信息
      // 注意：这里需要join users表，暂时返回userId
      return leaderboard;
    }),
});

/**
 * 更新用户积分统计
 */
async function updateUserPoints(
  database: any,
  userId: number,
  isCorrect: boolean,
  pointsEarned: number
) {
  const today = new Date().toISOString().split('T')[0];

  // 获取现有记录
  const existing = await database
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    // 创建新记录
    await database.insert(userPoints).values({
      userId,
      totalPoints: pointsEarned,
      currentStreak: 1,
      longestStreak: 1,
      totalChallenges: 1,
      correctCount: isCorrect ? 1 : 0,
      lastCompletedDate: today,
    });
  } else {
    const current = existing[0];
    const lastDate = current.lastCompletedDate;
    
    // 计算连续天数
    let newStreak = current.currentStreak;
    if (lastDate) {
      const lastDateTime = new Date(lastDate).getTime();
      const todayTime = new Date(today).getTime();
      const daysDiff = Math.floor((todayTime - lastDateTime) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // 连续打卡
        newStreak = current.currentStreak + 1;
      } else if (daysDiff > 1) {
        // 断签
        newStreak = 1;
      }
      // daysDiff === 0 说明今天已经打卡过，不增加
    }

    const newLongestStreak = Math.max(current.longestStreak, newStreak);

    // 更新记录
    await database
      .update(userPoints)
      .set({
        totalPoints: current.totalPoints + pointsEarned,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalChallenges: current.totalChallenges + 1,
        correctCount: current.correctCount + (isCorrect ? 1 : 0),
        lastCompletedDate: today,
      })
      .where(eq(userPoints.userId, userId));
  }
}
