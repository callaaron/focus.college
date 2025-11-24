# 快速域名绑定指南 🚀

> 最简单、最快的方式绑定您的域名到创业进化系统

---

## 🎯 我该选择哪种方式？

### 方案对比

| 方案 | 成本 | 难度 | 时间 | 推荐度 |
|------|------|------|------|--------|
| **Cloudflare Pages** | 免费 | ⭐ 简单 | 30分钟 | ⭐⭐⭐⭐⭐ |
| Vercel | 免费/付费 | ⭐⭐ 中等 | 20分钟 | ⭐⭐⭐⭐ |
| 自有服务器 | $50+/月 | ⭐⭐⭐⭐⭐ 复杂 | 2-4小时 | ⭐⭐⭐ |

**推荐**: Cloudflare Pages（免费、简单、可靠）

---

## ⚡ 方案一：Cloudflare Pages（推荐）

### 适合人群
- 🆓 预算有限
- ⚡ 想要快速部署
- 🌍 需要全球访问加速
- 🔰 技术经验较少

### 步骤（仅需 5 步）

#### 1️⃣ 注册 Cloudflare（5 分钟）

访问：https://dash.cloudflare.com/sign-up

填写信息：
- 邮箱
- 密码
- 验证邮箱

✅ 完成注册

---

#### 2️⃣ 连接 GitHub 仓库（5 分钟）

1. 登录 Cloudflare Dashboard
2. 点击左侧 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**
6. 选择 **GitHub**
7. 授权 Cloudflare 访问您的 GitHub
8. 选择仓库：`callaaron/focus.college`
9. 点击 **Begin setup**

---

#### 3️⃣ 配置构建（3 分钟）

在配置页面填写：

**Project name**: `focus-college`（或您喜欢的名字）

**Production branch**: `main`

**Framework preset**: 选择 `None`

**Build command**: 
```
npm run build
```

**Build output directory**:
```
dist/public
```

**Environment variables** - 点击 "Add variable"，添加以下变量：

| Variable name | Value | 说明 |
|--------------|-------|------|
| `NODE_VERSION` | `22` | Node.js 版本 |
| `DATABASE_URL` | `mysql://...` | 数据库连接字符串 |
| `JWT_SECRET` | 生成随机字符串 | JWT 密钥 |
| `VITE_APP_TITLE` | `创业进化系统` | 应用标题 |

**如何生成 JWT_SECRET**:
```bash
# 在本地终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**数据库选项**:
- 使用 [PlanetScale](https://planetscale.com/)（免费 5GB）
- 使用 [Railway](https://railway.app/)（$5/月起）
- 使用您现有的云数据库

点击 **Save and Deploy**

---

#### 4️⃣ 等待部署完成（3-5 分钟）

Cloudflare 会自动：
- 安装依赖
- 构建项目
- 部署到全球 CDN

您会看到：
```
✅ Build successful
🌐 https://focus-college-xxx.pages.dev
```

点击链接测试您的网站！

---

#### 5️⃣ 绑定自定义域名（10 分钟）

##### 5.1 在 Cloudflare Pages 中添加域名

1. 在项目页面，点击 **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入您的域名，例如：
   - `www.focuscollege.com`（推荐）
   - 或 `focuscollege.com`

##### 5.2 配置 DNS

**情况 A：域名已在 Cloudflare**
- ✅ DNS 自动配置
- ⏰ 等待 5-10 分钟生效

**情况 B：域名在其他注册商（阿里云/腾讯云等）**

有两种方式：

**方式 1：迁移 DNS 到 Cloudflare（推荐）**
1. 在 Cloudflare 添加您的域名
2. 获得 Cloudflare Nameservers（类似）:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
3. 去域名注册商（阿里云/腾讯云等）
4. 修改 DNS 服务器为 Cloudflare 的
5. 等待 24-48 小时生效

**方式 2：仅添加 CNAME 记录**
1. 登录域名注册商（阿里云/腾讯云等）
2. 进入 DNS 管理
3. 添加 CNAME 记录：
   ```
   记录类型: CNAME
   主机记录: www
   记录值: focus-college-xxx.pages.dev
   TTL: 10分钟
   ```
4. 保存，等待 5-30 分钟生效

##### 5.3 验证域名

```bash
# 在终端运行检查 DNS
nslookup www.yourdomain.com

# 检查网站访问
curl -I https://www.yourdomain.com
```

应该看到：
```
HTTP/2 200 
```

🎉 **完成！** 您的网站现在可以通过自定义域名访问了！

---

## 🔧 后续配置（可选）

### A. 配置根域名重定向

如果您想 `yourdomain.com` 自动跳转到 `www.yourdomain.com`：

1. 在 Cloudflare Pages 项目中
2. Custom domains → Add custom domain
3. 添加 `yourdomain.com`（不带 www）
4. Cloudflare 会自动设置重定向

### B. 运行数据库迁移

如果使用新数据库，需要初始化数据：

```bash
# 在本地运行
cd /home/user/webapp

# 设置数据库连接
export DATABASE_URL="mysql://..."

# 运行迁移
npm run db:push

# 插入初始数据
npx tsx scripts/seed-competency-data.ts
npx tsx scripts/seed-industry-competencies.ts
npx tsx scripts/seed-position-competencies.ts
npx tsx scripts/fix-industries-encoding.ts
npx tsx scripts/fix-question-encoding.ts
```

### C. 配置邮件通知

在 Cloudflare Pages 项目中：
1. Settings → Notifications
2. 启用 "Deploy success" 和 "Deploy failed"
3. 输入邮箱地址

---

## 📊 验证部署成功

访问您的域名并检查：

- [ ] ✅ 网站可以打开
- [ ] ✅ HTTPS 绿色锁显示（SSL 证书有效）
- [ ] ✅ 首页内容正确显示
- [ ] ✅ 样式和图片正常加载
- [ ] ✅ 可以注册和登录
- [ ] ✅ API 请求正常（打开浏览器控制台检查）

---

## 🆘 常见问题

### Q1: 显示 "Deployment in progress"
**A**: 首次部署需要 3-5 分钟，请耐心等待

### Q2: 域名无法访问
**A**: 
- 检查 DNS 是否已生效（使用 `nslookup`）
- 等待时间可能需要 30 分钟到 24 小时
- 清除浏览器缓存后重试

### Q3: 显示 "Error: Database connection failed"
**A**: 
- 检查 `DATABASE_URL` 环境变量是否正确
- 确保数据库可以从外部访问
- 检查数据库服务是否运行中

### Q4: API 请求失败（404）
**A**: 
- Cloudflare Pages 目前不完全支持后端 API
- 建议将后端部署到 Railway/Render 等平台
- 或使用 Cloudflare Workers 重写 API

### Q5: 如何更新网站？
**A**: 
```bash
# 提交代码到 GitHub
git add .
git commit -m "更新内容"
git push origin main

# Cloudflare Pages 会自动重新部署（约 3-5 分钟）
```

---

## 🎯 快速命令参考

```bash
# 本地开发
npm run dev

# 构建项目
npm run build

# 部署到 Cloudflare（需要先安装 wrangler）
npm install -g wrangler
wrangler login
wrangler pages deploy dist/public --project-name=focus-college

# 检查 DNS
nslookup yourdomain.com
dig yourdomain.com

# 测试 HTTPS
curl -I https://yourdomain.com
```

---

## 📞 需要帮助？

如果遇到问题，请提供：

1. **域名**: _________________
2. **错误信息**: _________________
3. **浏览器控制台错误**: _________________
4. **已完成的步骤**: _________________

我会帮您诊断并解决问题！

---

## 🎉 完成检查

- [ ] 网站可以通过域名访问
- [ ] HTTPS 正常（绿色锁）
- [ ] 所有功能正常运行
- [ ] 数据库连接正常
- [ ] 部署通知已配置

**恭喜！您的网站已成功上线！** 🚀

---

**创建时间**: 2025-11-24  
**预计完成时间**: 30-60 分钟  
**难度**: ⭐ 简单
