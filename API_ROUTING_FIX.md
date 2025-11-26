# 🔧 API 路由修复说明

## 问题诊断

### 症状
生产环境出现以下错误：
```
GET /api/trpc/industry.list 404 (Not Found)
GET /api/trpc/competencies.getIndustryComparison 404 (Not Found)
TRPCClientError: No procedure found on path "industry.list"
```

### 根本原因
Cloudflare Pages 的路由配置不正确，导致：
1. API 请求被当作静态文件处理
2. Functions 没有被正确路由
3. `_redirects` 文件中的 SPA fallback 规则拦截了 API 请求

## 解决方案

### 1. 创建 `_routes.json`
告诉 Cloudflare 哪些路径应该由 Functions 处理：

```json
{
  "version": 1,
  "include": [
    "/api/*"
  ],
  "exclude": []
}
```

文件位置：`client/public/_routes.json`

### 2. 修改 `_redirects`
移除会拦截 API 请求的 SPA fallback 规则：

```
# Before (错误的)
/*    /index.html   200

# After (正确的)
# API routes should NOT be redirected - they are handled by Functions
# Note: This is handled by _routes.json
```

文件位置：`client/public/_redirects`

### 3. 保持 `_headers` 不变
安全和缓存头配置保持不变。

文件位置：`client/public/_headers`

## 文件结构

```
webapp/
├── client/
│   └── public/
│       ├── _routes.json    ✅ 新增 - API 路由配置
│       ├── _redirects       ✅ 修改 - 移除 SPA fallback
│       └── _headers         ✓  保持不变
├── functions/
│   └── api/
│       └── trpc/
│           └── [trpc].ts    ✓  Functions 代码
└── dist/
    └── public/
        ├── _routes.json     ← 构建后会复制到这里
        ├── _redirects       ← 构建后会复制到这里
        └── _headers         ← 构建后会复制到这里
```

## 工作原理

### Cloudflare Pages 请求流程

1. **请求到达**: `https://focus-college.pages.dev/api/trpc/...`

2. **检查 `_routes.json`**:
   ```json
   {
     "include": ["/api/*"]
   }
   ```
   → 匹配！这是一个需要 Functions 处理的路径

3. **路由到 Functions**:
   - 请求被转发到 `functions/api/trpc/[trpc].ts`
   - Functions 处理 tRPC 请求
   - 返回 JSON 响应

4. **不匹配的请求**:
   - 请求如 `/` 或 `/profile` 不匹配 `/api/*`
   - 由静态文件服务处理
   - 返回 `index.html`（SPA 模式）

### 为什么之前失败？

**旧配置**:
```
# _redirects
/*    /index.html   200  ← 拦截所有请求，包括 /api/*
```

**结果**:
- `/api/trpc/industry.list` 被重定向到 `/index.html`
- Functions 永远不会被调用
- 浏览器收到 HTML 而不是 JSON
- 404 错误

**新配置**:
```json
// _routes.json
{
  "include": ["/api/*"]
}
```

**结果**:
- `/api/*` 路径由 Functions 处理
- 其他路径由静态文件服务处理
- ✅ API 正常工作

## 部署步骤

### 1. 提交更改

```bash
git add -A
git commit -m "fix: Add _routes.json to fix API routing in Cloudflare Pages"
git push origin main
```

### 2. Cloudflare 自动部署

Cloudflare 会自动检测到 main 分支更新并重新部署。

### 3. 验证修复

部署完成后（约3分钟），访问：
```
https://focus-college.pages.dev
```

检查：
- ✅ 首页加载正常
- ✅ API 请求成功（200 状态码）
- ✅ 用户画像配置中可以选择行业类型
- ✅ 无 404 错误

### 4. 浏览器控制台检查

打开浏览器开发者工具（F12）→ Network 标签：

**正常的请求**:
```
GET /api/trpc/industry.list?batch=1&input=... 200 OK
Response: {"0":{"result":{"data":{"json":[...]}}}}
```

**之前的错误**:
```
GET /api/trpc/industry.list?batch=1&input=... 404 Not Found
Response: <!DOCTYPE html>... (HTML instead of JSON)
```

## 技术细节

### `_routes.json` 配置选项

```json
{
  "version": 1,
  "include": [
    "/api/*"       // Functions 处理
  ],
  "exclude": [
    "/api/static/*" // 可选：排除某些路径
  ]
}
```

**注意**:
- `include` - 由 Functions 处理的路径
- `exclude` - 不由 Functions 处理的路径（即使匹配 include）
- 路径支持通配符 `*`
- 路径不支持正则表达式

### Functions 文件路径映射

Cloudflare Pages Functions 使用文件系统路由：

```
functions/api/trpc/[trpc].ts
         ↓
/api/trpc/*
```

**命名规则**:
- `[param]` - 动态参数
- `[[param]]` - 可选参数
- `index` - 默认文件

**示例**:
```
functions/
  api/
    auth/
      login.ts       → /api/auth/login
      register.ts    → /api/auth/register
    trpc/
      [trpc].ts      → /api/trpc/* (catch-all)
```

## 常见问题

### Q: 为什么不能在 `_redirects` 中使用负向匹配？

A: Cloudflare Pages 的 `_redirects` 不支持复杂的模式匹配。正确的方法是使用 `_routes.json` 显式声明哪些路径由 Functions 处理。

### Q: 可以同时使用 `_redirects` 和 `_routes.json` 吗？

A: 可以，但要注意优先级：
1. `_routes.json` - 决定是否由 Functions 处理
2. `_redirects` - 处理非 Functions 路径的重定向
3. 静态文件 - 如果没有重定向规则，返回静态文件

### Q: 如果 API 路径改变了怎么办？

A: 更新 `_routes.json` 中的 `include` 数组：

```json
{
  "include": [
    "/api/*",
    "/trpc/*",
    "/graphql"
  ]
}
```

### Q: 如何调试 Functions 路由问题？

A: 使用 Cloudflare Dashboard:
1. Pages → focus-college → Functions
2. 查看 Functions 日志
3. 或使用 wrangler: `npx wrangler pages deployment tail`

## 参考文档

- [Cloudflare Pages Functions Routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Cloudflare Pages _routes.json](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-routing)
- [Cloudflare Pages Redirects](https://developers.cloudflare.com/pages/platform/redirects/)

## 总结

### 修复前
```
用户请求 → Cloudflare → _redirects (/*) → index.html ❌
```

### 修复后
```
/api/* → Cloudflare → _routes.json → Functions → tRPC → JSON ✅
其他路径 → Cloudflare → 静态文件 → index.html ✅
```

---

**修复完成！重新部署后，API 应该可以正常工作了。** 🎉
