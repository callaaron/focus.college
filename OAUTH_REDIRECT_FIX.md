# OAuth 重定向问题修复

## 问题描述
用户使用 `aaron` 账户成功登录后，页面跳转到 `oauth-portal.example.com`，导致显示"无法访问此网站"错误。

### 错误现象
1. 输入 `aaron` 账户密码
2. 登录成功
3. 页面显示 "Please sign in to continue"
4. 点击 "Sign in" 按钮后跳转到 `oauth-portal.example.com`
5. 浏览器提示：`oauth-portal.example.com 意外终止了连接`

## 根本原因分析

### 问题1：未认证重定向
在 `DashboardLayout.tsx` 组件中，当用户未登录时，点击 "Sign in" 按钮会调用 `getLoginUrl()` 函数生成 OAuth 登录链接：

```typescript
// 问题代码
<Button onClick={() => {
  window.location.href = getLoginUrl(); // 跳转到 oauth-portal.example.com
}}>
  Sign in
</Button>
```

### 问题2：useAuth Hook 默认重定向
在 `useAuth.ts` hook 中，默认的重定向路径也使用了 `getLoginUrl()`：

```typescript
// 问题代码
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  // ...
}
```

### 问题3：OAuth 配置错误
在 `.env` 文件中，OAuth 服务器URL 配置为占位符：

```env
OAUTH_SERVER_URL=https://oauth-server.example.com
VITE_OAUTH_PORTAL_URL=https://oauth-portal.example.com
```

但应用现在使用**本地用户名密码认证**，不需要 OAuth。

## 解决方案

### 修改1：DashboardLayout.tsx
将 OAuth 登录链接改为本地登录页面：

```typescript
// 修复后
<Button onClick={() => {
  window.location.href = '/login'; // 直接跳转到本地登录页
}}>
  Sign in
</Button>
```

**文件**: `client/src/components/DashboardLayout.tsx`  
**行号**: 90

### 修改2：useAuth.ts
将默认重定向路径改为本地登录页：

```typescript
// 修复后
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = '/login' } =
    options ?? {};
  // ...
}
```

**文件**: `client/src/_core/hooks/useAuth.ts`  
**行号**: 12

## 修改内容汇总

### 代码变更
```diff
# client/src/components/DashboardLayout.tsx
-            window.location.href = getLoginUrl();
+            window.location.href = '/login';

# client/src/_core/hooks/useAuth.ts
-  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
+  const { redirectOnUnauthenticated = false, redirectPath = '/login' } =
```

### Git 提交
```bash
Commit: 9c4d2ae
Message: "fix: Replace OAuth redirects with local login page"
Branch: genspark_ai_developer
```

## 认证流程说明

### 当前认证方式：本地密码登录
系统现在使用完全本地的用户名+密码认证，不依赖任何外部 OAuth 服务：

```
用户输入账号密码
    ↓
前端调用 trpc.auth.localLogin
    ↓
后端验证密码 (bcrypt)
    ↓
创建 JWT session token
    ↓
设置 cookie (COOKIE_NAME)
    ↓
返回成功 → 跳转到 /dashboard
```

### 登录流程
1. **访问**: https://focus-college.pages.dev/login
2. **输入凭证**: 
   - 演示账户: `demo_ceo` / `demo123`
   - 管理员: `aaron` / `admin2024`
3. **点击登录**: 调用本地认证 API
4. **成功登录**: 跳转到 `/dashboard`

### 未登录保护
当用户未登录访问受保护页面时：
1. `useAuth` hook 检测到未认证
2. 自动重定向到 `/login` （而非 OAuth portal）
3. 用户登录后返回原页面

## 部署状态

### 构建结果
```
✓ built in 13.51s
../dist/public/index.html                   367.67 kB │ gzip: 105.59 kB
../dist/public/assets/index-C3JUhENy.css    127.72 kB │ gzip:  19.87 kB
../dist/public/assets/index-DVSPORvG.js   1,803.76 kB │ gzip: 461.60 kB
```

### 部署信息
- **提交**: `9c4d2ae`
- **分支**: `genspark_ai_developer`
- **状态**: ✅ 已推送，触发 Cloudflare Pages 自动部署
- **预计时间**: 2-3 分钟

## 测试验证

### 测试步骤
1. **等待部署完成** (约2-3分钟)
2. **清除浏览器缓存** 或使用无痕模式
3. **访问登录页面**: https://focus-college.pages.dev/login
4. **测试 aaron 账户**:
   - 用户名: `aaron`
   - 密码: `admin2024`
5. **验证登录成功**: 应该成功跳转到 `/dashboard`
6. **测试登出**: 点击右下角头像 → "Sign out"
7. **验证登出重定向**: 应该跳转回 `/login`（而非 OAuth portal）

### 预期结果
- ✅ 登录成功后停留在 `focus-college.pages.dev` 域名
- ✅ 不会跳转到 `oauth-portal.example.com`
- ✅ Dashboard 正常显示
- ✅ 管理员菜单可见（aaron 账户）
- ✅ 登出后返回 `/login` 页面

## 额外说明

### OAuth vs 本地认证
当前系统使用**本地认证**：
- ✅ 用户名密码存储在数据库
- ✅ 密码使用 bcrypt 哈希
- ✅ Session 使用 JWT
- ✅ 完全独立，不依赖外部服务

如果将来需要 OAuth（社交登录），需要：
1. 配置真实的 OAuth 服务器URL
2. 设置 OAuth 应用凭证
3. 实现 OAuth 回调处理
4. 保留本地登录作为备用

### 环境变量说明
`.env` 中的 OAuth 配置可以保留，但不会被使用：
```env
# 这些配置当前不会被使用（本地认证模式）
OAUTH_SERVER_URL=https://oauth-server.example.com
VITE_OAUTH_PORTAL_URL=https://oauth-portal.example.com
```

只要代码中不调用 `getLoginUrl()`，就不会触发 OAuth 流程。

## 相关文档
- [登录问题修复报告](./LOGIN_FIX_COMPLETE.md)
- [管理员设置完整指南](./ADMIN_SETUP_COMPLETE.md)
- [Phase 4 核心功能完成报告](./PHASE4_CORE_FEATURES_COMPLETE.md)

---

**修复完成时间**: 2025-11-24 13:30 UTC  
**修复者**: Claude AI Assistant  
**验证状态**: ✅ 代码修复完成，等待部署验证
