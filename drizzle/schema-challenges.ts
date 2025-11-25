import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * 挑战系统数据库Schema
 * 包含挑战题库、用户挑战记录、积分等
 */

// 挑战题库表
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // 挑战标题
  description: text("description").notNull(), // 场景描述
  scenario: text("scenario").notNull(), // 详细场景（JSON）
  question: text("question").notNull(), // 问题描述
  options: text("options").notNull(), // 选项（JSON数组）
  correctAnswer: int("correctAnswer").notNull(), // 正确答案索引 (0-based)
  explanation: text("explanation").notNull(), // 答案解析
  competencyId: int("competencyId").notNull(), // 关联能力ID
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(), // 难度
  points: int("points").default(10).notNull(), // 完成可获得积分
  tags: text("tags"), // 标签（JSON数组）
  isActive: boolean("isActive").default(true).notNull(), // 是否启用
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// 用户挑战记录表
export const userChallenges = mysqlTable("userChallenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 用户ID
  challengeId: int("challengeId").notNull(), // 挑战ID
  selectedAnswer: int("selectedAnswer").notNull(), // 用户选择的答案
  isCorrect: boolean("isCorrect").notNull(), // 是否正确
  pointsEarned: int("pointsEarned").default(0).notNull(), // 获得积分
  timeSpent: int("timeSpent"), // 用时（秒）
  attemptNumber: int("attemptNumber").default(1).notNull(), // 第几次尝试
  completedAt: timestamp("completedAt").defaultNow().notNull(), // 完成时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// 每日挑战分配表
export const dailyChallenges = mysqlTable("dailyChallenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 用户ID
  challengeId: int("challengeId").notNull(), // 挑战ID
  assignedDate: varchar("assignedDate", { length: 10 }).notNull(), // 分配日期 YYYY-MM-DD
  isCompleted: boolean("isCompleted").default(false).notNull(), // 是否完成
  completedAt: timestamp("completedAt"), // 完成时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;

// 用户积分统计表
export const userPoints = mysqlTable("userPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // 用户ID
  totalPoints: int("totalPoints").default(0).notNull(), // 总积分
  currentStreak: int("currentStreak").default(0).notNull(), // 当前连续天数
  longestStreak: int("longestStreak").default(0).notNull(), // 最长连续天数
  totalChallenges: int("totalChallenges").default(0).notNull(), // 完成挑战总数
  correctCount: int("correctCount").default(0).notNull(), // 正确次数
  lastCompletedDate: varchar("lastCompletedDate", { length: 10 }), // 最后完成日期
  rank: int("rank"), // 排名
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = typeof userPoints.$inferInsert;

// 成就表
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // 成就代码
  name: varchar("name", { length: 100 }).notNull(), // 成就名称
  description: text("description").notNull(), // 成就描述
  icon: varchar("icon", { length: 50 }), // 图标
  category: mysqlEnum("category", ["streak", "count", "accuracy", "special"]).notNull(), // 类别
  requirement: int("requirement").notNull(), // 达成要求（数值）
  points: int("points").default(0).notNull(), // 成就积分
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(), // 稀有度
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// 用户成就表
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 用户ID
  achievementId: int("achievementId").notNull(), // 成就ID
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(), // 解锁时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
