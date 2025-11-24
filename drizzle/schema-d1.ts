import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * SQLite (Cloudflare D1) Schema
 * Converted from MySQL schema for D1 compatibility
 * 
 * Key Changes:
 * - mysqlTable → sqliteTable
 * - int().autoincrement() → integer({ mode: 'number' }).primaryKey({ autoIncrement: true })
 * - timestamp() → integer({ mode: 'timestamp' })
 * - mysqlEnum() → text() with check constraints or direct text storage
 * - varchar() → text()
 * - boolean() → integer({ mode: 'boolean' })
 */

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  openId: text("openId").unique(),
  username: text("username").unique(),
  passwordHash: text("passwordHash"),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  isDemo: integer("isDemo", { mode: 'boolean' }).default(false).notNull(),
  demoRole: text("demoRole"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 用户画像表
export const userProfiles = sqliteTable("userProfiles", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().unique(),
  industry: text("industry"),
  industryId: integer("industryId"),
  companySize: text("companySize", { enum: ["startup", "small", "medium", "large"] }),
  companyStage: text("companyStage", { 
    enum: ["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]
  }).default("seed"),
  currentRole: text("currentRole"),
  positionId: integer("positionId"),
  managementLevel: text("managementLevel", { enum: ["executive", "senior", "middle", "junior"] }),
  yearsOfManagement: integer("yearsOfManagement").default(0),
  directReports: integer("directReports").default(0),
  teamSize: integer("teamSize").default(0),
  profileCompleted: integer("profileCompleted", { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// 能力域表（三层级：模块→能力域→能力）
export const competencyDomains = sqliteTable("competencyDomains", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  module: text("module").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type CompetencyDomain = typeof competencyDomains.$inferSelect;
export type InsertCompetencyDomain = typeof competencyDomains.$inferInsert;

// 能力表
export const competencies = sqliteTable("competencies", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  domainId: integer("domainId").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  isCore: integer("isCore", { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

// 能力评分表（支持多来源评分）
export const competencyScores = sqliteTable("competencyScores", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  competencyId: integer("competencyId").notNull(),
  questionnaireScore: integer("questionnaireScore").default(0),
  selfAssessmentScore: integer("selfAssessmentScore").default(0),
  aiAnalysisScore: integer("aiAnalysisScore").default(0),
  evidenceScore: integer("evidenceScore").default(0),
  finalScore: integer("finalScore").default(0),
  level: integer("level").default(1),
  questionnaireWeight: integer("questionnaireWeight").default(40),
  selfAssessmentWeight: integer("selfAssessmentWeight").default(20),
  aiAnalysisWeight: integer("aiAnalysisWeight").default(30),
  evidenceWeight: integer("evidenceWeight").default(10),
  practiceCount: integer("practiceCount").default(0),
  lastPracticeAt: integer("lastPracticeAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type CompetencyScore = typeof competencyScores.$inferSelect;
export type InsertCompetencyScore = typeof competencyScores.$inferInsert;

// 能力快照表（历史记录，用于趋势图）
export const competencySnapshots = sqliteTable("competencySnapshots", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  competencyId: integer("competencyId").notNull(),
  score: integer("score").notNull(),
  level: integer("level").notNull(),
  snapshotDate: integer("snapshotDate", { mode: 'timestamp' }).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type CompetencySnapshot = typeof competencySnapshots.$inferSelect;
export type InsertCompetencySnapshot = typeof competencySnapshots.$inferInsert;

// 问题场景表（今日挑战）
export const scenarios = sqliteTable("scenarios", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  companyStage: text("companyStage", {
    enum: ["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]
  }),
  analysis: text("analysis"),
  suggestions: text("suggestions"),
  relatedCompetencies: text("relatedCompetencies"),
  status: text("status", { enum: ["pending", "analyzed", "archived"] }).default("pending").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

// 问卷题库表
export const assessmentQuestions = sqliteTable("assessmentQuestions", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  competencyId: integer("competencyId").notNull(),
  question: text("question").notNull(),
  questionType: text("questionType", { 
    enum: ["self_assessment", "scenario", "behavioral", "knowledge"] 
  }).default("self_assessment").notNull(),
  option1: text("option1").notNull(),
  option2: text("option2").notNull(),
  option3: text("option3").notNull(),
  option4: text("option4").notNull(),
  option5: text("option5").notNull(),
  score1: integer("score1").default(20),
  score2: integer("score2").default(40),
  score3: integer("score3").default(60),
  score4: integer("score4").default(80),
  score5: integer("score5").default(100),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
  targetLevel: integer("targetLevel").default(3),
  usageCount: integer("usageCount").default(0),
  correctRate: integer("correctRate").default(50),
  isActive: integer("isActive", { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = typeof assessmentQuestions.$inferInsert;

// 答题会话表
export const assessmentSessions = sqliteTable("assessmentSessions", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  sessionType: text("sessionType", { enum: ["initial", "regular", "position"] }).default("regular").notNull(),
  totalQuestions: integer("totalQuestions").notNull(),
  answeredQuestions: integer("answeredQuestions").default(0),
  status: text("status", { enum: ["in_progress", "completed", "abandoned"] }).default("in_progress").notNull(),
  startedAt: integer("startedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  completedAt: integer("completedAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type AssessmentSession = typeof assessmentSessions.$inferSelect;
export type InsertAssessmentSession = typeof assessmentSessions.$inferInsert;

// 用户答题记录表
export const userAnswers = sqliteTable("userAnswers", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  sessionId: integer("sessionId").notNull(),
  questionId: integer("questionId").notNull(),
  competencyId: integer("competencyId").notNull(),
  answer: integer("answer").notNull(),
  score: integer("score").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = typeof userAnswers.$inferInsert;

// 行业库表
export const industries = sqliteTable("industries", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  keyCharacteristics: text("keyCharacteristics"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Industry = typeof industries.$inferSelect;
export type InsertIndustry = typeof industries.$inferInsert;

// 职位库表
export const positions = sqliteTable("positions", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(),
  level: text("level", { enum: ["executive", "senior", "middle", "junior"] }).notNull(),
  description: text("description"),
  keyResponsibilities: text("keyResponsibilities"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

// 行业专有能力表
export const industryCompetencies = sqliteTable("industryCompetencies", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  industryId: integer("industryId").notNull(),
  competencyId: integer("competencyId").notNull(),
  importance: integer("importance").default(3).notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type IndustryCompetency = typeof industryCompetencies.$inferSelect;
export type InsertIndustryCompetency = typeof industryCompetencies.$inferInsert;

// 职位专有能力表
export const positionCompetencies = sqliteTable("positionCompetencies", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  positionId: integer("positionId").notNull(),
  competencyId: integer("competencyId").notNull(),
  importance: integer("importance").default(3).notNull(),
  requiredLevel: integer("requiredLevel").default(3).notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type PositionCompetency = typeof positionCompetencies.$inferSelect;
export type InsertPositionCompetency = typeof positionCompetencies.$inferInsert;

// 学习资源表
export const learningResources = sqliteTable("learningResources", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  competencyId: integer("competencyId").notNull(),
  title: text("title").notNull(),
  type: text("type", { enum: ["article", "video", "book", "course"] }).notNull(),
  url: text("url"),
  description: text("description"),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).default("intermediate"),
  estimatedTime: integer("estimatedTime"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = typeof learningResources.$inferInsert;

// 学习路径表
export const learningPaths = sqliteTable("learningPaths", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetCompetencies: text("targetCompetencies").notNull(),
  resourceIds: text("resourceIds").notNull(),
  totalResources: integer("totalResources").default(0),
  completedResources: integer("completedResources").default(0),
  estimatedDays: integer("estimatedDays").default(30),
  status: text("status", { enum: ["active", "completed", "paused"] }).default("active").notNull(),
  startedAt: integer("startedAt", { mode: 'timestamp' }),
  completedAt: integer("completedAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

// 用户学习进度表
export const userLearningProgress = sqliteTable("userLearningProgress", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  pathId: integer("pathId").notNull(),
  resourceId: integer("resourceId").notNull(),
  status: text("status", { enum: ["not_started", "in_progress", "completed"] }).default("not_started").notNull(),
  progressPercent: integer("progressPercent").default(0),
  timeSpent: integer("timeSpent").default(0),
  notes: text("notes"),
  rating: integer("rating"),
  startedAt: integer("startedAt", { mode: 'timestamp' }),
  completedAt: integer("completedAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;

// 成就表
export const achievements = sqliteTable("achievements", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  category: text("category", { enum: ["assessment", "learning", "growth", "social"] }).notNull(),
  type: text("type", { enum: ["one_time", "repeatable", "progressive"] }).default("one_time").notNull(),
  condition: text("condition").notNull(),
  points: integer("points").default(10),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// 用户成就表
export const userAchievements = sqliteTable("userAchievements", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  achievementId: integer("achievementId").notNull(),
  unlockedAt: integer("unlockedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  progress: integer("progress").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

// 公司表
export const companies = sqliteTable("companies", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  industry: text("industry"),
  industryId: integer("industryId"),
  companySize: text("companySize", { enum: ["startup", "small", "medium", "large"] }),
  companyStage: text("companyStage", {
    enum: ["seed", "angel", "series_a", "series_b", "series_c", "series_d", "pre_ipo", "public", "mature"]
  }),
  description: text("description"),
  organizationStructure: text("organizationStructure"),
  ownerId: integer("ownerId").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// 公司成员表
export const companyMembers = sqliteTable("companyMembers", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  companyId: integer("companyId").notNull(),
  userId: integer("userId").notNull(),
  role: text("role", { enum: ["owner", "admin", "member"] }).default("member").notNull(),
  position: text("position"),
  joinedAt: integer("joinedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type CompanyMember = typeof companyMembers.$inferSelect;
export type InsertCompanyMember = typeof companyMembers.$inferInsert;

// 演示账户表
export const demoAccounts = sqliteTable("demoAccounts", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("displayName").notNull(),
  role: text("role").notNull(),
  description: text("description"),
  userId: integer("userId"),
  isActive: integer("isActive", { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type DemoAccount = typeof demoAccounts.$inferSelect;
export type InsertDemoAccount = typeof demoAccounts.$inferInsert;

// 演示数据分析表
export const demoAccountAnalytics = sqliteTable("demoAccountAnalytics", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  demoAccountId: integer("demoAccountId").notNull(),
  sessionId: text("sessionId").notNull(),
  loginCount: integer("loginCount").default(0),
  pageViews: integer("pageViews").default(0),
  duration: integer("duration").default(0),
  visitedPages: text("visitedPages"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type DemoAccountAnalytics = typeof demoAccountAnalytics.$inferSelect;
export type InsertDemoAccountAnalytics = typeof demoAccountAnalytics.$inferInsert;

// Wiki分类表
export const wikiCategories = sqliteTable("wikiCategories", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type WikiCategory = typeof wikiCategories.$inferSelect;
export type InsertWikiCategory = typeof wikiCategories.$inferInsert;

// Wiki文章表
export const wikiArticles = sqliteTable("wikiArticles", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  categoryId: integer("categoryId").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary"),
  tags: text("tags"),
  sortOrder: integer("sortOrder").default(0),
  viewCount: integer("viewCount").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type WikiArticle = typeof wikiArticles.$inferSelect;
export type InsertWikiArticle = typeof wikiArticles.$inferInsert;

// 反馈表
export const feedbacks = sqliteTable("feedbacks", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  type: text("type", { enum: ["bug", "feature", "general"] }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["pending", "reviewed", "resolved"] }).default("pending").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

// 更新日志表
export const changelogs = sqliteTable("changelogs", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  version: text("version").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["feature", "improvement", "bugfix"] }).notNull(),
  publishedAt: integer("publishedAt", { mode: 'timestamp' }).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type Changelog = typeof changelogs.$inferSelect;
export type InsertChangelog = typeof changelogs.$inferInsert;

// 企业能力评估表
export const organizationAssessments = sqliteTable("organizationAssessments", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  companyId: integer("companyId"),
  strategyScore: integer("strategyScore").default(0).notNull(),
  operationScore: integer("operationScore").default(0).notNull(),
  organizationScore: integer("organizationScore").default(0).notNull(),
  innovationScore: integer("innovationScore").default(0).notNull(),
  detailedScores: text("detailedScores"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type OrganizationAssessment = typeof organizationAssessments.$inferSelect;
export type InsertOrganizationAssessment = typeof organizationAssessments.$inferInsert;

// 企业能力评估历史表
export const organizationAssessmentHistory = sqliteTable("organizationAssessmentHistory", {
  id: integer("id", { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  strategyScore: integer("strategyScore").notNull(),
  operationScore: integer("operationScore").notNull(),
  organizationScore: integer("organizationScore").notNull(),
  innovationScore: integer("innovationScore").notNull(),
  questionAnswers: text("questionAnswers"),
  metricValues: text("metricValues"),
  assessmentDate: integer("assessmentDate", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type OrganizationAssessmentHistory = typeof organizationAssessmentHistory.$inferSelect;
export type InsertOrganizationAssessmentHistory = typeof organizationAssessmentHistory.$inferInsert;
