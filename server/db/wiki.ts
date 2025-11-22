import { sql } from "drizzle-orm";
import { getDb } from "../db";

export interface WikiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WikiArticle {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  tags: string | null;
  sortOrder: number;
  viewCount: number;
  isPublished: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertWikiCategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export interface InsertWikiArticle {
  categoryId: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  tags?: string;
  sortOrder?: number;
  isPublished?: number;
}

/**
 * 获取所有Wiki分类
 */
export async function getAllWikiCategories(): Promise<WikiCategory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`SELECT * FROM wikiCategories ORDER BY sortOrder ASC, id ASC`
  );

  return result as WikiCategory[];
}

/**
 * 根据slug获取分类
 */
export async function getWikiCategoryBySlug(slug: string): Promise<WikiCategory | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`SELECT * FROM wikiCategories WHERE slug = ${slug} LIMIT 1`
  );

  return result.length > 0 ? (result[0] as WikiCategory) : null;
}

/**
 * 获取分类下的所有文章
 */
export async function getArticlesByCategory(categoryId: number): Promise<WikiArticle[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`SELECT * FROM wikiArticles 
        WHERE categoryId = ${categoryId} AND isPublished = 1 
        ORDER BY sortOrder ASC, id ASC`
  );

  return result as WikiArticle[];
}

/**
 * 根据slug获取文章
 */
export async function getWikiArticleBySlug(slug: string): Promise<WikiArticle | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`SELECT * FROM wikiArticles WHERE slug = ${slug} AND isPublished = 1 LIMIT 1`
  );

  if (result.length > 0) {
    // 增加浏览次数
    await db.execute(
      sql`UPDATE wikiArticles SET viewCount = viewCount + 1 WHERE id = ${result[0].id}`
    );
    return result[0] as WikiArticle;
  }

  return null;
}

/**
 * 搜索文章
 */
export async function searchWikiArticles(keyword: string): Promise<WikiArticle[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const searchTerm = `%${keyword}%`;
  const result: any = await db.execute(
    sql`SELECT * FROM wikiArticles 
        WHERE isPublished = 1 
        AND (title LIKE ${searchTerm} OR content LIKE ${searchTerm} OR tags LIKE ${searchTerm})
        ORDER BY viewCount DESC
        LIMIT 20`
  );

  return result as WikiArticle[];
}

/**
 * 创建Wiki分类
 */
export async function createWikiCategory(data: InsertWikiCategory): Promise<WikiCategory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`INSERT INTO wikiCategories (name, slug, description, icon, sortOrder) 
        VALUES (${data.name}, ${data.slug}, ${data.description || null}, ${data.icon || null}, ${data.sortOrder || 0})`
  );

  const newCategory: any = await db.execute(
    sql`SELECT * FROM wikiCategories WHERE id = ${result.insertId}`
  );

  return newCategory[0] as WikiCategory;
}

/**
 * 创建Wiki文章
 */
export async function createWikiArticle(data: InsertWikiArticle): Promise<WikiArticle> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`INSERT INTO wikiArticles (categoryId, title, slug, content, summary, tags, sortOrder, isPublished) 
        VALUES (${data.categoryId}, ${data.title}, ${data.slug}, ${data.content}, ${data.summary || null}, ${data.tags || null}, ${data.sortOrder || 0}, ${data.isPublished ?? 1})`
  );

  const newArticle: any = await db.execute(
    sql`SELECT * FROM wikiArticles WHERE id = ${result.insertId}`
  );

  return newArticle[0] as WikiArticle;
}

/**
 * 获取所有文章（包含分类信息）
 */
export async function getAllWikiArticlesWithCategory(): Promise<(WikiArticle & { categoryName: string })[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.execute(
    sql`SELECT a.*, c.name as categoryName 
        FROM wikiArticles a 
        LEFT JOIN wikiCategories c ON a.categoryId = c.id 
        WHERE a.isPublished = 1 
        ORDER BY a.viewCount DESC`
  );

  return result as (WikiArticle & { categoryName: string })[];
}
