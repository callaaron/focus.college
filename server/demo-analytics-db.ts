import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * 演示账户使用统计数据库操作
 */

export interface DemoAnalyticsSession {
  id: number;
  demoAccountId: number;
  sessionId: string;
  loginTime: Date;
  logoutTime: Date | null;
  duration: number | null;
  pagesVisited: string | null;
  createdAt: Date;
}

export interface DemoAnalyticsStats {
  totalSessions: number;
  totalDuration: number;
  avgDuration: number;
  popularPages: Array<{ path: string; count: number }>;
  sessionsPerDay: Array<{ date: string; count: number }>;
}

/**
 * 记录演示账户登录
 */
export async function recordDemoLogin(demoAccountId: number, sessionId: string): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.execute(
    sql`INSERT INTO demoAccountAnalytics (demoAccountId, sessionId, loginTime) 
        VALUES (${demoAccountId}, ${sessionId}, NOW())`
  );

  return (result as any).insertId;
}

/**
 * 记录演示账户登出
 */
export async function recordDemoLogout(sessionId: string, pagesVisited: string[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const pagesJson = JSON.stringify(pagesVisited);

  await db.execute(
    sql`UPDATE demoAccountAnalytics 
        SET logoutTime = NOW(), 
            duration = TIMESTAMPDIFF(SECOND, loginTime, NOW()),
            pagesVisited = ${pagesJson}
        WHERE sessionId = ${sessionId} AND logoutTime IS NULL`
  );
}

/**
 * 更新页面访问记录（心跳更新）
 */
export async function updatePagesVisited(sessionId: string, pagesVisited: string[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const pagesJson = JSON.stringify(pagesVisited);

  await db.execute(
    sql`UPDATE demoAccountAnalytics 
        SET pagesVisited = ${pagesJson}
        WHERE sessionId = ${sessionId} AND logoutTime IS NULL`
  );
}

/**
 * 获取演示账户统计数据
 */
export async function getDemoAnalyticsStats(demoAccountId?: number): Promise<DemoAnalyticsStats> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 总会话数和总时长
  const whereClause = demoAccountId ? sql`WHERE demoAccountId = ${demoAccountId}` : sql``;
  
  const statsResult = await db.execute(
    sql`SELECT 
          COUNT(*) as totalSessions,
          COALESCE(SUM(duration), 0) as totalDuration,
          COALESCE(AVG(duration), 0) as avgDuration
        FROM demoAccountAnalytics 
        ${whereClause}`
  );

  const stats = ((statsResult[0] as unknown as any[])[0]) || { totalSessions: 0, totalDuration: 0, avgDuration: 0 };

  // 热门页面统计
  const pagesResult = await db.execute(
    sql`SELECT pagesVisited 
        FROM demoAccountAnalytics 
        ${whereClause}
        AND pagesVisited IS NOT NULL`
  );

  const pageCount: Record<string, number> = {};
  ((pagesResult[0] as unknown as any[]) || []).forEach((row: any) => {
    try {
      const pages = JSON.parse(row.pagesVisited || "[]");
      pages.forEach((page: string) => {
        pageCount[page] = (pageCount[page] || 0) + 1;
      });
    } catch (e) {
      // 忽略JSON解析错误
    }
  });

  const popularPages = Object.entries(pageCount)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 每日会话数统计（最近30天）
  const dailyResult = await db.execute(
    sql`SELECT 
          DATE(loginTime) as date,
          COUNT(*) as count
        FROM demoAccountAnalytics 
        ${whereClause}
        AND loginTime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(loginTime)
        ORDER BY date DESC`
  );

  const sessionsPerDay = ((dailyResult[0] as unknown as any[]) || []).map((row: any) => ({
    date: row.date,
    count: row.count,
  }));

  return {
    totalSessions: stats.totalSessions,
    totalDuration: stats.totalDuration,
    avgDuration: Math.round(stats.avgDuration),
    popularPages,
    sessionsPerDay,
  };
}

/**
 * 获取演示角色对比数据
 */
export async function getDemoRoleComparison() {
  const database = await getDb();
  if (!database) {
    return [];
  }

  try {
    // 查询每个演示账户的统计数据
    const result = await database.execute(
      sql`
        SELECT 
          da.id as demoAccountId,
          da.name as roleName,
          da.username,
          COUNT(das.id) as sessionCount,
          COALESCE(SUM(das.duration), 0) as totalDuration,
          COALESCE(AVG(das.duration), 0) as avgDuration
        FROM demoAccounts da
        LEFT JOIN demoAccountAnalytics das ON da.id = das.demoAccountId
        GROUP BY da.id, da.name, da.username
        ORDER BY sessionCount DESC
      `
    );

    return ((result[0] as unknown as any[]) || []).map((row: any) => ({
      demoAccountId: row.demoAccountId,
      roleName: row.roleName,
      username: row.username,
      sessionCount: Number(row.sessionCount),
      totalDuration: Number(row.totalDuration),
      avgDuration: Number(row.avgDuration),
    }));
  } catch (error) {
    console.error("查询演示账户角色对比失败:", error);
    return [];
  }
}

/**
 * 获取所有演示账户的会话列表
 */
export async function getDemoSessions(limit: number = 50): Promise<DemoAnalyticsSession[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.execute(
    sql`SELECT * FROM demoAccountAnalytics 
        ORDER BY loginTime DESC 
        LIMIT ${limit}`
  );

  return (result[0] as unknown as any[]) || [];
}
