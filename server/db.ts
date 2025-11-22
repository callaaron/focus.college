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

export async function upsertUserCompetency(data: InsertCompetencyScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserCompetency(data.userId, data.competencyId);
  
  if (existing) {
    await db.update(competencyScores)
      .set(data)
      .where(and(eq(competencyScores.userId, data.userId), eq(competencyScores.competencyId, data.competencyId)));
  } else {
    await db.insert(competencyScores).values(data);
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
  
  return await db.select().from(competencySnapshots)
    .where(and(eq(competencySnapshots.userId, userId), gte(competencySnapshots.snapshotDate, startDate)))
    .orderBy(competencySnapshots.snapshotDate);
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
export async function getAllAchievements() { return []; }
export async function getUserAchievements(userId: number) { return []; }
export async function checkAndUnlockAchievements(userId: number) { return []; }
export async function getUserDetailForAdmin(userId: number) { return null; }
export async function getOrganizationAssessment(userId: number) { return null; }
export async function saveOrganizationAssessment(data: any) { return 1; }
export async function saveOrganizationAssessmentHistory(data: any) { return 1; }
export async function getOrganizationAssessmentHistory(userId: number, limit: number) { return []; }
export async function updateOrganizationAnalysis(userId: number, analysis: string) { }
export async function getCompanyCapabilityAnalytics(companyId: number) { return null; }
export async function getCompanyMembersCapabilityComparison(companyId: number) { return []; }
export async function getCompanyCapabilityTrends(companyId: number, months: number) { return []; }
export async function upsertCapabilityGoal(data: any) { return 1; }
export async function getCapabilityGoal(data: any) { return null; }
export async function createCapabilityGapAnalysis(data: any) { return 1; }
export async function getLatestCapabilityGapAnalysis(data: any) { return null; }
export async function getQuestionsByCompetency(competencyId: number) { return []; }
export async function getQuestionsByType(type: string, limit: number) { return []; }
export async function getAllQuestions() { return []; }
export async function createQuestion(data: any) { return 1; }
export async function updateQuestion(id: number, data: any) { }
export async function deleteQuestion(id: number) { }
export async function getQuestionStatistics() { return []; }
export async function createLearningPath(data: any) { return 1; }
export async function getUserLearningPaths(userId: number) { return []; }
export async function getLearningPathById(pathId: number) { return null; }
export async function getLearningResourcesByPath(pathId: number) { return []; }
export async function getAllLearningProgressForPath(userId: number, pathId: number) { return []; }
export async function getUserLearningProgress(userId: number, resourceId: number) { return null; }
export async function updateLearningProgress(data: any) { }
export async function autoUpdateOrganizationCapability(userId: number) { }
