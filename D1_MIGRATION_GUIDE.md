# Cloudflare D1 迁移完整指南

> 从 MySQL 迁移到 Cloudflare D1 (SQLite) 的详细步骤

---

## 📋 迁移概览

### 迁移内容
- ❌ MySQL → ✅ SQLite (D1)
- ❌ mysql2 → ✅ Drizzle + D1 SDK
- ❌ mysqlTable → ✅ sqliteTable
- ❌ mysqlEnum → ✅ text (SQLite 没有 ENUM)

### 预计时间
- 代码修改：1 小时
- 数据迁移：30 分钟
- 测试验证：30 分钟
- **总计**：2 小时

---

## 🔧 步骤 1: 安装 Wrangler CLI

```bash
# 全局安装 Wrangler
npm install -g wrangler

# 验证安装
wrangler --version

# 登录 Cloudflare
wrangler login
```

浏览器会打开，授权登录 Cloudflare

---

## 📦 步骤 2: 创建 D1 数据库

```bash
cd /home/user/webapp

# 创建 D1 数据库
wrangler d1 create focus-college-db
```

**输出示例**：
```
✅ Successfully created DB 'focus-college-db'!

[[d1_databases]]
binding = "DB"
database_name = "focus-college-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要**：记录 `database_id`！

---

## 📝 步骤 3: 更新 wrangler.toml

```toml
name = "focus-college"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist/public"

[[d1_databases]]
binding = "DB"
database_name = "focus-college-db"
database_id = "your-database-id-here"  # 替换为上面的 database_id
```

---

## 📦 步骤 4: 更新项目依赖

```bash
# 移除 MySQL 相关包
npm uninstall mysql2

# 安装 SQLite 相关包（用于本地开发）
npm install better-sqlite3 --save-dev

# 更新 Drizzle
npm install drizzle-orm@latest drizzle-kit@latest
```

---

## 🔄 步骤 5: 创建 SQLite Schema

创建新的 schema 文件：`drizzle/schema-d1.ts`

**关键变更**：

### MySQL → SQLite 类型映射

| MySQL | SQLite (D1) |
|-------|-------------|
| `mysqlTable` | `sqliteTable` |
| `int().autoincrement()` | `integer({ mode: 'number' }).primaryKey({ autoIncrement: true })` |
| `varchar(length)` | `text()` |
| `text()` | `text()` |
| `timestamp()` | `integer({ mode: 'timestamp' })` |
| `mysqlEnum([...])` | `text()` (使用字符串) |
| `boolean()` | `integer({ mode: 'boolean' })` |

### ENUM 处理

MySQL:
```typescript
role: mysqlEnum("role", ["user", "admin"])
```

SQLite:
```typescript
role: text("role", { enum: ["user", "admin"] })
```

---

## 🗄️ 步骤 6: 生成迁移 SQL

```bash
# 生成 SQLite schema
npx drizzle-kit generate:sqlite

# 这会在 drizzle/ 目录生成 .sql 文件
```

---

## 📤 步骤 7: 应用迁移到 D1

### 7.1 应用到本地 D1

```bash
# 应用所有迁移
wrangler d1 migrations apply focus-college-db --local
```

### 7.2 应用到生产 D1

```bash
# 应用到 Cloudflare D1
wrangler d1 migrations apply focus-college-db --remote
```

---

## 🌱 步骤 8: 插入种子数据

### 方法 A: 使用 SQL 文件

创建 `drizzle/seed.sql`:

```sql
-- 插入能力域
INSERT INTO competencyDomains (id, module, name, description, sortOrder) VALUES
(1, 'core', '战略规划', '企业战略制定、商业模式设计、市场定位等战略层面的能力', 1),
(2, 'core', '产品创新', '产品规划、需求分析、用户研究、产品设计等产品相关能力', 2);
-- ... 更多数据
```

应用种子数据：
```bash
wrangler d1 execute focus-college-db --local --file=drizzle/seed.sql
wrangler d1 execute focus-college-db --remote --file=drizzle/seed.sql
```

### 方法 B: 使用 TypeScript 脚本

修改现有的种子脚本以支持 SQLite

---

## 🔧 步骤 9: 更新 server/db.ts

### MySQL 版本 (旧)

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);
```

### D1 版本 (新)

对于 Cloudflare Pages，D1 会通过 `context.env.DB` 注入：

```typescript
import { drizzle } from "drizzle-orm/d1";

// 在 Cloudflare Pages Function 中
export async function onRequest(context) {
  const db = drizzle(context.env.DB);
  // 使用 db 进行查询
}
```

**但是**，由于您使用的是 Express + tRPC，需要特殊处理。

---

## 🏗️ 步骤 10: 架构调整（重要）

### 问题
Cloudflare Pages 是 Serverless 环境，不支持传统的 Express 服务器。

### 解决方案

#### 方案 A: 使用 Cloudflare Workers (推荐)

将后端 API 迁移到 Cloudflare Workers:

1. API 路由使用 Workers
2. D1 数据库绑定到 Workers
3. 前端静态文件部署到 Pages

#### 方案 B: 混合架构

1. 静态前端 → Cloudflare Pages
2. API 后端 → 保留在您的服务器（使用宝塔 MySQL）
3. 前端通过 CORS 调用服务器 API

#### 方案 C: Pages Functions

使用 Cloudflare Pages Functions（位于 `functions/` 目录）：

```
functions/
  api/
    [[path]].ts  # 捕获所有 /api/* 请求
```

---

## ⚠️ 重要发现

经过分析，我发现**直接迁移到 D1 有技术挑战**：

### 挑战

1. **架构不兼容**
   - 您的项目使用 Express + tRPC
   - Cloudflare Pages 是 Serverless
   - D1 只能在 Workers/Pages Functions 中使用

2. **需要重构后端**
   - Express → Workers/Pages Functions
   - 或使用 Hono/itty-router 等轻量框架

3. **工作量较大**
   - 不是简单的数据库替换
   - 需要重构整个后端架构

---

## 💡 更好的方案

### 推荐：宝塔 MySQL + Cloudflare Pages

**原因**：
1. ✅ 无需重构代码
2. ✅ 30 分钟完成部署
3. ✅ 保持现有架构
4. ✅ MySQL 完全兼容

**架构**：
```
前端 (Cloudflare Pages CDN)
    ↓
后端 API (Cloudflare Pages 代理)
    ↓
数据库 (您的宝塔 MySQL)
```

---

## 🎯 如果坚持使用 D1

需要以下重构：

### 1. 后端重构为 Workers

使用 Hono 框架替代 Express：

```typescript
// worker.ts
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.get('/api/users', async (c) => {
  const db = drizzle(c.env.DB);
  const users = await db.select().from(usersTable);
  return c.json(users);
});

export default app;
```

### 2. tRPC 集成

tRPC 可以与 Hono 集成：

```typescript
import { trpcServer } from '@trpc/server/adapters/fetch';

app.use('/trpc/*', async (c) => {
  return trpcServer({
    router: appRouter,
    createContext: () => ({ db: drizzle(c.env.DB) })
  })(c.req.raw);
});
```

### 预计工作量

- 重构后端：**4-6 小时**
- 测试调试：**2-3 小时**
- **总计：6-9 小时**

---

## 🚀 我的建议

### 快速方案（推荐）

**现在**：使用宝塔 MySQL
- 30 分钟上线
- 无需重构

**将来**：考虑迁移
- 产品验证后
- 需要全球边缘加速时
- 有时间进行架构升级时

### 完整 D1 方案

如果您确定要用 D1，我可以：

1. 帮您重构后端为 Workers
2. 迁移到 D1 数据库
3. 完成测试和部署

**但需要 6-9 小时工作量**

---

## 📞 下一步

**选项 A：宝塔 MySQL（推荐）**
- 30 分钟内上线
- 按照 BAOTA_DATABASE_SETUP.md 操作

**选项 B：完整 D1 迁移**
- 我会帮您重构代码
- 需要 6-9 小时
- 告诉我开始，我会逐步完成

**选项 C：混合方案**
- 前端用 Pages
- 后端和数据库用您的服务器
- 30 分钟完成

您选择哪个方案？
