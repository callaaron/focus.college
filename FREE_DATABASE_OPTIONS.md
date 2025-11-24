# 免费数据库方案对比

> PlanetScale 已取消免费套餐，以下是真正免费的替代方案

---

## 📊 方案对比

| 数据库 | 免费额度 | 连接数 | 存储 | 外网访问 | 推荐度 |
|--------|---------|--------|------|----------|--------|
| **Neon** | ✅ 永久免费 | 100 | 512 MB | ✅ | ⭐⭐⭐⭐⭐ |
| **Supabase** | ✅ 永久免费 | 60 | 500 MB | ✅ | ⭐⭐⭐⭐⭐ |
| **Railway** | 🎁 $5 试用 | 无限 | 1 GB | ✅ | ⭐⭐⭐⭐ |
| **Turso** | ✅ 永久免费 | 无限 | 9 GB | ✅ | ⭐⭐⭐⭐ |
| **PlanetScale** | ❌ 无免费 | - | - | - | ⭐⭐ |

---

## 🥇 方案一：Neon（推荐）

### 优点
- ✅ **永久免费**
- ✅ **PostgreSQL** 完全兼容（需修改少量代码）
- ✅ 512 MB 存储
- ✅ 100 个并发连接
- ✅ 自动扩缩容
- ✅ 支持 Cloudflare Workers

### 免费额度
- **存储**: 512 MB
- **计算**: 191.9 小时/月（足够使用）
- **数据传输**: 5 GB/月
- **分支**: 10 个（用于开发测试）

### 注册步骤

1. 访问：https://neon.tech/
2. 点击 **Sign up**
3. 使用 GitHub 登录（快速）
4. 创建项目：
   - Project name: `focus-college`
   - Region: 选择 **Asia Pacific (Singapore)**（新加坡最快）
   - PostgreSQL version: 16（最新）
5. 点击 **Create Project**
6. 获取连接字符串

### 连接字符串示例
```
postgres://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### ⚠️ 需要的代码修改

由于 Neon 使用 PostgreSQL，需要修改：

**1. 安装 PostgreSQL 驱动**
```bash
npm install pg
npm uninstall mysql2
```

**2. 修改 Drizzle 配置**
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // 改为 postgresql
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**3. 修改 schema 导入**
```typescript
// drizzle/schema.ts
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

// 所有 mysqlTable 改为 pgTable
// 所有 int() 改为 serial()
// 所有 mysqlEnum 改为 text() 或 varchar()
```

**复杂度**: ⭐⭐⭐ 中等（需要修改代码）

---

## 🥈 方案二：Supabase（推荐）

### 优点
- ✅ **永久免费**
- ✅ **PostgreSQL** + 自带 API
- ✅ 500 MB 存储
- ✅ 60 个并发连接
- ✅ 自带用户认证系统
- ✅ 实时订阅功能

### 免费额度
- **存储**: 500 MB
- **数据传输**: 5 GB/月
- **API 请求**: 无限
- **用户认证**: 50,000 MAU

### 注册步骤

1. 访问：https://supabase.com/
2. 点击 **Start your project**
3. 使用 GitHub 登录
4. 创建项目：
   - Organization: 选择或创建
   - Name: `focus-college`
   - Database Password: 自动生成（保存好）
   - Region: 选择 **Southeast Asia (Singapore)**
5. 点击 **Create new project**
6. 等待 1-2 分钟初始化
7. 在 Settings → Database 获取连接字符串

### 连接字符串示例
```
postgres://postgres:password@db.xxx.supabase.co:5432/postgres
```

### ⚠️ 需要的代码修改
与 Neon 相同（PostgreSQL）

**复杂度**: ⭐⭐⭐ 中等（需要修改代码）

---

## 🥉 方案三：Railway（推荐，最简单）

### 优点
- ✅ **$5 试用额度**（够用 1-2 个月）
- ✅ **MySQL 支持**（无需修改代码！）
- ✅ 也支持 PostgreSQL
- ✅ 简单易用
- ✅ 自动备份

### 免费/试用额度
- **试用**: $5 免费额度
- **使用后**: $5/月起
- **存储**: 根据用量计费

### 注册步骤

1. 访问：https://railway.app/
2. 点击 **Login**
3. 使用 GitHub 登录
4. 获得 $5 试用额度
5. 点击 **New Project**
6. 选择 **Provision MySQL**
7. 等待数据库创建
8. 点击数据库实例
9. 在 **Connect** 标签获取连接字符串

### 连接字符串示例
```
mysql://root:password@containers-us-west-xxx.railway.app:5555/railway
```

### ✅ 无需代码修改
Railway 提供 MySQL，与现有代码完全兼容！

**复杂度**: ⭐ 简单（无需修改代码）

---

## 🔧 方案四：Turso（SQLite）

### 优点
- ✅ **永久免费**
- ✅ **9 GB 存储**（最大）
- ✅ 基于 LibSQL（SQLite 兼容）
- ✅ 边缘部署
- ✅ 无限连接数

### 免费额度
- **存储**: 9 GB（远超其他方案）
- **行数**: 10 亿行
- **位置**: 3 个
- **数据库**: 500 个

### 注册步骤

1. 访问：https://turso.tech/
2. 点击 **Sign Up**
3. 使用 GitHub 登录
4. 安装 CLI：
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
5. 登录：
   ```bash
   turso auth login
   ```
6. 创建数据库：
   ```bash
   turso db create focus-college --group default
   ```
7. 获取连接字符串：
   ```bash
   turso db show focus-college --url
   ```

### 连接字符串示例
```
libsql://focus-college-xxx.turso.io
```

### ⚠️ 需要的代码修改
需要切换到 LibSQL 驱动（类似 SQLite）

**复杂度**: ⭐⭐⭐⭐ 较复杂

---

## 🎯 推荐方案总结

### 如果您想最快上线（不想改代码）
👉 **Railway** - $5 试用，MySQL 兼容，零代码修改

### 如果您想完全免费且长期使用
👉 **Neon** 或 **Supabase** - 永久免费，需要迁移到 PostgreSQL

### 如果您需要大存储空间
👉 **Turso** - 9 GB 免费存储

---

## ⚡ 快速决策

### 我的建议（基于您的需求）

**短期方案（1-2 个月内上线）**：
```
Railway ($5 试用)
↓
无需修改代码
↓
10 分钟即可完成
```

**长期方案（持续免费）**：
```
Neon 或 Supabase
↓
需要迁移到 PostgreSQL
↓
30-60 分钟完成迁移
```

---

## 💡 我的推荐

### 方案 A：快速上线（推荐）

**第一阶段**（现在）：
- 使用 **Railway** + $5 试用
- 立即部署，无需改代码
- 验证业务模型

**第二阶段**（1-2 个月后）：
- 如果产品可行，迁移到 **Neon**（免费）
- 或者继续使用 Railway（$5/月）

### 方案 B：一步到位

直接使用 **Neon** 或 **Supabase**：
- 永久免费
- 需要花 30-60 分钟迁移代码
- 长期稳定

---

## 🔄 代码迁移难度对比

| 方案 | 数据库类型 | 需要修改 | 预计时间 | 难度 |
|------|-----------|---------|---------|------|
| Railway | MySQL | ❌ 无需 | 10 分钟 | ⭐ |
| Neon | PostgreSQL | ✅ 需要 | 30-60 分钟 | ⭐⭐⭐ |
| Supabase | PostgreSQL | ✅ 需要 | 30-60 分钟 | ⭐⭐⭐ |
| Turso | LibSQL | ✅ 需要 | 1-2 小时 | ⭐⭐⭐⭐ |

---

## 🎯 您的选择？

请告诉我您的选择：

1. **Railway** - 快速上线，$5 试用（推荐）
2. **Neon** - 永久免费，需要迁移代码
3. **Supabase** - 永久免费，需要迁移代码
4. **其他方案**

我会根据您的选择提供详细的配置步骤！

---

## 📞 需要帮助？

无论选择哪个方案，我都会：
1. 提供详细的注册步骤
2. 生成正确的连接字符串
3. 如果需要，帮助迁移代码
4. 确保数据库正确初始化

让我知道您的选择，我们继续前进！🚀
