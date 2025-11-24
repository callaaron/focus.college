# focus.college 域名部署指南

> 专为 focus.college 域名从阿里云迁移到 Cloudflare Pages 的完整操作指南

---

## 📋 部署概览

- **域名**: focus.college
- **当前注册商**: 阿里云
- **部署平台**: Cloudflare Pages
- **GitHub 仓库**: callaaron/focus.college
- **预计时间**: 60-90 分钟
- **成本**: 免费

---

## 🎯 部署流程

### 阶段一：Cloudflare 准备（30 分钟）
### 阶段二：阿里云 DNS 配置（20 分钟）
### 阶段三：应用部署（20 分钟）
### 阶段四：验证测试（10 分钟）

---

## 📝 阶段一：Cloudflare 准备

### 步骤 1.1：注册/登录 Cloudflare

1. 访问 Cloudflare：https://dash.cloudflare.com/
2. 如果已有账号，直接登录
3. 如果没有账号：
   - 点击 **Sign Up**
   - 输入邮箱和密码
   - 验证邮箱

✅ **完成标志**：成功登录到 Cloudflare Dashboard

---

### 步骤 1.2：添加域名到 Cloudflare

1. 在 Cloudflare Dashboard，点击 **Add a Site**
2. 输入域名：`focus.college`
3. 点击 **Add site**
4. 选择免费计划（**Free $0/month**）
5. 点击 **Continue**

Cloudflare 会扫描您的现有 DNS 记录（从阿里云）

6. 等待扫描完成（约 1 分钟）
7. 检查导入的 DNS 记录是否正确
8. 点击 **Continue**

✅ **完成标志**：看到 Cloudflare 的 Nameserver 信息

---

### 步骤 1.3：记录 Cloudflare Nameservers

Cloudflare 会显示两个 Nameserver（类似）：

```
nameserver 1: chad.ns.cloudflare.com
nameserver 2: lola.ns.cloudflare.com
```

**重要：请记录这两个 Nameserver，稍后在阿里云配置！**

您的 Nameservers（请填写）：
```
Nameserver 1: _____________________________
Nameserver 2: _____________________________
```

⚠️ **暂时不要关闭这个页面**，继续下一步

---

### 步骤 1.4：创建 Cloudflare Pages 项目

**在新标签页中操作**（保持 Nameserver 页面打开）

1. 在 Cloudflare Dashboard 左侧菜单，点击 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**
5. 选择 **GitHub**
6. 如果第一次使用，会要求授权：
   - 点击 **Authorize Cloudflare**
   - 选择授权的仓库范围（建议选择 Only select repositories）
   - 选中 `callaaron/focus.college`
   - 点击 **Install & Authorize**

7. 回到 Cloudflare，选择仓库：`callaaron/focus.college`
8. 点击 **Begin setup**

✅ **完成标志**：进入项目配置页面

---

### 步骤 1.5：配置 Pages 构建设置

在配置页面填写以下信息：

**Project name**: `focus-college`

**Production branch**: `main`

**Framework preset**: 选择 `None`（在下拉菜单最底部）

**Build command**:
```bash
npm run build
```

**Build output directory**:
```
dist/public
```

**Root directory (Advanced)**: 留空

点击展开 **Environment variables**

添加以下环境变量（点击 **Add variable** 逐个添加）：

| Variable name | Value |
|--------------|-------|
| `NODE_VERSION` | `22` |
| `VITE_APP_TITLE` | `创业进化系统` |
| `NODE_ENV` | `production` |

**暂时不添加 DATABASE_URL 和 JWT_SECRET**（等数据库准备好后再添加）

点击 **Save and Deploy**

✅ **完成标志**：开始构建，显示构建日志

---

### 步骤 1.6：等待首次部署

构建过程大约需要 3-5 分钟，您会看到：

```
Installing dependencies...
Building application...
Deploying to Cloudflare Pages...
✅ Success! Your site is live at:
https://focus-college-xxx.pages.dev
```

**记录临时域名**：
```
临时域名: _________________________________
```

**暂时不要测试**（因为缺少数据库连接，会报错）

✅ **完成标志**：构建成功，获得临时域名

---

## 📝 阶段二：阿里云 DNS 配置

### 步骤 2.1：登录阿里云

1. 访问阿里云：https://www.aliyun.com/
2. 点击右上角 **登录**
3. 输入账号密码登录
4. 进入 **控制台**

---

### 步骤 2.2：进入域名管理

1. 在控制台搜索框输入：**域名**
2. 点击 **域名** 进入域名控制台
3. 找到 `focus.college`
4. 点击 **管理** 或 **解析**

---

### 步骤 2.3：修改 DNS 服务器（方案 A - 推荐）

> 这是最简单的方式，Cloudflare 会自动管理所有 DNS 记录

1. 在域名管理页面，找到 **DNS 服务器** 或 **DNS 修改**
2. 点击 **修改 DNS 服务器**
3. 删除现有的阿里云 DNS 服务器
4. 添加 Cloudflare 的 Nameservers（步骤 1.3 记录的）：
   ```
   chad.ns.cloudflare.com
   lola.ns.cloudflare.com
   ```
5. 点击 **确定** 或 **保存**

⚠️ **重要提示**：
- DNS 服务器修改需要 24-48 小时全球生效
- 但通常 30 分钟到 2 小时就能看到效果
- 在生效期间，域名可能暂时无法访问

✅ **完成标志**：阿里云显示"DNS 服务器修改成功"

---

### 【备选】步骤 2.3-B：添加 CNAME 记录（方案 B）

> 如果您不想修改 DNS 服务器，可以使用这个方式（但功能会受限）

1. 在阿里云域名解析页面
2. 点击 **添加记录**
3. 添加以下记录：

**记录 1 - www 子域名**:
```
记录类型: CNAME
主机记录: www
记录值: focus-college-xxx.pages.dev（您的临时域名）
解析线路: 默认
TTL: 10 分钟
```

**记录 2 - 根域名**:
```
记录类型: CNAME
主机记录: @
记录值: focus-college-xxx.pages.dev
解析线路: 默认
TTL: 10 分钟
```

4. 点击 **确认**

⚠️ **注意**：使用此方式，部分 Cloudflare 功能可能无法使用

✅ **完成标志**：两条记录添加成功

---

### 步骤 2.4：验证 DNS 修改

**立即验证**（可能还未生效，这是正常的）：

```bash
# 在本地终端运行
nslookup focus.college

# 如果看到 Cloudflare 的 IP（类似 104.21.x.x），说明已生效
# 如果看到阿里云的 IP，说明还在传播中
```

**也可以使用在线工具**：
- https://www.whatsmydns.net/
- 输入 `focus.college`
- 查看全球 DNS 传播状态

✅ **完成标志**：DNS 开始传播（即使未完全生效也可以继续）

---

### 步骤 2.5：回到 Cloudflare 完成域名验证

1. 回到 Cloudflare 的 Nameserver 设置页面（步骤 1.3）
2. 点击 **Done, check nameservers**
3. Cloudflare 会检查 DNS 是否已修改

如果显示：
- ✅ **Active**: DNS 已生效，太好了！
- ⏳ **Pending**: 还在等待，这是正常的

即使显示 Pending，也可以继续下一步

---

## 📝 阶段三：应用部署

### 步骤 3.1：准备数据库

您需要一个可以从互联网访问的 MySQL 数据库。

**推荐方案：PlanetScale（免费 5GB）**

1. 访问 PlanetScale：https://planetscale.com/
2. 点击 **Sign up**
3. 使用 GitHub 账号登录（快速）
4. 创建新数据库：
   - Database name: `focus-college`
   - Region: 选择 **AWS ap-northeast-1 (Tokyo)**（东京，速度最快）
   - Plan: **Hobby (Free)**
5. 点击 **Create database**
6. 等待数据库创建（约 1 分钟）
7. 点击 **Connect**
8. 选择 **Connect with: Node.js**
9. 复制连接字符串（类似）：
   ```
   mysql://xxxxxxxxxx:************@aws.connect.psdb.cloud/focus-college?ssl={"rejectUnauthorized":true}
   ```

**记录数据库连接字符串**：
```
DATABASE_URL: _________________________________
```

**备选方案：Railway**
- 访问：https://railway.app/
- $5/月起，更简单但需付费

✅ **完成标志**：获得 DATABASE_URL

---

### 步骤 3.2：生成 JWT Secret

在本地终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

会输出一个 64 位的随机字符串，例如：
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**记录 JWT Secret**：
```
JWT_SECRET: _________________________________
```

✅ **完成标志**：获得 JWT_SECRET

---

### 步骤 3.3：添加环境变量到 Cloudflare Pages

1. 回到 Cloudflare Pages 项目页面
2. 点击 **Settings** 标签
3. 在左侧菜单点击 **Environment variables**
4. 点击 **Add variable**（Production）

添加以下变量：

**Variable 1**:
```
Variable name: DATABASE_URL
Value: [步骤 3.1 记录的数据库连接字符串]
```

**Variable 2**:
```
Variable name: JWT_SECRET
Value: [步骤 3.2 生成的 JWT Secret]
```

5. 点击 **Save**

✅ **完成标志**：环境变量已保存

---

### 步骤 3.4：初始化数据库

**在本地终端操作**：

```bash
cd /home/user/webapp

# 1. 设置数据库连接（使用您的 DATABASE_URL）
export DATABASE_URL="mysql://your-connection-string"

# 2. 运行数据库迁移
npm run db:push

# 3. 插入基础数据
echo "插入能力体系数据..."
npx tsx scripts/seed-competency-data.ts

echo "插入行业-能力关联..."
npx tsx scripts/seed-industry-competencies.ts

echo "插入职位-能力关联..."
npx tsx scripts/seed-position-competencies.ts

echo "修复行业编码..."
npx tsx scripts/fix-industries-encoding.ts

echo "插入题库数据..."
npx tsx scripts/fix-question-encoding.ts

echo "✅ 数据库初始化完成！"
```

**预计时间**：2-3 分钟

✅ **完成标志**：所有脚本执行成功，无错误

---

### 步骤 3.5：触发重新部署

添加环境变量后需要重新部署：

1. 在 Cloudflare Pages 项目页面
2. 点击 **Deployments** 标签
3. 找到最新的部署
4. 点击右侧的 **...** （三个点）
5. 选择 **Retry deployment**

或者更简单的方式：

```bash
# 在本地推送一个空提交触发部署
cd /home/user/webapp
git commit --allow-empty -m "trigger redeploy with env vars"
git push origin main
```

等待 3-5 分钟重新部署完成

✅ **完成标志**：新部署成功，状态显示 "Success"

---

### 步骤 3.6：绑定自定义域名

1. 在 Cloudflare Pages 项目页面
2. 点击 **Custom domains** 标签
3. 点击 **Set up a custom domain**
4. 输入：`focus.college`
5. 点击 **Continue**
6. Cloudflare 会检查 DNS 配置

**如果使用方案 A（修改 Nameservers）**：
- Cloudflare 会自动添加 DNS 记录
- 显示 ✅ "DNS record added"

**如果使用方案 B（CNAME）**：
- 可能需要手动确认 DNS 记录

7. 重复步骤 3-6，添加 `www.focus.college`

✅ **完成标志**：两个域名都显示"已激活"或"待验证"

---

## 📝 阶段四：验证测试

### 步骤 4.1：等待 DNS 生效

DNS 传播时间：
- **最快**: 5-10 分钟
- **通常**: 30 分钟 - 2 小时
- **最长**: 24-48 小时

**检查 DNS 状态**：

```bash
# 检查根域名
nslookup focus.college

# 检查 www
nslookup www.focus.college

# 或使用在线工具
# https://www.whatsmydns.net/
```

期望看到：
```
Name: focus.college
Address: 104.21.x.x (Cloudflare IP)
```

---

### 步骤 4.2：测试网站访问

**测试 1：访问临时域名**
```
https://focus-college-xxx.pages.dev
```
应该看到：
- ✅ 网站正常加载
- ✅ 样式和图片显示正常
- ✅ 可以注册和登录

**测试 2：访问自定义域名（DNS 生效后）**
```
https://focus.college
https://www.focus.college
```
应该看到：
- ✅ 显示绿色锁（HTTPS 有效）
- ✅ 网站内容与临时域名一致
- ✅ 所有功能正常

---

### 步骤 4.3：功能测试清单

逐项测试以下功能：

- [ ] ✅ 首页加载正常
- [ ] ✅ 用户注册功能
- [ ] ✅ 用户登录功能
- [ ] ✅ 能力评估功能
- [ ] ✅ 能力分析功能
- [ ] ✅ 学习路径功能
- [ ] ✅ 题库管理（管理员）
- [ ] ✅ 图片和样式加载
- [ ] ✅ API 请求正常（F12 查看控制台）

**检查浏览器控制台**：
- 按 F12 打开开发者工具
- 切换到 Console 标签
- 应该没有红色错误信息

---

### 步骤 4.4：性能测试

**测试网站速度**：
1. 访问：https://www.webpagetest.org/
2. 输入：`https://focus.college`
3. 选择测试位置：**Beijing, China** 或 **Tokyo, Japan**
4. 点击 **Start Test**
5. 等待测试完成

期望指标：
- First Byte Time: < 500ms
- Start Render: < 2s
- Fully Loaded: < 5s

---

### 步骤 4.5：SSL 证书验证

```bash
# 检查 SSL 证书
curl -vI https://focus.college 2>&1 | grep "SSL"

# 或访问在线工具
# https://www.ssllabs.com/ssltest/
# 输入: focus.college
```

期望结果：
- SSL 证书由 Cloudflare 签发
- 有效期：约 3 个月（自动续期）
- 评级：A 或 A+

---

## ✅ 部署完成检查清单

确保以下所有项目都已完成：

### Cloudflare 配置
- [x] 域名已添加到 Cloudflare
- [x] Pages 项目已创建
- [x] GitHub 仓库已连接
- [x] 构建配置正确
- [x] 环境变量已设置
- [x] 自定义域名已绑定

### DNS 配置
- [x] 阿里云 DNS 已修改为 Cloudflare Nameservers
- [x] 或添加了 CNAME 记录
- [x] DNS 传播已完成
- [x] nslookup 返回 Cloudflare IP

### 应用部署
- [x] 数据库已创建并初始化
- [x] 环境变量已配置
- [x] 应用成功部署
- [x] 临时域名可访问
- [x] 自定义域名可访问

### SSL & 安全
- [x] HTTPS 正常工作
- [x] SSL 证书有效
- [x] HTTP 自动跳转 HTTPS
- [x] 安全头已配置

### 功能测试
- [x] 所有页面正常访问
- [x] 用户注册登录正常
- [x] API 接口正常
- [x] 数据库读写正常
- [x] 性能达到预期

---

## 🎉 恭喜！部署完成！

您的网站现在已经成功部署到 Cloudflare Pages 并绑定了自定义域名！

**访问地址**：
- 🌐 https://focus.college
- 🌐 https://www.focus.college

---

## 📊 后续优化建议

### 1. 配置缓存规则
在 Cloudflare → Caching → Configuration 中：
- 启用 Always Online™
- 设置 Browser Cache TTL: 4 hours

### 2. 启用速度优化
在 Cloudflare → Speed → Optimization 中：
- 启用 Auto Minify (HTML, CSS, JS)
- 启用 Brotli 压缩
- 启用 Rocket Loader™

### 3. 配置防火墙规则
在 Cloudflare → Security → WAF 中：
- 启用 Bot Fight Mode
- 添加中国大陆访问优化规则

### 4. 设置分析和监控
- 启用 Cloudflare Web Analytics
- 配置 Email Alerts
- 设置 Uptime Monitoring

### 5. 性能监控
推荐工具：
- Google Analytics
- Sentry（错误监控）
- Hotjar（用户行为）

---

## 🔄 持续部署

现在每次您推送代码到 GitHub main 分支：
1. Cloudflare Pages 自动检测到更新
2. 自动运行构建
3. 自动部署到生产环境
4. 整个过程约 3-5 分钟

**开发流程**：
```bash
# 1. 本地开发
npm run dev

# 2. 测试
npm run check

# 3. 提交代码
git add .
git commit -m "更新功能"
git push origin main

# 4. 自动部署（无需手动操作）
```

---

## 🆘 遇到问题？

### 问题 1：DNS 长时间未生效
**解决方法**：
- 清除浏览器缓存
- 使用无痕模式访问
- 尝试使用移动网络访问
- 等待最多 48 小时

### 问题 2：HTTPS 证书错误
**解决方法**：
- 检查域名是否正确绑定
- 等待 10-20 分钟让证书生效
- 清除浏览器 SSL 缓存

### 问题 3：API 请求失败
**解决方法**：
- 检查环境变量是否正确设置
- 确认数据库连接字符串正确
- 查看 Cloudflare Pages 部署日志

### 问题 4：页面显示 404
**解决方法**：
- 检查 Build output directory 是否为 `dist/public`
- 确认 _redirects 文件存在
- 重新部署

---

## 📞 技术支持

需要帮助？提供以下信息：

1. **问题描述**: _________________
2. **错误信息**: _________________
3. **浏览器控制台截图**: _________________
4. **已完成的步骤**: _________________

我会帮您诊断并解决问题！

---

## 📅 部署记录

**部署日期**: ___________
**部署人员**: ___________
**Cloudflare Project ID**: ___________
**临时域名**: ___________
**数据库提供商**: ___________

---

**文档版本**: 1.0  
**创建时间**: 2025-11-24  
**更新时间**: 2025-11-24  
**预计完成时间**: 60-90 分钟
