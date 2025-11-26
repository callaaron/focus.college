# 🚀 Cloudflare 部署设置指南

您已经创建了 Cloudflare API Token：`44qO9IkckyRdDp84BPO1yunBfU5Oej-khJ2aLj4`

---

## 📋 部署方式对比

### ⭐ 推荐方式：GitHub 自动部署（无需 API Token）

**优势：**
- ✅ 完全图形界面操作，最简单
- ✅ 不需要使用 API Token
- ✅ 每次推送 main 自动部署
- ✅ 5分钟配置完成

**劣势：**
- ❌ 需要在 Cloudflare Dashboard 手动配置

---

### 🔧 备选方式：命令行部署（需要 API Token）

**优势：**
- ✅ 全命令行操作
- ✅ 可以在 CI/CD 中使用

**劣势：**
- ❌ 需要配置 API Token
- ❌ 每次都需要手动运行命令

---

## 🎯 方式一：GitHub 自动部署（推荐）

这是最简单的方式，不需要使用 API Token，全程图形界面操作。

### 步骤：

#### 1. 访问 Cloudflare Dashboard
```
https://dash.cloudflare.com/
```

登录您的 Cloudflare 账号（就是您刚才创建 API Token 的账号）

#### 2. 进入 Pages 项目

**选项 A：如果项目 focus-college 已存在**
```
导航：Workers & Pages → focus-college
点击：Settings 标签
选择：Builds & deployments
点击：Configure Production deployments 或 Connect to Git
```

**选项 B：如果项目不存在，创建新项目**
```
导航：Workers & Pages
点击：Create application
选择：Pages
点击：Connect to Git
```

#### 3. 授权并选择 GitHub 仓库

1. 点击 "Connect GitHub account" 或 "Select GitHub account"
2. 授权 Cloudflare 访问您的 GitHub
3. 在仓库列表中找到并选择：`callaaron/focus.college`
4. 点击 "Begin setup"

#### 4. 配置构建设置

```yaml
项目名称: focus-college
生产分支: main
框架预设: None (或选择 Vite)
构建命令: npm run build
构建输出目录: dist/public
根目录: / (保持默认)
Node.js 版本: 20
```

#### 5. 配置环境变量

点击 "Environment variables (advanced)"，添加以下变量（针对 **Production** 环境）：

**必需变量：**
```bash
# 名称：JWT_SECRET
# 值：your-super-strong-secret-key-at-least-32-characters-long-production
# 环境：Production

# 名称：NODE_ENV
# 值：production
# 环境：Production

# 名称：VITE_APP_TITLE
# 值：创业进化系统
# 环境：Production
```

⚠️ **重要**：
- `JWT_SECRET` 必须是强密码（至少32个字符）
- 不要使用开发环境的密钥（development-secret-key...）
- 建议使用密码生成器生成

**密码生成建议：**
- 在线生成器：https://passwordsgenerator.net/
- 长度：至少 32 个字符
- 包含：大小写字母、数字、特殊字符

**可选变量（如果您的项目需要）：**
```bash
# 如果使用外部 MySQL 数据库
DATABASE_URL=mysql://user:password@host:port/database

# OAuth 配置
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.com

# OpenAI API
OPENAI_API_KEY=sk-your-api-key
```

#### 6. 保存并部署

1. 点击 "Save and Deploy" 按钮
2. Cloudflare 会自动：
   - 克隆您的 GitHub 仓库
   - 安装依赖 (npm install)
   - 运行构建 (npm run build)
   - 部署到全球 CDN

⏱️ **预计时间：3-5 分钟**

#### 7. 监控部署进度

在 Cloudflare Dashboard 中：
```
Pages → focus-college → Deployments
```

您会看到部署状态：
- 🟡 **Building...** - 正在构建
- 🟡 **Deploying...** - 正在部署
- 🟢 **Success** - 部署成功
- 🔴 **Failed** - 部署失败（点击查看日志）

#### 8. 获取访问 URL

部署成功后，您会看到：
```
✅ Deployment successful
🌐 https://focus-college.pages.dev
```

点击 URL 或复制访问您的生产环境应用！

---

## 💾 部署数据库（部署成功后必做）

应用部署成功后，需要初始化数据库并导入题库数据。

### 在您的本地开发机器上运行：

#### 步骤 1：登录 Cloudflare（仅需一次）

```bash
npx wrangler login
```

这会打开浏览器，完成授权即可。

或者设置环境变量（使用您的 API Token）：
```bash
export CLOUDFLARE_API_TOKEN="44qO9IkckyRdDp84BPO1yunBfU5Oej-khJ2aLj4"
```

#### 步骤 2：应用数据库迁移

```bash
# 确保在项目目录
cd /home/user/webapp

# 应用迁移到远程 D1 数据库
npx wrangler d1 migrations apply focus-college-db --remote
```

预期输出：
```
✅ Applying migration 0001_xxx.sql
✅ Migration successful
```

#### 步骤 3：导入挑战题库数据

```bash
# 导入 30 道题目 + 10 个成就
npx wrangler d1 execute focus-college-db --remote --file=scripts/seed-challenges.sql
```

预期输出：
```
✅ Executed scripts/seed-challenges.sql
```

#### 步骤 4：验证数据导入

```bash
# 检查题目数量
npx wrangler d1 execute focus-college-db --remote --command="SELECT COUNT(*) as count FROM challenges;"

# 应该显示：count: 30

# 检查成就数量
npx wrangler d1 execute focus-college-db --remote --command="SELECT COUNT(*) as count FROM challengeAchievements;"

# 应该显示：count: 10
```

---

## 🔍 部署后验证

### 访问生产环境

打开浏览器，访问：`https://focus-college.pages.dev`

### 检查清单：

#### 基础功能
- [ ] 首页正常加载
- [ ] 样式显示正确
- [ ] 无 JavaScript 错误（打开浏览器控制台检查：F12）

#### 挑战系统
- [ ] 访问 `/challenge` 页面成功
- [ ] 题目正常显示（应该能看到30道题中的随机题目）
- [ ] 可以选择选项
- [ ] 可以提交答案
- [ ] 显示正确答案和详细解释
- [ ] 积分计算正确

#### 成就系统
- [ ] 访问 `/achievements` 页面成功
- [ ] 成就卡片正常显示（10个成就）
- [ ] 稀有度颜色正确：
  - 灰色 = 普通 (common)
  - 蓝色 = 稀有 (rare)
  - 紫色 = 史诗 (epic)
  - 金色 = 传说 (legendary)
- [ ] 进度条显示正确
- [ ] 分类筛选功能正常（全部/数量/连续/准确率/特殊）

#### 用户功能
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 登录后跳转正确

#### API 功能
- [ ] 打开浏览器开发者工具（F12）→ Network 标签
- [ ] 测试各个功能
- [ ] 确认所有 API 请求返回 200 状态码
- [ ] 检查响应数据格式正确

---

## 🎊 完成！持续部署已启用

### 以后的工作流：

```bash
# 1. 在开发分支工作
git checkout genspark_ai_developer
# ... 开发新功能 ...

# 2. 提交并推送
git add .
git commit -m "feat: 新功能描述"
git push origin genspark_ai_developer

# 3. 创建并合并 PR
gh pr create --title "feat: 新功能" --body "功能描述"
gh pr merge --squash --delete-branch

# 4. 🎉 Cloudflare 自动检测 main 分支更新并部署！
# 无需任何手动操作，2-3分钟后自动完成部署
```

---

## 🌐 配置自定义域名（可选）

如果您有自己的域名，可以配置：

### 步骤：

1. **在 Cloudflare Dashboard**
   ```
   Pages → focus-college → Custom domains
   点击：Set up a custom domain
   ```

2. **添加域名**
   ```
   输入：app.yourcompany.com (或您的域名)
   点击：Continue
   ```

3. **配置 DNS**
   
   如果域名已在 Cloudflare：
   - Cloudflare 会自动配置 CNAME 记录
   
   如果域名在其他服务商：
   ```
   类型：CNAME
   名称：app (或 @)
   值：focus-college.pages.dev
   TTL：自动
   ```

4. **等待 DNS 生效**
   - 通常 5-30 分钟
   - SSL 证书自动配置

---

## 📊 监控和分析

### 查看访问统计

```
Cloudflare Dashboard → Analytics
```

可以看到：
- 📈 访问量
- 🌍 访问地域分布
- ⚡ 请求数量
- ⏱️ 响应时间
- ❌ 错误率

### 查看部署历史

```
Pages → focus-college → Deployments
```

可以：
- 查看所有历史部署
- 回滚到之前的版本
- 查看每次部署的构建日志

### 实时日志

```bash
# 查看实时函数日志
npx wrangler pages deployment tail --project-name=focus-college
```

---

## ⚠️ 故障排除

### 问题 1：构建失败 (Build Failed)

**症状：** Deployment 页面显示 "Build failed"

**解决方案：**
1. 点击失败的部署 → View build log
2. 查看错误信息
3. 常见原因：
   - Node.js 版本不兼容（确保设置为 20）
   - 构建命令错误（应该是 `npm run build`）
   - 依赖安装失败（检查 package.json）

本地测试构建：
```bash
npm run build
```

### 问题 2：页面空白或 404

**症状：** 访问 URL 显示空白页或 404 错误

**解决方案：**
1. 检查浏览器控制台（F12）的错误信息
2. 确认环境变量已正确设置（尤其是 JWT_SECRET）
3. 检查构建输出目录配置：应该是 `dist/public`
4. 确认 `wrangler.toml` 中的 `pages_build_output_dir = "dist/public"`

### 问题 3：API 请求失败

**症状：** 页面显示但功能不工作，API 返回 500 错误

**解决方案：**
1. 检查 D1 数据库是否正确绑定
   ```bash
   npx wrangler pages project list
   ```

2. 确认数据库迁移已应用
   ```bash
   npx wrangler d1 migrations list focus-college-db --remote
   ```

3. 查看函数日志
   ```bash
   npx wrangler pages deployment tail --project-name=focus-college
   ```

4. 确认环境变量完整

### 问题 4：题目不显示

**症状：** 挑战页面显示 "无可用题目" 或题目列表为空

**解决方案：**
```bash
# 重新导入题库数据
npx wrangler d1 execute focus-college-db --remote --file=scripts/seed-challenges.sql

# 验证导入
npx wrangler d1 execute focus-college-db --remote --command="SELECT * FROM challenges LIMIT 5;"
```

### 问题 5：环境变量不生效

**症状：** 应用行为像开发环境（比如使用了开发环境的 JWT_SECRET）

**解决方案：**
1. 确认在 Cloudflare Dashboard 中设置了环境变量
2. 确认环境变量设置在 **Production** 环境（不是 Preview）
3. 重新部署：
   ```
   Pages → focus-college → Deployments → Retry deployment
   ```

---

## 🔐 安全检查清单

部署到生产环境前，确保：

- [ ] `JWT_SECRET` 已更改为强密码（不是 development 值）
- [ ] 所有敏感信息都在环境变量中（不在代码里）
- [ ] API Token 已安全保存（不要泄露）
- [ ] 数据库只能通过 Cloudflare Functions 访问
- [ ] HTTPS 已启用（Cloudflare 自动配置）

---

## 📞 需要帮助？

- 📖 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 📖 [Cloudflare D1 数据库文档](https://developers.cloudflare.com/d1/)
- 💬 [Cloudflare 社区论坛](https://community.cloudflare.com/)
- 🐛 [项目 GitHub Issues](https://github.com/callaaron/focus.college/issues)

---

## 🎯 总结

**您现在需要做的：**

1. ⏰ **5分钟**：在 Cloudflare Dashboard 配置 GitHub 集成（按照本文档步骤操作）
2. ⏰ **3分钟**：等待首次自动构建和部署
3. ⏰ **2分钟**：运行数据库迁移命令（在本地终端）

**总计：10分钟即可完成生产环境部署！**

---

**准备好了吗？现在就开始吧！🚀**

访问：https://dash.cloudflare.com/
