import { eq, desc, and, gte, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, userProfiles, InsertUserProfile, competencyDomains, 
  competencies, competencyScores, InsertCompetencyScore, competencySnapshots,
  scenarios, InsertScenario, assessmentSessions, InsertAssessmentSession,
  userAnswers, InsertUserAnswer, industries, positions, industryCompetencies,
  positionCompetencies, learningResources, companies, InsertCompany,
  companyMembers, InsertCompanyMember, demoAccounts, demoAccountAnalytics,
  wikiCategories, wikiArticles, feedbacks, changelogs
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.isDemo !== undefined) {
      values.isDemo = user.isDemo;
      updateSet.isDemo = user.isDemo;
    }
    if (user.demoRole !== undefined) {
      values.demoRole = user.demoRole;
      updateSet.demoRole = user.demoRole;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== User Profile ====================
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userProfiles).values(profile);
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, userId));
}

// ==================== Competencies ====================
export async function getAllCompetencies() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(competencies).orderBy(competencies.sortOrder);
}

export async function getCompetencyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(competencies).where(eq(competencies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompetenciesByDomain(domainId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(competencies).where(eq(competencies.domainId, domainId)).orderBy(competencies.sortOrder);
}

export async function getAllDomains() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(competencyDomains).orderBy(competencyDomains.sortOrder);
}

// ==================== Competency Scores ====================
export async function getUserCompetencies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const scores = await db.select().from(competencyScores).where(eq(competencyScores.userId, userId));
  const allComps = await getAllCompetencies();
  
  return scores.map(score => {
    const comp = allComps.find(c => c.id === score.competencyId);
    return {
      ...score,
      name: comp?.name || '',
      category: comp?.category || '',
      description: comp?.description || '',
      score: score.finalScore
    };
  });
}

export async function getUserCompetency(userId: number, competencyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(competencyScores)
    .where(and(eq(competencyScores.userId, userId), eq(competencyScores.competencyId, competencyId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Calculate final score based on weighted average of different assessment scores
 * Formula: finalScore = (questionnaireScore * questionnaireWeight/100) + 
 *                       (selfAssessmentScore * selfAssessmentWeight/100) + 
 *                       (aiAnalysisScore * aiAnalysisWeight/100) + 
 *                       (evidenceScore * evidenceWeight/100)
 */
function calculateFinalScore(data: InsertCompetencyScore): number {
  const qScore = data.questionnaireScore || 0;
  const sScore = data.selfAssessmentScore || 0;
  const aScore = data.aiAnalysisScore || 0;
  const eScore = data.evidenceScore || 0;
  
  const qWeight = data.questionnaireWeight || 40;
  const sWeight = data.selfAssessmentWeight || 20;
  const aWeight = data.aiAnalysisWeight || 30;
  const eWeight = data.evidenceWeight || 10;
  
  const finalScore = Math.round(
    (qScore * qWeight + sScore * sWeight + aScore * aWeight + eScore * eWeight) / 100
  );
  
  return Math.max(0, Math.min(100, finalScore)); // Clamp between 0-100
}

/**
 * Calculate level (1-5) based on final score
 * L1: 0-20, L2: 21-40, L3: 41-60, L4: 61-80, L5: 81-100
 */
function calculateLevel(finalScore: number): number {
  if (finalScore <= 20) return 1;
  if (finalScore <= 40) return 2;
  if (finalScore <= 60) return 3;
  if (finalScore <= 80) return 4;
  return 5;
}

export async function upsertUserCompetency(data: InsertCompetencyScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Auto-calculate finalScore if not provided or if any component score changed
  const finalScore = calculateFinalScore(data);
  const level = calculateLevel(finalScore);
  
  const updatedData = {
    ...data,
    finalScore,
    level
  };
  
  const existing = await getUserCompetency(data.userId, data.competencyId);
  
  if (existing) {
    await db.update(competencyScores)
      .set(updatedData)
      .where(and(eq(competencyScores.userId, data.userId), eq(competencyScores.competencyId, data.competencyId)));
  } else {
    await db.insert(competencyScores).values(updatedData);
  }
}

// ==================== Scenarios ====================
export async function createScenario(data: {
  userId: number;
  title: string;
  description: string;
  aiAnalysis?: string;
  aiSuggestions?: string;
  identifiedCompetencies?: string;
  companyStage?: "seed" | "angel" | "series_a" | "series_b" | "series_c" | "series_d" | "pre_ipo" | "public" | "mature";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(scenarios).values({
    userId: data.userId,
    title: data.title,
    description: data.description,
    analysis: data.aiAnalysis,
    suggestions: data.aiSuggestions,
    relatedCompetencies: data.identifiedCompetencies,
    companyStage: data.companyStage,
    status: 'analyzed'
  });
}

export async function getUserScenarios(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(scenarios).where(eq(scenarios.userId, userId)).orderBy(desc(scenarios.createdAt));
}

export async function getScenarioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Assessment Sessions ====================
export async function createAssessmentSession(data: InsertAssessmentSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assessmentSessions).values(data);
  return result[0].insertId;
}

export async function updateAssessmentSession(sessionId: number, updates: Partial<InsertAssessmentSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(assessmentSessions).set(updates).where(eq(assessmentSessions.id, sessionId));
}

export async function getUserAssessmentSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assessmentSessions)
    .where(eq(assessmentSessions.userId, userId))
    .orderBy(desc(assessmentSessions.createdAt));
}

// ==================== User Answers ====================
export async function createUserAnswer(data: InsertUserAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userAnswers).values(data);
}

export async function getUserAnswers(userId: number, sessionType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (sessionType) {
    const sessions = await db.select().from(assessmentSessions)
      .where(and(eq(assessmentSessions.userId, userId), eq(assessmentSessions.sessionType, sessionType as any)));
    const sessionIds = sessions.map(s => s.id);
    if (sessionIds.length === 0) return [];
    return await db.select().from(userAnswers).where(inArray(userAnswers.sessionId, sessionIds));
  }
  
  return await db.select().from(userAnswers).where(eq(userAnswers.userId, userId));
}

export async function getUserAnsweredQuestions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const answers = await db.select().from(userAnswers).where(eq(userAnswers.userId, userId));
  return answers.map(a => a.questionId);
}

// ==================== Learning Resources ====================
export async function getCompetencyResources(competencyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(learningResources).where(eq(learningResources.competencyId, competencyId));
}

export async function createLearningResource(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(learningResources).values(data);
  return result[0].insertId;
}

// ==================== Industries & Positions ====================
export async function getAllIndustries() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(industries);
}

export async function getAllPositions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(positions);
}

export async function getPositionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(positions).where(eq(positions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function findPositionByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(positions).where(eq(positions.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPositionCompetencies(positionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(positionCompetencies).where(eq(positionCompetencies.positionId, positionId));
}

export async function getIndustryCompetencies(industryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(industryCompetencies).where(eq(industryCompetencies.industryId, industryId));
}

// ==================== Companies ====================
export async function getUserCompany(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const member = await db.select().from(companyMembers).where(eq(companyMembers.userId, userId)).limit(1);
  if (member.length === 0) return undefined;
  
  const company = await db.select().from(companies).where(eq(companies.id, member[0].companyId)).limit(1);
  return company.length > 0 ? company[0] : undefined;
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompanyByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(data);
  return result[0].insertId;
}

export async function updateCompany(companyId: number, updates: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companies).set(updates).where(eq(companies.id, companyId));
}

export async function getUserCompanies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const memberships = await db.select().from(companyMembers).where(eq(companyMembers.userId, userId));
  if (memberships.length === 0) return [];
  
  const companyIds = memberships.map(m => m.companyId);
  return await db.select().from(companies).where(inArray(companies.id, companyIds));
}

// ==================== Company Members ====================
export async function addCompanyMember(data: InsertCompanyMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companyMembers).values(data);
  return result[0].insertId;
}

export async function getCompanyMembers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(companyMembers).where(eq(companyMembers.companyId, companyId));
}

export async function getCompanyMembersWithUserInfo(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const members = await db.select().from(companyMembers).where(eq(companyMembers.companyId, companyId));
  const userIds = members.map(m => m.userId);
  if (userIds.length === 0) return [];
  
  const usersData = await db.select().from(users).where(inArray(users.id, userIds));
  
  return members.map(member => {
    const user = usersData.find(u => u.id === member.userId);
    return {
      ...member,
      userName: user?.name || '',
      userEmail: user?.email || ''
    };
  });
}

export async function updateCompanyMember(memberId: number, updates: Partial<InsertCompanyMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companyMembers).set(updates).where(eq(companyMembers.id, memberId));
}

export async function removeCompanyMember(memberId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(companyMembers).where(eq(companyMembers.id, memberId));
}

export async function isCompanyAdmin(userId: number, companyId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const member = await db.select().from(companyMembers)
    .where(and(eq(companyMembers.userId, userId), eq(companyMembers.companyId, companyId)))
    .limit(1);
  
  if (member.length === 0) return false;
  return member[0].role === 'owner' || member[0].role === 'admin';
}

// ==================== Snapshots ====================
export async function createCapabilitySnapshot(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userComps = await getUserCompetencies(userId);
  const now = new Date();
  
  for (const comp of userComps) {
    await db.insert(competencySnapshots).values({
      userId,
      competencyId: comp.competencyId,
      score: comp.finalScore,
      level: comp.level,
      snapshotDate: now
    });
  }
  
  return userComps.length;
}

export async function getUserCapabilityTrends(userId: number, months: number) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const snapshots = await db.select().from(competencySnapshots)
    .where(and(eq(competencySnapshots.userId, userId), gte(competencySnapshots.snapshotDate, startDate)))
    .orderBy(competencySnapshots.snapshotDate);

  // 按月聚合，计算每月平均分
  const monthlyMap = new Map<string, { scores: number[]; levels: number[] }>();
  for (const s of snapshots) {
    const monthKey = new Date(s.snapshotDate).toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { scores: [], levels: [] });
    }
    const entry = monthlyMap.get(monthKey)!;
    entry.scores.push(s.score);
    entry.levels.push(s.level);
  }

  const trends: { snapshotDate: string; avgScore: number; avgLevel: number; competencyCount: number }[] = [];
  for (const [monthKey, data] of monthlyMap.entries()) {
    const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
    const avgLevel = Math.round(data.levels.reduce((a, b) => a + b, 0) / data.levels.length);
    trends.push({
      snapshotDate: `${monthKey}-15`,
      avgScore,
      avgLevel,
      competencyCount: data.scores.length,
    });
  }

  return trends.sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
}

// ==================== Wiki ====================
export async function getAllWikiCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wikiCategories).orderBy(wikiCategories.sortOrder);
}

export async function getWikiArticlesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wikiArticles)
    .where(eq(wikiArticles.categoryId, categoryId))
    .orderBy(wikiArticles.sortOrder);
}

export async function getWikiArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wikiArticles).where(eq(wikiArticles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Admin ====================
export async function getAllUsersWithStats() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return {
    totalUsers: 0,
    totalCompetencies: 0,
    totalScenarios: 0,
    totalAssessments: 0
  };
  
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [compsCount] = await db.select({ count: sql<number>`count(*)` }).from(competencies);
  const [scenariosCount] = await db.select({ count: sql<number>`count(*)` }).from(scenarios);
  const [assessmentsCount] = await db.select({ count: sql<number>`count(*)` }).from(assessmentSessions);
  
  return {
    totalUsers: usersCount?.count || 0,
    totalCompetencies: compsCount?.count || 0,
    totalScenarios: scenariosCount?.count || 0,
    totalAssessments: assessmentsCount?.count || 0
  };
}

// Placeholder functions for compatibility (to be implemented later)
export async function getUserAssessments(userId: number) { return []; }
export async function createAssessment(data: any) { return 1; }
// ==================== Achievements ====================
export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  
  const { achievements } = await import("../drizzle/schema");
  return await db.select().from(achievements).orderBy(achievements.sortOrder);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { userAchievements, achievements } = await import("../drizzle/schema");
  const userAchs = await db.select().from(userAchievements)
    .where(eq(userAchievements.userId, userId));
  
  const allAchs = await getAllAchievements();
  
  return userAchs.map(ua => {
    const ach = allAchs.find(a => a.id === ua.achievementId);
    return {
      ...ua,
      name: ach?.name || '',
      description: ach?.description || '',
      icon: ach?.icon || '',
      category: ach?.category || '',
      points: ach?.points || 0,
    };
  });
}

export async function unlockAchievement(userId: number, achievementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { userAchievements } = await import("../drizzle/schema");
  
  // Check if already unlocked
  const existing = await db.select().from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ))
    .limit(1);
  
  if (existing.length > 0) return false; // Already unlocked
  
  await db.insert(userAchievements).values({
    userId,
    achievementId,
  });
  
  return true;
}

export async function checkAndUnlockAchievements(userId: number) {
  // This would check various conditions and unlock achievements
  // For now, return empty array - to be implemented with specific triggers
  return [];
}
export async function getUserDetailForAdmin(userId: number) { return null; }
export async function getOrganizationAssessment(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { organizationAssessments } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(organizationAssessments)
    .where(eq(organizationAssessments.userId, userId))
    .orderBy(desc(organizationAssessments.updatedAt))
    .limit(1);
  
  return result[0] || null;
}

export async function saveOrganizationAssessment(data: {
  userId: number;
  companyId?: number;
  strategyScore: number;
  operationScore: number;
  organizationScore: number;
  innovationScore: number;
  detailedScores: string;
}) {
  const db = await getDb();
  if (!db) return 0;
  
  const { organizationAssessments } = await import("../drizzle/schema");
  
  // Check if assessment already exists
  const existing = await getOrganizationAssessment(data.userId);
  
  if (existing) {
    // Update existing
    await db
      .update(organizationAssessments)
      .set({
        companyId: data.companyId,
        strategyScore: data.strategyScore,
        operationScore: data.operationScore,
        organizationScore: data.organizationScore,
        innovationScore: data.innovationScore,
        detailedScores: data.detailedScores,
      })
      .where(eq(organizationAssessments.id, existing.id));
    
    return existing.id;
  } else {
    // Insert new
    const result = await db.insert(organizationAssessments).values(data);
    return Number(result[0].insertId);
  }
}

export async function saveOrganizationAssessmentHistory(data: {
  userId: number;
  strategyScore: number;
  operationScore: number;
  organizationScore: number;
  innovationScore: number;
  questionAnswers?: string;
  metricValues?: string;
}) {
  const db = await getDb();
  if (!db) return 0;
  
  const { organizationAssessmentHistory } = await import("../drizzle/schema");
  const result = await db.insert(organizationAssessmentHistory).values({
    ...data,
    questionAnswers: data.questionAnswers || "{}",
    metricValues: data.metricValues || "{}",
  });
  
  return Number(result[0].insertId);
}

export async function getOrganizationAssessmentHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const { organizationAssessmentHistory } = await import("../drizzle/schema");
  const results = await db
    .select()
    .from(organizationAssessmentHistory)
    .where(eq(organizationAssessmentHistory.userId, userId))
    .orderBy(desc(organizationAssessmentHistory.assessmentDate))
    .limit(limit);
  
  return results;
}
export async function updateOrganizationAnalysis(userId: number, analysis: string) { }
export async function getCompanyCapabilityAnalytics(companyId: number) { return null; }
export async function getCompanyMembersCapabilityComparison(companyId: number) { return []; }
export async function getCompanyCapabilityTrends(companyId: number, months: number) { return []; }
export async function upsertCapabilityGoal(data: any) { return 1; }
export async function getCapabilityGoal(data: any) { return null; }
export async function createCapabilityGapAnalysis(data: any) { return 1; }
export async function getLatestCapabilityGapAnalysis(data: any) { return null; }
// ==================== Assessment Questions ====================
export async function getQuestionsByCompetency(competencyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  return await db.select().from(assessmentQuestions)
    .where(and(
      eq(assessmentQuestions.competencyId, competencyId),
      eq(assessmentQuestions.isActive, true)
    ))
    .orderBy(assessmentQuestions.sortOrder);
}

export async function getQuestionsByType(type: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  return await db.select().from(assessmentQuestions)
    .where(and(
      eq(assessmentQuestions.questionType, type as any),
      eq(assessmentQuestions.isActive, true)
    ))
    .limit(limit);
}

export async function getAllQuestions() {
  const db = await getDb();
  if (!db) return [];
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  return await db.select().from(assessmentQuestions)
    .orderBy(assessmentQuestions.competencyId, assessmentQuestions.sortOrder);
}

export async function createQuestion(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  const result = await db.insert(assessmentQuestions).values(data);
  return Number(result[0].insertId);
}

export async function updateQuestion(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  await db.update(assessmentQuestions).set(data).where(eq(assessmentQuestions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  // Soft delete by setting isActive to false
  await db.update(assessmentQuestions).set({ isActive: false }).where(eq(assessmentQuestions.id, id));
}

export async function getQuestionStatistics() {
  const db = await getDb();
  if (!db) return [];
  
  const { assessmentQuestions } = await import("../drizzle/schema");
  return await db.select({
    competencyId: assessmentQuestions.competencyId,
    totalQuestions: sql<number>`count(*)`,
    avgDifficulty: sql<number>`avg(case when ${assessmentQuestions.difficulty} = 'easy' then 1 when ${assessmentQuestions.difficulty} = 'medium' then 2 else 3 end)`,
    avgUsageCount: sql<number>`avg(${assessmentQuestions.usageCount})`,
  })
  .from(assessmentQuestions)
  .where(eq(assessmentQuestions.isActive, true))
  .groupBy(assessmentQuestions.competencyId);
}
// ==================== Learning Paths ====================
export async function createLearningPath(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { learningPaths } = await import("../drizzle/schema");
  const result = await db.insert(learningPaths).values(data);
  return Number(result[0].insertId);
}

export async function getUserLearningPaths(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { learningPaths } = await import("../drizzle/schema");
  return await db.select().from(learningPaths)
    .where(eq(learningPaths.userId, userId))
    .orderBy(desc(learningPaths.createdAt));
}

export async function getLearningPathById(pathId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { learningPaths } = await import("../drizzle/schema");
  const result = await db.select().from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);
  return result[0] || null;
}

export async function updateLearningPath(pathId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { learningPaths } = await import("../drizzle/schema");
  await db.update(learningPaths).set(data).where(eq(learningPaths.id, pathId));
}

export async function getLearningResourcesByPath(pathId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const path = await getLearningPathById(pathId);
  if (!path || !path.resourceIds) return [];
  
  const resourceIds = JSON.parse(path.resourceIds);
  if (resourceIds.length === 0) return [];
  
  return await db.select().from(learningResources)
    .where(inArray(learningResources.id, resourceIds));
}

export async function getAllLearningProgressForPath(userId: number, pathId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { userLearningProgress } = await import("../drizzle/schema");
  return await db.select().from(userLearningProgress)
    .where(and(
      eq(userLearningProgress.userId, userId),
      eq(userLearningProgress.pathId, pathId)
    ));
}

export async function getUserLearningProgress(userId: number, resourceId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { userLearningProgress } = await import("../drizzle/schema");
  const result = await db.select().from(userLearningProgress)
    .where(and(
      eq(userLearningProgress.userId, userId),
      eq(userLearningProgress.resourceId, resourceId)
    ))
    .limit(1);
  return result[0] || null;
}

export async function updateLearningProgress(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { userLearningProgress } = await import("../drizzle/schema");
  
  const existing = await getUserLearningProgress(data.userId, data.resourceId);
  
  if (existing) {
    await db.update(userLearningProgress)
      .set(data)
      .where(and(
        eq(userLearningProgress.userId, data.userId),
        eq(userLearningProgress.resourceId, data.resourceId)
      ));
  } else {
    await db.insert(userLearningProgress).values(data);
  }
}

export async function generateLearningPathFromGaps(userId: number, gapCompetencies: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get resources for gap competencies
  const resources = await db.select().from(learningResources)
    .where(inArray(learningResources.competencyId, gapCompetencies))
    .orderBy(learningResources.difficulty);
  
  if (resources.length === 0) return null;
  
  const resourceIds = resources.map(r => r.id);
  const estimatedTime = resources.reduce((sum, r) => sum + (r.estimatedTime || 60), 0);
  const estimatedDays = Math.ceil(estimatedTime / 240); // 4 hours per day
  
  const competencies = await getAllCompetencies();
  const targetCompNames = gapCompetencies
    .map(id => competencies.find(c => c.id === id)?.name)
    .filter(Boolean);
  
  const pathData = {
    userId,
    title: `个性化学习路径 - ${new Date().toLocaleDateString('zh-CN')}`,
    description: `基于能力缺口分析生成的学习路径，目标提升：${targetCompNames.join('、')}`,
    targetCompetencies: JSON.stringify(gapCompetencies),
    resourceIds: JSON.stringify(resourceIds),
    totalResources: resources.length,
    estimatedDays,
    status: 'active',
    startedAt: new Date(),
  };
  
  return await createLearningPath(pathData);
}
export async function autoUpdateOrganizationCapability(userId: number) { }
