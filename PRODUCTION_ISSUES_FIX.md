# 生产环境问题修复指南

## 问题概述

用户登录后出现以下错误：
1. ❌ **401 Unauthorized** - 认证失败
2. ❌ **404 Not Found** - `competencies.myProgress` 端点不存在  
3. ❌ **Disconnected错误** - WebSocket 连接问题

## 根本原因

### 原因1: D1 Router 不完整
生产环境使用 **Cloudflare D1 数据库**和 `server/routers-d1.ts`，但这个文件是简化版本，缺少很多端点。

**问题代码**: `functions/api/trpc/[trpc].ts`
```typescript
import { appRouter } from '../../../server/routers-d1';  // ← 使用 D1 版本
```

**影响**: 
- `competencies.myProgress` 端点不存在 → 404 错误
- 其他很多端点也可能缺失

### 原因2: Cookie 无法在 Cloudflare Pages Functions 中设置
Cloudflare Pages Functions 是无状态的边缘函数，**不支持设置 HTTP Cookie**。

**问题**: `auth.localLogin` 在登录成功后尝试设置 cookie，但在 Pages Functions 中这个操作会静默失败。

```typescript
// server/routers.ts - auth.localLogin
ctx.res.cookie(COOKIE_NAME, sessionToken, {  
  ...cookieOptions,
  maxAge: ONE_YEAR_MS,
});  // ← 这在 Cloudflare Pages Functions 中不工作！
```

**结果**: 登录"成功"但没有 session cookie → 后续请求 401 Unauthorized

### 原因3: 架构不匹配
- **开发环境**: 使用 Express + MySQL + `routers.ts`
- **生产环境**: 使用 Cloudflare Pages Functions + D1 + `routers-d1.ts`

这两个环境的 API 实现不一致。

## 已完成的修复

### ✅ 修复1: 添加 myProgress 端点到 D1 Router

**文件**: `server/routers-d1.ts`  
**修改**: 在 competenciesRouter 中添加 `myProgress` 端点

```typescript
myProgress: protectedProcedure.query(async ({ ctx }) => {
  const { db, user } = ctx;
  
  // Get all competencies
  const allCompetencies = await db
    .select()
    .from(schema.competencies)
    .orderBy(schema.competencies.sortOrder);
  
  // Get user's scores
  const userScores = await db
    .select()
    .from(schema.competencyScores)
    .where(eq(schema.competencyScores.userId, user.id));
  
  // Merge and return
  return allCompetencies.map(comp => {
    const score = userScores.find(s => s.competencyId === comp.id);
    return {
      ...comp,
      userProgress: score ? {
        currentLevel: score.level || 0,
        selfAssessed: score.selfAssessedScore || 0,
        aiAssessed: score.aiAssessedScore || 0,
        practiceCount: 0,
        status: (score.level || 0) >= 3 ? "mastered" : 
                (score.level || 0) >= 1 ? "learning" : "not_started"
      } : {
        currentLevel: 0,
        selfAssessed: 0,
        aiAssessed: 0,
        practiceCount: 0,
        status: "not_started"
      }
    };
  });
}),
```

**状态**: ✅ 已提交并推送  
**Commit**: `c2e2960`

## 待解决的问题

### 🔴 问题: Cookie 认证在 Cloudflare Pages Functions 中不工作

Cloudflare Pages Functions 是**边缘函数**（类似 Lambda），运行在 Cloudflare 的边缘网络上。它们：
- ❌ **无状态** - 每个请求独立，无法维护状态
- ❌ **不支持 Set-Cookie header** - 响应会被过滤
- ❌ **不支持传统的 Express req/res 对象**

### 解决方案选项

#### 选项A: 使用 Cloudflare Access Token（推荐）
使用 Cloudflare 提供的认证机制：

1. **前端**: 登录成功后将 token 存储在 `localStorage`
```typescript
// Login.tsx
const loginMutation = trpc.auth.localLogin.useMutation({
  onSuccess: (data) => {
    // 存储 token
    localStorage.setItem('auth_token', data.token);
    // 跳转
    window.location.href = '/dashboard';
  }
});
```

2. **后端**: 在 tRPC context 中从 header 读取 token
```typescript
// functions/api/trpc/[trpc].ts
createContext: async (opts) => {
  const token = opts.req.headers.get('Authorization')?.replace('Bearer ', '');
  // 验证 token
  return createD1Context({
    ...opts,
    env: context.env,
    token,
  });
}
```

3. **tRPC 客户端**: 自动附加 Authorization header
```typescript
// client/src/lib/trpc.ts
export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: () => {
        const token = localStorage.getItem('auth_token');
        return token ? {
          Authorization: `Bearer ${token}`
        } : {};
      },
    }),
  ],
});
```

#### 选项B: 使用 Cloudflare Workers KV（备选）
将 session 数据存储在 KV 存储中：

1. 创建 KV namespace
2. 登录时生成 session ID，存储到 KV
3. 返回 session ID 给客户端
4. 客户端在后续请求中发送 session ID
5. 后端从 KV 读取 session 数据

**缺点**: 增加延迟，需要额外配置

#### 选项C: 切换到 Cloudflare Workers（重构）
不使用 Pages Functions，而是使用完整的 Cloudflare Workers：

1. Workers 支持更完整的 HTTP API
2. 可以设置 cookie
3. 但需要重构整个部署架构

**缺点**: 工作量大

## 推荐的修复步骤

### 📋 Step 1: 实现 Token-based 认证

#### 1.1 修改后端 auth.localLogin
```typescript
// server/routers-d1.ts - authRouter
localLogin: publicProcedure
  .input(z.object({
    username: z.string(),
    password: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // ... 验证用户密码 ...
    
    // 创建 JWT token
    const token = await createJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, JWT_SECRET);
    
    return {
      success: true,
      token,  // ← 返回 token 而不是设置 cookie
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }),
```

#### 1.2 修改前端 Login.tsx
```typescript
const loginMutation = trpc.auth.localLogin.useMutation({
  onSuccess: (data) => {
    // 存储 token 到 localStorage
    localStorage.setItem('auth_token', data.token);
    // 跳转
    window.location.href = '/dashboard';
  },
  onError: (err) => {
    setError(err.message);
  }
});
```

#### 1.3 修改 tRPC 客户端
```typescript
// client/src/lib/trpc.ts
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: () => {
        const token = localStorage.getItem('auth_token');
        return token ? {
          Authorization: `Bearer ${token}`
        } : {};
      },
    }),
  ],
});
```

#### 1.4 修改 tRPC Context
```typescript
// server/_core/trpc-d1.ts
export async function createD1Context(opts: CreateContextOptions) {
  const token = opts.req.headers.get('Authorization')?.replace('Bearer ', '');
  
  let user: User | null = null;
  
  if (token) {
    try {
      const payload = await verifyJWT(token, JWT_SECRET);
      user = await getUserById(payload.userId, opts.env.DB);
    } catch (err) {
      console.error('Token verification failed:', err);
    }
  }
  
  return {
    db: drizzle(opts.env.DB, { schema }),
    user,
  };
}
```

### 📋 Step 2: 补全 D1 Router

需要将 `server/routers.ts` 中的所有端点迁移到 `server/routers-d1.ts`：

**缺失的端点**:
- `profile.create`, `profile.update`
- `competencies.getRecommended`, `competencies.getAIRecommendations`
- `assessment.*` (大部分端点)
- `scenarios.*` (大部分端点)
- 等等...

### 📋 Step 3: 数据库迁移

将生产环境的用户数据从 D1 迁移到 D1 或确保 D1 schema 完整：

```sql
-- 检查现有表
SELECT name FROM sqlite_master WHERE type='table';

-- 确保所有必要的表存在
-- users, competencies, competencyScores, 等等...
```

## 当前状态

### ✅ 已修复
- myProgress 端点 404 错误

### 🔄 进行中
- 等待 Cloudflare Pages 部署新版本（约 2-5 分钟）

### ⏳ 待修复
- Cookie 认证问题（需要实现 Token-based auth）
- D1 Router 不完整（需要补全端点）

## 临时解决方案

如果需要快速让系统工作，可以：

1. **使用本地开发环境**:
   ```bash
   cd /home/user/webapp
   npm run dev
   ```
   本地环境使用 MySQL + 完整的 `routers.ts`，所有功能正常。

2. **等待 Token-based 认证实现**:
   这是生产环境的正确解决方案。

## 相关文档
- [OAuth 重定向修复](./OAUTH_REDIRECT_FIX.md)
- [登录修复报告](./LOGIN_FIX_COMPLETE.md)
- [管理员设置指南](./ADMIN_SETUP_COMPLETE.md)

---

**文档创建时间**: 2025-11-24  
**最后更新**: c2e2960 commit  
**下一步**: 实现 Token-based 认证
