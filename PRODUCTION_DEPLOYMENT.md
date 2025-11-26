# 🚀 生产环境部署完整指南

> 挑战系统完整版本 - 生产环境部署步骤

---

## 📋 部署前检查清单

✅ **代码状态：**
- [x] 挑战系统完整实现（30题 + 成就系统）
- [x] 所有代码已推送到 GitHub main 分支
- [x] PR #7 已合并
- [x] 数据库 schema 已更新

✅ **文件准备：**
- [x] `scripts/seed-challenges.sql` - 30题题库 + 10个成就
- [x] `drizzle/schema.ts` - 完整数据库架构
- [x] 前端组件完整（Challenge.tsx, Achievements.tsx, AchievementCard.tsx）

---

## 🎯 方式一：Cloudflare Pages GitHub 自动部署（推荐）⭐

### 优势：
- ✅ 自动化 CI/CD
- ✅ 每次 push 到 main 自动部署
- ✅ 免费 HTTPS 证书
- ✅ 全球 CDN 加速
- ✅ 无需本地构建

### 步骤：

#### 1. 登录 Cloudflare Dashboard
```
访问：https://dash.cloudflare.com/
```

#### 2. 创建或配置 Pages 项目

**选项 A：创建新项目**
1. 导航至：Workers & Pages → Create application → Pages
2. 点击 "Connect to Git"
3. 授权 Cloudflare 访问 GitHub
4. 选择仓库：`callaaron/focus.college`

**选项 B：配置现有项目 (focus-college)**
1. 导航至：Workers & Pages → focus-college
2. Settings → Builds & deployments
3. 点击 "Configure Production deployments" 或 "Connect to Git"

#### 3. 配置构建设置

```yaml
项目名称: focus-college
生产分支: main
框架预设: None (或 Vite)
构建命令: npm run build
构建输出目录: dist/public
根目录: /
Node.js 版本: 20
```

#### 4. 配置环境变量

在 **Settings → Environment variables** 中添加（针对 Production）：

```bash
# 必需变量
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long-change-this
NODE_ENV=production
VITE_APP_TITLE=创业进化系统

# 数据库配置 (如果使用外部 MySQL)
DATABASE_URL=mysql://user:password@host:port/database

# OAuth 配置 (如果需要)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.com
OWNER_OPEN_ID=your-owner-id

# OpenAI API (可选)
OPENAI_API_KEY=sk-your-openai-api-key
```

**重要说明：**
- `JWT_SECRET` 必须是强密码（至少32个字符）
- 生产环境不要使用 development 密钥
- D1 数据库绑定已在 `wrangler.toml` 中配置

#### 5. 配置 D1 数据库绑定

确认 `wrangler.toml` 中的 D1 配置（已配置好）：
```toml
[[d1_databases]]
binding = "DB"
database_name = "focus-college-db"
database_id = "b0d56259-a031-4331-9a9a-220cac6eda02"
```

#### 6. 保存并触发首次部署

点击 "Save and Deploy" 后：
- Cloudflare 会自动克隆代码
- 运行 `npm install`
- 执行 `npm run build`
- 部署到全球 CDN
- **预计时间：3-5 分钟**

#### 7. 监控部署状态

在 Deployments 标签页查看：
- ✅ Build successful
- ✅ Deployment successful
- 🌐 访问 URL: https://focus-college.pages.dev

---

## 🔧 方式二：命令行部署（需要 Cloudflare API Token）

### 前置要求：

1. **获取 Cloudflare API Token**
   - 访问：https://dash.cloudflare.com/profile/api-tokens
   - 点击 "Create Token"
   - 选择 "Edit Cloudflare Workers" 模板
   - 或创建自定义 Token，权限：
     - Account → Cloudflare Pages → Edit
     - Account → D1 → Edit
   - 复制 Token

2. **配置 Token**
   ```bash
   # 方式 A：设置环境变量（临时）
   export CLOUDFLARE_API_TOKEN=your_token_here
   
   # 方式 B：使用 wrangler login（持久）
   npx wrangler login
   # 会打开浏览器完成授权
   ```

### 部署步骤：

```bash
# 1. 确保在项目目录
cd /home/user/webapp

# 2. 确保在 main 分支
git checkout main
git pull origin main

# 3. 安装依赖（如果需要）
npm install

# 4. 构建项目
npm run build
# 预计时间：2-5分钟
# 输出目录：dist/public

# 5. 部署到 Cloudflare Pages
npx wrangler pages deploy dist/public --project-name=focus-college

# 6. 等待部署完成
# 会显示部署 URL
```

### 快速部署脚本：

项目已包含 `scripts/direct-deploy.sh`：

```bash
# 运行直接部署脚本
npm run deploy:direct

# 或直接执行
bash scripts/direct-deploy.sh
```

---

## 💾 数据库部署

### D1 数据库迁移

部署完成后，需要应用数据库迁移和导入题库数据。

#### 1. 应用数据库迁移

```bash
# 生成迁移文件（如果尚未生成）
npm run db:generate:d1

# 应用迁移到远程 D1 数据库
npx wrangler d1 migrations apply focus-college-db --remote
```

#### 2. 导入挑战题库数据

**方式 A：使用 wrangler 执行 SQL 文件**

```bash
# 导入 30 题挑战题库 + 10 个成就
npx wrangler d1 execute focus-college-db --remote --file=scripts/seed-challenges.sql
```

**方式 B：通过 Cloudflare Dashboard**

1. 访问：Workers & Pages → D1 → focus-college-db
2. 点击 "Console" 标签
3. 打开 `scripts/seed-challenges.sql`
4. 复制全部 SQL 内容
5. 粘贴到 Console 并执行

**方式 C：分批导入（如果文件太大）**

```bash
# 拆分 SQL 文件
split -l 5 scripts/seed-challenges.sql seed-part-

# 逐个导入
for file in seed-part-*; do
  npx wrangler d1 execute focus-college-db --remote --file=$file
done
```

#### 3. 验证数据导入

```bash
# 检查题目数量
npx wrangler d1 execute focus-college-db --remote --command="SELECT COUNT(*) as count FROM challenges;"

# 应该返回：count: 30

# 检查成就数量
npx wrangler d1 execute focus-college-db --remote --command="SELECT COUNT(*) as count FROM challengeAchievements;"

# 应该返回：count: 10
```

---

## 🔍 部署后验证

### 1. 基础功能检查

访问生产环境 URL（例如：https://focus-college.pages.dev）

✅ **页面加载：**
- [ ] 首页正常显示
- [ ] 样式加载正确
- [ ] 无 JavaScript 错误（打开浏览器控制台检查）

✅ **用户认证：**
- [ ] 登录页面可访问
- [ ] 注册功能正常
- [ ] 登录后跳转正确

✅ **挑战系统：**
- [ ] 访问 `/challenge` 页面
- [ ] 题目正常加载
- [ ] 可以选择选项并提交答案
- [ ] 显示正确答案和解释
- [ ] 积分计算正确

✅ **成就系统：**
- [ ] 访问 `/achievements` 页面
- [ ] 成就卡片正常显示
- [ ] 稀有度颜色正确
- [ ] 进度条显示正确
- [ ] 分类筛选功能正常

✅ **API 功能：**
- [ ] 打开浏览器开发者工具 → Network
- [ ] 测试各个功能
- [ ] 确认 API 请求返回 200 状态码
- [ ] 检查响应数据格式正确

### 2. 性能检查

```bash
# 使用 Lighthouse 测试
# Chrome DevTools → Lighthouse → Generate report

期望分数：
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80
```

### 3. 数据库检查

```bash
# 检查表是否存在
npx wrangler d1 execute focus-college-db --remote --command="
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
"

# 应该包含：
# - challenges
# - userChallenges
# - dailyChallenges
# - userPoints
# - challengeAchievements
# - userChallengeAchievements
```

---

## 🔄 持续部署（推荐工作流）

配置完 GitHub 集成后，使用以下工作流：

```bash
# 1. 在 genspark_ai_developer 分支开发
git checkout genspark_ai_developer
# ... 进行开发 ...

# 2. 提交代码
git add .
git commit -m "feat: 新功能描述"

# 3. 推送到 GitHub
git push origin genspark_ai_developer

# 4. 创建 Pull Request
gh pr create --title "feat: 新功能" --body "功能描述"

# 5. 审查后合并到 main
gh pr merge --squash --delete-branch

# 6. Cloudflare 自动检测到 main 分支更新并部署
# 无需手动操作！2-3分钟后自动完成部署
```

---

## 🌐 自定义域名配置

部署成功后，可以配置自定义域名：

### 步骤：

1. **在 Cloudflare Dashboard**
   - Pages → focus-college → Custom domains
   - 点击 "Set up a custom domain"

2. **添加域名**
   - 输入您的域名（例如：app.yourcompany.com）
   - 点击 "Continue"

3. **配置 DNS**
   - 如果域名在 Cloudflare：自动配置 CNAME
   - 如果域名在其他服务商：
     ```
     类型: CNAME
     名称: app (或 @)
     值: focus-college.pages.dev
     ```

4. **等待 DNS 生效**
   - 通常 5-30 分钟
   - SSL 证书自动配置

---

## 📊 监控和日志

### 查看部署日志

**方式 A：Cloudflare Dashboard**
1. Pages → focus-college → Deployments
2. 点击具体的部署
3. 查看 Build log 和 Functions log

**方式 B：命令行**
```bash
# 查看最近部署
npx wrangler pages deployment list --project-name=focus-college

# 查看部署详情
npx wrangler pages deployment tail --project-name=focus-college
```

### 实时监控

```bash
# 实时查看函数日志
npx wrangler tail --name focus-college
```

### 访问统计

在 Cloudflare Dashboard → Analytics 中查看：
- 访问量
- 请求数
- 响应时间
- 错误率

---

## ⚠️ 故障排除

### 问题 1：构建失败

**错误信息：** Build command failed

**解决方案：**
```bash
# 检查 package.json 中的 build 脚本
# 应该是：npm run build

# 本地测试构建
npm run build

# 检查 Node.js 版本
# Cloudflare 使用 Node 20，确保兼容
```

### 问题 2：部署后页面空白

**可能原因：**
- 构建输出目录配置错误
- 环境变量缺失
- 路由配置问题

**解决方案：**
1. 检查 `wrangler.toml` 中的 `pages_build_output_dir = "dist/public"`
2. 确认所有必需的环境变量已配置
3. 检查浏览器控制台的错误信息
4. 确认 `_headers` 和 `_redirects` 文件正确

### 问题 3：API 请求失败

**错误：** 500 Internal Server Error 或 Database connection failed

**解决方案：**
```bash
# 1. 检查 D1 数据库绑定
npx wrangler pages project list

# 2. 确认迁移已应用
npx wrangler d1 migrations list focus-college-db --remote

# 3. 检查环境变量
# Dashboard → Settings → Environment variables

# 4. 查看函数日志
npx wrangler tail
```

### 问题 4：题库数据未加载

**症状：** 挑战页面显示"无可用题目"

**解决方案：**
```bash
# 重新导入题库数据
npx wrangler d1 execute focus-college-db --remote --file=scripts/seed-challenges.sql

# 验证导入
npx wrangler d1 execute focus-college-db --remote --command="SELECT * FROM challenges LIMIT 5;"
```

---

## 🔐 安全检查清单

部署到生产环境前，确保：

- [ ] `JWT_SECRET` 已更改为强密码（不是 development 值）
- [ ] 所有敏感信息都在环境变量中（不在代码里）
- [ ] CORS 配置正确（仅允许可信域名）
- [ ] SQL 注入防护（使用参数化查询）
- [ ] XSS 防护（输入验证和输出转义）
- [ ] HTTPS 强制启用
- [ ] 敏感 API 端点有认证保护

---

## 📈 性能优化建议

- [x] 使用 Vite 生产构建（已配置）
- [x] 代码分割和懒加载（已实现）
- [x] 图片压缩和优化
- [x] CDN 加速（Cloudflare 自带）
- [ ] 启用 HTTP/3
- [ ] 配置缓存策略（在 `_headers` 中）

---

## 📞 需要帮助？

### 资源链接：

- 📖 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 📖 [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- 🔧 [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- 💬 [项目 Issues](https://github.com/callaaron/focus.college/issues)

### 常见命令速查：

```bash
# 查看 Cloudflare 登录状态
npx wrangler whoami

# 列出所有 Pages 项目
npx wrangler pages project list

# 查看 D1 数据库
npx wrangler d1 list

# 查看部署列表
npx wrangler pages deployment list --project-name=focus-college

# 回滚到上一个部署
npx wrangler pages deployment rollback --project-name=focus-college
```

---

## 🎉 部署完成后

恭喜！您的挑战系统已成功部署到生产环境！

**接下来可以做的：**

1. ✅ 分享应用 URL 给团队成员
2. ✅ 设置监控和告警
3. ✅ 配置自定义域名
4. ✅ 收集用户反馈
5. ✅ 迭代新功能

**生产环境 URL：**
- 默认：https://focus-college.pages.dev
- 自定义域名（如已配置）

---

**祝部署顺利！🚀**
