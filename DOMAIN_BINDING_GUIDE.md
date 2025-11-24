# 域名绑定指南

本指南将帮助您将自定义域名绑定到创业进化系统（Focus College）。

## 目录
- [部署选项](#部署选项)
- [Cloudflare Pages 部署（推荐）](#cloudflare-pages-部署推荐)
- [Vercel 部署](#vercel-部署)
- [自有服务器部署](#自有服务器部署)
- [DNS 配置](#dns-配置)
- [SSL 证书配置](#ssl-证书配置)

---

## 部署选项

### 1. Cloudflare Pages（推荐）✨
**优点**：
- ✅ 免费
- ✅ 自动 SSL 证书
- ✅ 全球 CDN 加速
- ✅ 自动部署（Git push 即部署）
- ✅ 域名管理简单
- ✅ 无限带宽

**适用场景**：前端应用 + API（需要 Workers）

### 2. Vercel
**优点**：
- ✅ 免费套餐（有限制）
- ✅ 自动 SSL 证书
- ✅ 全球 CDN
- ✅ 自动部署

**限制**：
- ⚠️ 免费套餐有流量限制
- ⚠️ Serverless 函数执行时间限制

### 3. 自有服务器
**优点**：
- ✅ 完全控制
- ✅ 无流量限制
- ✅ 可运行完整的 Node.js 应用

**缺点**：
- ❌ 需要自己配置 Nginx/Apache
- ❌ 需要手动配置 SSL
- ❌ 需要维护服务器

---

## Cloudflare Pages 部署（推荐）

### 步骤 1: 准备项目

1. **构建项目**
   ```bash
   cd /home/user/webapp
   npm run build
   ```

2. **确认构建产物**
   - 前端：`dist/public/` 目录
   - 后端：`dist/` 目录（包含 API）

### 步骤 2: Cloudflare Pages 设置

#### 2.1 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 GitHub/GitLab 仓库
6. 选择您的仓库：`callaaron/focus.college`

#### 2.2 配置构建设置

**Framework preset**: `None` (自定义)

**Build command**:
```bash
npm run build
```

**Build output directory**:
```
dist/public
```

**Root directory**: `/`

**Environment variables**:
```env
NODE_VERSION=22
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=your-jwt-secret-key-here
VITE_APP_TITLE=创业进化系统
```

> ⚠️ **注意**: DATABASE_URL 需要使用可以从外部访问的数据库（如 PlanetScale、Railway、或您的云服务器数据库）

#### 2.3 创建 Functions（API 路由）

Cloudflare Pages Functions 可以处理后端 API 请求。

创建 `functions/api/[[path]].ts`：
```typescript
// 这个文件将处理所有 /api/* 请求
export async function onRequest(context) {
  const { request, env } = context;
  
  // 转发到您的后端 API
  // 或者在这里实现简化的 API 逻辑
  
  return new Response('API endpoint', {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 步骤 3: 绑定自定义域名

1. 在 Cloudflare Pages 项目中，进入 **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入您的域名（例如：`www.focuscollege.com`）
4. Cloudflare 会自动配置 DNS 记录

**DNS 配置会自动完成**：
```
CNAME www your-project.pages.dev
```

5. 等待 DNS 生效（通常 5-10 分钟）
6. SSL 证书会自动配置

### 步骤 4: 配置环境变量

在 Cloudflare Pages 设置中：
1. 进入 **Settings** → **Environment variables**
2. 添加以下变量：
   ```
   DATABASE_URL=mysql://...
   JWT_SECRET=your-secret
   VITE_APP_TITLE=创业进化系统
   NODE_ENV=production
   ```

---

## Vercel 部署

### 步骤 1: 准备项目

创建 `vercel.json`：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### 步骤 2: 部署到 Vercel

1. 安装 Vercel CLI：
   ```bash
   npm install -g vercel
   ```

2. 登录并部署：
   ```bash
   cd /home/user/webapp
   vercel
   ```

3. 按提示配置项目

### 步骤 3: 绑定域名

1. 在 Vercel Dashboard 中进入项目
2. 进入 **Settings** → **Domains**
3. 添加您的域名
4. 按照提示配置 DNS 记录

**需要在域名注册商添加的 DNS 记录**：
```
CNAME www cname.vercel-dns.com
```

---

## 自有服务器部署

### 前置要求
- Ubuntu 20.04+ / CentOS 7+
- Node.js 22+
- MySQL/MariaDB 10.11+
- Nginx

### 步骤 1: 服务器设置

1. **安装依赖**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Nginx
   sudo apt-get install nginx
   
   # MariaDB
   sudo apt-get install mariadb-server
   ```

2. **配置数据库**
   ```bash
   sudo mysql_secure_installation
   
   # 创建数据库
   sudo mysql
   > CREATE DATABASE competency_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   > CREATE USER 'webapp'@'localhost' IDENTIFIED BY 'your_password';
   > GRANT ALL PRIVILEGES ON competency_system.* TO 'webapp'@'localhost';
   > FLUSH PRIVILEGES;
   > EXIT;
   ```

### 步骤 2: 部署应用

1. **克隆代码**
   ```bash
   cd /var/www
   git clone https://github.com/callaaron/focus.college.git
   cd focus.college
   ```

2. **安装依赖并构建**
   ```bash
   npm install --production
   npm run build
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   修改 `.env`：
   ```env
   DATABASE_URL=mysql://webapp:your_password@localhost:3306/competency_system
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   VITE_APP_TITLE=创业进化系统
   ```

4. **运行数据库迁移**
   ```bash
   npm run db:push
   ```

5. **使用 PM2 管理进程**
   ```bash
   # 安装 PM2
   sudo npm install -g pm2
   
   # 启动应用
   pm2 start npm --name "focus-college" -- start
   
   # 设置开机自启
   pm2 startup
   pm2 save
   ```

### 步骤 3: 配置 Nginx

1. **创建 Nginx 配置**
   ```bash
   sudo nano /etc/nginx/sites-available/focuscollege.com
   ```

2. **配置文件内容**：
   ```nginx
   server {
       listen 80;
       server_name focuscollege.com www.focuscollege.com;
       
       # 重定向到 HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name focuscollege.com www.focuscollege.com;
       
       # SSL 证书路径（稍后配置）
       ssl_certificate /etc/letsencrypt/live/focuscollege.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/focuscollege.com/privkey.pem;
       
       # SSL 配置
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
       
       # 静态文件
       location / {
           root /var/www/focus.college/dist/public;
           try_files $uri $uri/ /index.html;
       }
       
       # API 代理
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # 安全头
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

3. **启用站点**
   ```bash
   sudo ln -s /etc/nginx/sites-available/focuscollege.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 步骤 4: 配置 SSL 证书

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d focuscollege.com -d www.focuscollege.com

# 自动续期
sudo certbot renew --dry-run
```

---

## DNS 配置

### A 记录（指向 IP）
如果使用自有服务器：

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| A | @ | 您的服务器IP | 3600 |
| A | www | 您的服务器IP | 3600 |

### CNAME 记录（指向其他域名）
如果使用 Cloudflare Pages 或 Vercel：

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| CNAME | www | your-project.pages.dev | Auto |

或

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| CNAME | www | cname.vercel-dns.com | Auto |

---

## SSL 证书配置

### Cloudflare / Vercel
✅ **自动配置** - 无需手动操作

### 自有服务器
使用 Let's Encrypt（免费）：
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

证书会自动续期。

---

## 验证域名绑定

### 1. 检查 DNS 生效
```bash
# macOS/Linux
dig yourdomain.com
nslookup yourdomain.com

# Windows
nslookup yourdomain.com
```

### 2. 检查 SSL 证书
```bash
curl -I https://yourdomain.com
```

### 3. 测试应用访问
在浏览器中访问：
```
https://yourdomain.com
https://www.yourdomain.com
```

---

## 常见问题

### Q1: DNS 多久生效？
**A**: 通常 5-30 分钟，最长可能需要 24-48 小时

### Q2: 显示"连接不安全"？
**A**: 
- 检查 SSL 证书是否正确安装
- 确认使用 HTTPS 访问
- 等待 SSL 证书生效（约 5-10 分钟）

### Q3: API 请求失败？
**A**: 
- 检查 Nginx 代理配置
- 确认后端服务正在运行
- 检查防火墙设置

### Q4: 数据库连接失败？
**A**: 
- 使用外部可访问的数据库（PlanetScale、Railway）
- 确认 DATABASE_URL 正确
- 检查数据库防火墙规则

---

## 推荐配置

### 小型项目（< 1000 用户/天）
**推荐**: Cloudflare Pages + PlanetScale（MySQL）
- 前端: Cloudflare Pages（免费）
- 数据库: PlanetScale Free Tier
- 总成本: $0/月

### 中型项目（1000-10000 用户/天）
**推荐**: Vercel + Railway
- 前端: Vercel Pro ($20/月)
- 数据库: Railway ($5-20/月)
- 总成本: $25-40/月

### 大型项目（> 10000 用户/天）
**推荐**: 自有服务器 + CDN
- 服务器: AWS/阿里云/腾讯云 ($50-200/月)
- CDN: Cloudflare (免费或 $20/月)
- 数据库: 独立数据库服务器
- 总成本: $50-250/月

---

## 下一步

1. 选择部署方案
2. 准备域名（如果还没有）
3. 按照对应方案的步骤操作
4. 配置 DNS 记录
5. 等待 DNS 生效
6. 测试访问

**需要帮助？** 请告诉我：
- 您的域名
- 选择的部署方案
- 遇到的具体问题

我会提供针对性的帮助！
