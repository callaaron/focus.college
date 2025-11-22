import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isDemo: boolean("isDemo").default(false).notNull(), // 是否为演示账户
  demoRole: varchar("demoRole", { length: 50 }), // 演示角色：pm, cto, ceo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 用户画像表
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // 公司信息
  industry: varchar("industry", { length: 100 }), // 行业类型
  industryId: int("industryId"), // 关联行业库ID
  companySize: mysqlEnum("companySize", ["startup", "small", "medium", "large"]), // 公司规模
  companyStage: mysqlEnum("companyStage", [
    "seed", "angel", "series_a", "series_b", "series_c", "series_d", 
    "pre_ipo", "public", "mature"
  ]).default("seed"), // 发展阶段
  // 个人信息
  currentRole: varchar("currentRole", { length: 100 }), // 当前岗位
  positionId: int("positionId"), // 关联职位库ID
  managementLevel: mysqlEnum("managementLevel", ["executive", "senior", "middle", "junior"]), // 管理级别
  yearsOfManagement: int("yearsOfManagement").default(0), // 管理年限
  directReports: int("directReports").default(0), // 直接下属人数
  teamSize: int("teamSize").default(0), // 团队总人数
  // 元数据
  profileCompleted: boolean("profileCompleted").default(false).notNull(), // 画像是否完成
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// 能力域表（三层级：模块→能力域→能力）
export const competencyDomains = mysqlTable("competencyDomains", {
  id: int("id").autoincrement().primaryKey(),
  module: varchar("module", { length: 100 }).notNull(), // 所属模块
  name: varchar("name", { length: 255 }).notNull(), // 能力域名称
  description: text("description"), // 能力域描述
  sortOrder: int("sortOrder").default(0), // 排序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompetencyDomain = typeof competencyDomains.$inferSelect;
export type InsertCompetencyDomain = typeof competencyDomains.$inferInsert;

// 能力表
export const competencies = mysqlTable("competencies", {
  id: int("id").autoincrement().primaryKey(),
  domainId: int("domainId").notNull(), // 所属能力域
  name: varchar("name", { length: 255 }).notNull(), // 能力名称
  category: varchar("category", { length: 100 }).notNull(), // 所属模块（冗余字段，方便查询）
  description: text("description"), // 能力描述
  isCore: boolean("isCore").default(true).notNull(), // 是否核心能力（通用）
  sortOrder: int("sortOrder").default(0), // 排序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

// 能力评分表（支持多来源评分）
export const competencyScores = mysqlTable("competencyScores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  competencyId: int("competencyId").notNull(),
  // 评分来源
  questionnaireScore: int("questionnaireScore").default(0), // 问卷答题得分 (0-100)
  selfAssessmentScore: int("selfAssessmentScore").default(0), // 自我评估得分 (0-100)
  aiAnalysisScore: int("aiAnalysisScore").default(0), // AI分析得分 (0-100)
  evidenceScore: int("evidenceScore").default(0), // 证据上传得分 (0-100)
  // 综合得分
  finalScore: int("finalScore").default(0), // 综合得分 (0-100)
  level: int("level").default(1), // 能力等级 (1-5)
  // 权重设置
  questionnaireWeight: int("questionnaireWeight").default(40), // 问卷权重 (%)
  selfAssessmentWeight: int("selfAssessmentWeight").default(20), // 自评权重 (%)
  aiAnalysisWeight: int("aiAnalysisWeight").default(30), // AI分析权重 (%)
  evidenceWeight: int("evidenceWeight").default(10), // 证据权重 (%)
  // 元数据
  practiceCount: int("practiceCount").default(0), // 实践次数
  lastPracticeAt: timestamp("lastPracticeAt"), // 最后实践时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompetencyScore = typeof competencyScores.$inferSelect;
export type InsertCompetencyScore = typeof competencyScores.$inferInsert;

// 能力快照表（历史记录，用于趋势图）
export const competencySnapshots = mysqlTable("competencySnapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  competencyId: int("competencyId").notNull(),
  score: int("score").notNull(), // 当时的得分
  level: int("level").notNull(), // 当时的等级
  snapshotDate: timestamp("snapshotDate").notNull(), // 快照时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompetencySnapshot = typeof competencySnapshots.$inferSelect;
export type InsertCompetencySnapshot = typeof competencySnapshots.$inferInsert;

// 问题场景表（今日挑战）
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(), // 问题标题
  description: text("description").notNull(), // 问题描述
  companyStage: mysqlEnum("companyStage", [
    "seed", "angel", "series_a", "series_b", "series_c", "series_d",
    "pre_ipo", "public", "mature"
  ]), // 公司阶段
  // AI分析结果
  analysis: text("analysis"), // 问题诊断（Markdown格式）
  suggestions: text("suggestions"), // 解决建议（Markdown格式）
  relatedCompetencies: text("relatedCompetencies"), // 相关能力（JSON数组）
  // 元数据
  status: mysqlEnum("status", ["pending", "analyzed", "archived"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

// 答题会话表
export const assessmentSessions = mysqlTable("assessmentSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: mysqlEnum("sessionType", ["initial", "regular", "position"]).default("regular").notNull(), // 会话类型
  totalQuestions: int("totalQuestions").notNull(), // 总题数
  answeredQuestions: int("answeredQuestions").default(0), // 已答题数
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssessmentSession = typeof assessmentSessions.$inferSelect;
export type InsertAssessmentSession = typeof assessmentSessions.$inferInsert;

// 用户答题记录表
export const userAnswers = mysqlTable("userAnswers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: int("sessionId").notNull(), // 关联答题会话
  questionId: int("questionId").notNull(), // 题目ID
  competencyId: int("competencyId").notNull(), // 关联能力
  answer: int("answer").notNull(), // 答案 (1-5)
  score: int("score").notNull(), // 得分
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = typeof userAnswers.$inferInsert;

// 行业库表
export const industries = mysqlTable("industries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 行业名称
  code: varchar("code", { length: 50 }).notNull().unique(), // 行业代码
  description: text("description"), // 行业描述
  keyCharacteristics: text("keyCharacteristics"), // 关键特征（JSON）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Industry = typeof industries.$inferSelect;
export type InsertIndustry = typeof industries.$inferInsert;

// 职位库表
export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 职位名称
  code: varchar("code", { length: 50 }).notNull().unique(), // 职位代码
  category: varchar("category", { length: 50 }).notNull(), // 职位类别
  level: mysqlEnum("level", ["executive", "senior", "middle", "junior"]).notNull(), // 职位层级
  description: text("description"), // 职位描述
  keyResponsibilities: text("keyResponsibilities"), // 关键职责（JSON）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

// 行业专有能力表
export const industryCompetencies = mysqlTable("industryCompetencies", {
  id: int("id").autoincrement().primaryKey(),
  industryId: int("industryId").notNull(),
  competencyId: int("competencyId").notNull(),
  importance: int("importance").default(3).notNull(), // 重要程度 1-5
  description: text("description"), // 在该行业的特殊说明
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IndustryCompetency = typeof industryCompetencies.$inferSelect;
export type InsertIndustryCompetency = typeof industryCompetencies.$inferInsert;

// 职位专有能力表
export const positionCompetencies = mysqlTable("positionCompetencies", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(),
  competencyId: int("competencyId").notNull(),
  importance: int("importance").default(3).notNull(), // 重要程度 1-5
  requiredLevel: int("requiredLevel").default(3).notNull(), // 要求达到的等级 1-5
  description: text("description"), // 在该职位的特殊说明
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PositionCompetency = typeof positionCompetencies.$inferSelect;
export type InsertPositionCompetency = typeof positionCompetencies.$inferInsert;

// 学习资源表
export const learningResources = mysqlTable("learningResources", {
  id: int("id").autoincrement().primaryKey(),
  competencyId: int("competencyId").notNull(), // 关联能力
  title: varchar("title", { length: 255 }).notNull(), // 资源标题
  type: mysqlEnum("type", ["article", "video", "book", "course"]).notNull(), // 资源类型
  url: varchar("url", { length: 500 }), // 资源链接
  description: text("description"), // 资源描述
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("intermediate"), // 难度
  estimatedTime: int("estimatedTime"), // 预计学习时间（分钟）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = typeof learningResources.$inferInsert;

// 公司表
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // 公司名称
  industry: varchar("industry", { length: 100 }), // 行业
  industryId: int("industryId"), // 关联行业库
  companySize: mysqlEnum("companySize", ["startup", "small", "medium", "large"]), // 公司规模
  companyStage: mysqlEnum("companyStage", [
    "seed", "angel", "series_a", "series_b", "series_c", "series_d",
    "pre_ipo", "public", "mature"
  ]), // 发展阶段
  description: text("description"), // 公司描述
  organizationStructure: text("organizationStructure"), // 组织架构（JSON）
  ownerId: int("ownerId").notNull(), // 创建者ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// 公司成员表
export const companyMembers = mysqlTable("companyMembers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(), // 角色
  position: varchar("position", { length: 100 }), // 职位
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompanyMember = typeof companyMembers.$inferSelect;
export type InsertCompanyMember = typeof companyMembers.$inferInsert;

// 演示账户表
export const demoAccounts = mysqlTable("demoAccounts", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(), // 用户名
  password: varchar("password", { length: 255 }).notNull(), // 密码（明文存储，仅用于演示）
  displayName: varchar("displayName", { length: 100 }).notNull(), // 显示名称
  role: varchar("role", { length: 50 }).notNull(), // 角色：pm, cto, ceo
  description: text("description"), // 角色描述
  userId: int("userId"), // 关联的真实用户ID
  isActive: boolean("isActive").default(true).notNull(), // 是否激活
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DemoAccount = typeof demoAccounts.$inferSelect;
export type InsertDemoAccount = typeof demoAccounts.$inferInsert;

// 演示数据分析表
export const demoAccountAnalytics = mysqlTable("demoAccountAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  demoAccountId: int("demoAccountId").notNull(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(), // 会话ID
  loginCount: int("loginCount").default(0), // 登录次数
  pageViews: int("pageViews").default(0), // 页面访问次数
  duration: int("duration").default(0), // 停留时长（秒）
  visitedPages: text("visitedPages"), // 访问的页面（JSON数组）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DemoAccountAnalytics = typeof demoAccountAnalytics.$inferSelect;
export type InsertDemoAccountAnalytics = typeof demoAccountAnalytics.$inferInsert;

// Wiki分类表
export const wikiCategories = mysqlTable("wikiCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 分类名称
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL slug
  description: text("description"), // 分类描述
  sortOrder: int("sortOrder").default(0), // 排序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WikiCategory = typeof wikiCategories.$inferSelect;
export type InsertWikiCategory = typeof wikiCategories.$inferInsert;

// Wiki文章表
export const wikiArticles = mysqlTable("wikiArticles", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(), // 文章标题
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug
  content: text("content").notNull(), // 文章内容（Markdown格式）
  summary: text("summary"), // 摘要
  tags: varchar("tags", { length: 255 }), // 标签（逗号分隔）
  sortOrder: int("sortOrder").default(0), // 排序
  viewCount: int("viewCount").default(0), // 浏览次数
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WikiArticle = typeof wikiArticles.$inferSelect;
export type InsertWikiArticle = typeof wikiArticles.$inferInsert;

// 反馈表
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: mysqlEnum("type", ["bug", "feature", "general"]).notNull(), // 反馈类型
  title: varchar("title", { length: 255 }).notNull(), // 标题
  content: text("content").notNull(), // 内容
  status: mysqlEnum("status", ["pending", "reviewed", "resolved"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

// 更新日志表
export const changelogs = mysqlTable("changelogs", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 50 }).notNull(), // 版本号
  title: varchar("title", { length: 255 }).notNull(), // 标题
  content: text("content").notNull(), // 内容（Markdown格式）
  type: mysqlEnum("type", ["feature", "improvement", "bugfix"]).notNull(), // 类型
  publishedAt: timestamp("publishedAt").notNull(), // 发布时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Changelog = typeof changelogs.$inferSelect;
export type InsertChangelog = typeof changelogs.$inferInsert;
