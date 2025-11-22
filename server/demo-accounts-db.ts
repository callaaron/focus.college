import { sql } from "drizzle-orm";
import { getDb } from "./db";
import * as bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

// 演示账户数据库操作函数

export interface DemoAccount {
  id: number;
  name: string;
  description: string | null;
  username: string;
  password: string;
  userId: number | null;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertDemoAccount {
  name: string;
  description?: string;
  username: string;
  password: string;
  userId?: number;
  isActive?: number;
}

/**
 * 创建演示账户
 */
export async function createDemoAccount(data: InsertDemoAccount): Promise<DemoAccount> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 加密密码
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result: any = await db.execute(
    sql`INSERT INTO demoAccounts (name, description, username, password, userId, isActive) 
        VALUES (${data.name}, ${data.description || null}, ${data.username}, ${hashedPassword}, ${data.userId || null}, ${data.isActive ?? 1})`
  );

  // 获取刚创建的记录
  const newAccount: any = await db.execute(
    sql`SELECT * FROM demoAccounts WHERE id = ${result.insertId}`
  );

  return newAccount[0] as DemoAccount;
}

/**
 * 获取所有演示账户
 */
export async function getAllDemoAccounts(): Promise<DemoAccount[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`SELECT * FROM demoAccounts ORDER BY createdAt DESC`
  );

  return result as DemoAccount[];
}

/**
 * 根据用户名获取演示账户
 */
export async function getDemoAccountByUsername(username: string): Promise<DemoAccount | null> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not configured");
  
  // 使用mysql2直接查询
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await connection.query(
      'SELECT * FROM demoAccounts WHERE username = ? AND isActive = 1 LIMIT 1',
      [username]
    );
    
    console.log('[getDemoAccountByUsername] Query result:', JSON.stringify(rows, null, 2));
    const results = rows as any[];
    return results && results.length > 0 ? (results[0] as DemoAccount) : null;
  } finally {
    await connection.end();
  }
}

/**
 * 验证演示账户密码
 */
export async function verifyDemoAccountPassword(username: string, password: string): Promise<DemoAccount | null> {
  console.log('[verifyDemoAccountPassword] Checking:', { username, password });
  const account = await getDemoAccountByUsername(username);
  console.log('[verifyDemoAccountPassword] Account found:', account ? { username: account.username, hasPassword: !!account.password } : null);
  if (!account) return null;

  // 支持明文密码和bcrypt加密密码
  if (account.password === password) {
    // 明文密码匹配
    return account;
  }
  
  try {
    // 尝试bcrypt比较
    const isValid = await bcrypt.compare(password, account.password);
    return isValid ? account : null;
  } catch (error) {
    // bcrypt比较失败，返回null
    return null;
  }
}

/**
 * 删除演示账户
 */
export async function deleteDemoAccount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`DELETE FROM demoAccounts WHERE id = ${id}`
  );
}

/**
 * 更新演示账户状态
 */
export async function updateDemoAccountStatus(id: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`UPDATE demoAccounts SET isActive = ${isActive ? 1 : 0} WHERE id = ${id}`
  );
}

/**
 * 关联演示账户到真实用户
 */
export async function linkDemoAccountToUser(demoAccountId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`UPDATE demoAccounts SET userId = ${userId} WHERE id = ${demoAccountId}`
  );
}
