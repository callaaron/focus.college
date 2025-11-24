# Cloudflare Pages 构建配置

## ⚠️ 重要：构建配置检查清单

请在 Cloudflare Pages 仪表板中确认以下配置：

### 1. 构建设置 (Build settings)

```
Framework preset: None
Build command: npm run build
Build output directory: dist/public
Root directory: /
```

### 2. 环境变量 (Environment variables)

**⚠️ 关键：删除以下环境变量（如果存在）：**
- ❌ `VITE_OAUTH_PORTAL_URL`
- ❌ `VITE_APP_ID`  
- ❌ `OAUTH_SERVER_URL`

**必须保留的环境变量：**
- ✅ `JWT_SECRET` - Your JWT secret key
- ✅ `VITE_APP_TITLE` - 创业进化系统
- ✅ `NODE_ENV` - production

### 3. 部署分支 (Production branch)

```
Production branch: main
```

确认 Cloudflare Pages 监听的是 `main` 分支，不是其他分支。

### 4. D1 绑定 (D1 Bindings)

```
Variable name: DB
D1 database: focus-college-db
```

## 🔧 强制重新部署

如果更新了配置，需要触发新的部署：

### 方法 1：通过 Cloudflare 仪表板
1. 进入 Pages 项目
2. 点击 "Deployments"
3. 找到最新的部署
4. 点击 "Retry deployment"

### 方法 2：通过 Git 推送
```bash
# 创建空提交强制触发部署
git commit --allow-empty -m "chore: trigger rebuild"
git push origin main
```

### 方法 3：通过 Wrangler CLI
```bash
# 需要设置 CLOUDFLARE_API_TOKEN
npm run deploy
```

## 🐛 问题诊断

### 检查当前部署的版本

访问：https://focus-college.pages.dev/

在浏览器开发者工具（F12）中：
1. Network 标签
2. 查看加载的 JS 文件名

**期望看到：**
- ✅ `index-DL1fKWsY.js` （新版本，无 OAuth）

**如果看到：**
- ❌ `index-yEvYE53o.js` （旧版本，有 OAuth）
- ❌ `index-C3ACk355.js` （旧版本，有 OAuth）

说明 Cloudflare Pages 没有使用最新代码！

### 检查 JS 文件内容

```bash
# 下载生产环境的 JS 文件
curl -s "https://focus-college.pages.dev/" | grep -o 'src="[^"]*\.js"'

# 检查是否包含 OAuth 代码
curl -s "https://focus-college.pages.dev/assets/index-XXXXX.js" | grep -c "oauth-portal"
```

**如果返回 0：** ✅ 无 OAuth 代码  
**如果返回 > 0：** ❌ 仍有 OAuth 代码

## 📊 当前状态

- GitHub 仓库：https://github.com/callaaron/focus.college
- Main 分支 HEAD：`06b1bef`
- 最新提交："docs: Add comprehensive login refactor summary"

**本地构建文件：**
- `dist/public/assets/index-DL1fKWsY.js` (1,800.20 kB)
- ✅ 不包含 OAuth 代码

**生产环境文件：**
- `index-yEvYE53o.js`
- ❌ **仍包含 OAuth 代码** ← 这是问题所在！

## 🎯 下一步行动

1. **检查 Cloudflare Pages 配置**
   - 确认监听 `main` 分支
   - 删除 OAuth 相关环境变量
   - 检查构建命令是否正确

2. **强制触发新部署**
   - 在 Cloudflare 仪表板手动 "Retry deployment"
   - 或推送新的提交

3. **验证部署成功**
   - 等待构建完成（约 2-5 分钟）
   - 访问 https://focus-college.pages.dev/
   - 检查加载的 JS 文件名是否改变

4. **清空缓存并测试**
   - 使用隐身模式
   - 访问登录页面
   - 测试 Demo 账户登录

## 📞 需要帮助？

如果问题仍然存在，请提供：
1. Cloudflare Pages 构建日志
2. 当前环境变量配置截图
3. 部署历史记录截图
