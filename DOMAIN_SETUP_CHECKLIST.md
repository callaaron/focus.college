# 域名绑定设置检查清单 ✅

使用本检查清单确保域名绑定配置正确无误。

---

## 📋 前期准备

- [ ] 已购买域名
- [ ] 知道域名注册商（阿里云/腾讯云/Cloudflare/GoDaddy等）
- [ ] 可以访问域名管理后台
- [ ] 选择好部署平台（Cloudflare Pages/Vercel/自有服务器）

**域名信息**:
```
域名: _________________
注册商: _________________
部署平台: _________________
```

---

## 🚀 Cloudflare Pages 部署清单

### 1️⃣ 账号准备
- [ ] 注册 Cloudflare 账号
- [ ] 验证邮箱
- [ ] 登录 Dashboard: https://dash.cloudflare.com/

### 2️⃣ 连接 GitHub 仓库
- [ ] 进入 Pages 页面
- [ ] 点击 "Create a project"
- [ ] 选择 "Connect to Git"
- [ ] 授权 GitHub
- [ ] 选择仓库: `callaaron/focus.college`

### 3️⃣ 配置构建设置
- [ ] Framework preset: **None**
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist/public`
- [ ] Root directory: `/`
- [ ] Node.js version: `22`

### 4️⃣ 配置环境变量
在 Settings → Environment variables 中添加：

- [ ] `DATABASE_URL` = `mysql://user:password@host:3306/database`
- [ ] `JWT_SECRET` = 您的密钥（至少32位随机字符串）
- [ ] `VITE_APP_TITLE` = `创业进化系统`
- [ ] `NODE_ENV` = `production`

**JWT_SECRET 生成方法**:
```bash
# 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ 数据库准备
- [ ] 选择数据库服务商（推荐 PlanetScale 免费版）
- [ ] 创建数据库实例
- [ ] 获取连接字符串
- [ ] 运行数据库迁移（本地或 CI/CD）
- [ ] 插入初始数据（能力、行业等）

### 6️⃣ 首次部署
- [ ] 提交代码到 GitHub
- [ ] Cloudflare Pages 自动触发构建
- [ ] 等待构建完成（约 3-5 分钟）
- [ ] 获得临时域名: `https://your-project.pages.dev`
- [ ] 测试临时域名是否正常访问

### 7️⃣ 绑定自定义域名
- [ ] 进入 Pages 项目 → Custom domains
- [ ] 点击 "Set up a custom domain"
- [ ] 输入域名（例如：`www.focuscollege.com`）
- [ ] 按照提示配置 DNS（Cloudflare 会自动处理）
- [ ] 等待 DNS 生效（5-30 分钟）
- [ ] 测试自定义域名访问

### 8️⃣ SSL 证书
- [ ] 确认 SSL 证书自动配置（通常自动完成）
- [ ] 测试 HTTPS 访问
- [ ] 检查证书有效性

### 9️⃣ 性能优化
- [ ] 启用 Cloudflare CDN（默认启用）
- [ ] 配置缓存规则
- [ ] 测试全球访问速度

### 🔟 监控和维护
- [ ] 设置部署通知
- [ ] 配置错误监控
- [ ] 设置定期备份
- [ ] 记录访问日志

---

## 🔐 DNS 配置清单（如果使用非 Cloudflare 域名）

### 如果域名在其他注册商：

#### 选项 A: 使用 Cloudflare DNS（推荐）
- [ ] 在域名注册商修改 Nameservers 为 Cloudflare
- [ ] 等待 Nameserver 生效（24-48小时）
- [ ] 在 Cloudflare 自动添加 DNS 记录

**Cloudflare Nameservers**（登录后查看）:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

#### 选项 B: 添加 CNAME 记录
- [ ] 登录域名注册商
- [ ] 进入 DNS 管理
- [ ] 添加 CNAME 记录：
  ```
  类型: CNAME
  名称: www
  值: your-project.pages.dev
  TTL: Auto 或 3600
  ```
- [ ] 保存并等待生效（5-30分钟）

---

## 🖥️ 自有服务器部署清单

### 1️⃣ 服务器准备
- [ ] 服务器已安装 Ubuntu 20.04+ / CentOS 7+
- [ ] 拥有 root 或 sudo 权限
- [ ] 服务器可以访问外网
- [ ] 防火墙开放 80 和 443 端口

### 2️⃣ 软件安装
- [ ] Node.js 22+ 已安装
- [ ] MySQL/MariaDB 10.11+ 已安装
- [ ] Nginx 已安装
- [ ] PM2 已安装（进程管理）
- [ ] Certbot 已安装（SSL 证书）

### 3️⃣ 数据库配置
- [ ] 创建数据库: `competency_system`
- [ ] 创建用户并授权
- [ ] 设置字符集为 utf8mb4
- [ ] 测试数据库连接

### 4️⃣ 应用部署
- [ ] 克隆代码到服务器
- [ ] 安装依赖: `npm install --production`
- [ ] 配置 `.env` 文件
- [ ] 构建项目: `npm run build`
- [ ] 运行数据库迁移: `npm run db:push`
- [ ] 使用 PM2 启动应用

### 5️⃣ Nginx 配置
- [ ] 创建 Nginx 配置文件
- [ ] 配置静态文件路径
- [ ] 配置 API 反向代理
- [ ] 配置 SSL（使用 Certbot）
- [ ] 测试配置: `nginx -t`
- [ ] 重启 Nginx: `systemctl reload nginx`

### 6️⃣ DNS 配置
- [ ] 登录域名注册商
- [ ] 添加 A 记录指向服务器 IP：
  ```
  类型: A
  名称: @
  值: 您的服务器IP
  TTL: 3600
  ```
- [ ] 添加 www 记录：
  ```
  类型: A
  名称: www
  值: 您的服务器IP
  TTL: 3600
  ```
- [ ] 等待 DNS 生效

### 7️⃣ SSL 证书
- [ ] 运行 Certbot: `certbot --nginx -d domain.com -d www.domain.com`
- [ ] 验证证书安装
- [ ] 测试自动续期: `certbot renew --dry-run`
- [ ] 设置自动续期 Cron 任务

### 8️⃣ 监控和维护
- [ ] 配置 PM2 监控
- [ ] 设置日志轮转
- [ ] 配置服务器监控（如 Prometheus）
- [ ] 设置告警通知
- [ ] 定期备份数据库

---

## 🧪 测试清单

### 功能测试
- [ ] 主页可以正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] API 接口响应正常
- [ ] 数据库读写正常
- [ ] 静态资源加载正常

### 性能测试
- [ ] 首屏加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片压缩优化
- [ ] 启用 Gzip/Brotli 压缩

### 安全测试
- [ ] HTTPS 强制跳转
- [ ] SSL 证书有效
- [ ] 安全头配置正确
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CSRF 防护

### 兼容性测试
- [ ] Chrome 浏览器测试
- [ ] Firefox 浏览器测试
- [ ] Safari 浏览器测试
- [ ] 移动端响应式测试

### DNS 和域名测试
- [ ] `ping yourdomain.com` 解析正确
- [ ] `nslookup yourdomain.com` 返回正确 IP
- [ ] `curl -I https://yourdomain.com` 返回 200
- [ ] www 和非 www 都可以访问
- [ ] HTTP 自动跳转到 HTTPS

---

## 📊 部署后检查

### 立即检查（部署后 10 分钟内）
- [ ] 网站可以访问
- [ ] 首页内容正确显示
- [ ] 图片和样式加载正常
- [ ] JavaScript 正常运行（检查控制台无错误）
- [ ] API 接口可以调用

### 短期检查（部署后 1-24 小时）
- [ ] 各个功能页面正常
- [ ] 用户注册登录流程完整
- [ ] 数据持久化正常
- [ ] SSL 证书生效
- [ ] DNS 全球生效（使用 whatsmydns.net 检查）

### 长期监控（持续）
- [ ] 设置 Uptime 监控（如 UptimeRobot）
- [ ] 设置错误日志收集
- [ ] 监控服务器资源使用
- [ ] 定期检查 SSL 证书有效期
- [ ] 定期备份数据

---

## 🆘 常见问题排查

### 问题 1: 域名无法访问
**检查项**:
- [ ] DNS 是否生效（使用 `nslookup` 或 `dig`）
- [ ] 等待时间是否足够（DNS 生效需要时间）
- [ ] 浏览器缓存是否清除
- [ ] 防火墙是否开放 80/443 端口

### 问题 2: 显示 SSL 证书错误
**检查项**:
- [ ] 证书是否安装成功
- [ ] 证书域名是否匹配
- [ ] 证书是否过期
- [ ] 中间证书是否完整

### 问题 3: API 请求失败
**检查项**:
- [ ] 后端服务是否运行
- [ ] Nginx 代理配置是否正确
- [ ] CORS 配置是否正确
- [ ] 环境变量是否配置
- [ ] 数据库连接是否正常

### 问题 4: 静态资源 404
**检查项**:
- [ ] 构建目录是否正确
- [ ] Nginx 静态文件路径是否正确
- [ ] 文件权限是否正确
- [ ] 路径大小写是否匹配

---

## 📞 获取帮助

如果遇到问题，请提供以下信息：

1. **域名**: _________________
2. **部署平台**: _________________
3. **错误信息**: _________________
4. **已完成的步骤**: _________________
5. **浏览器控制台错误**: _________________

可以使用以下命令收集诊断信息：

```bash
# DNS 诊断
dig yourdomain.com
nslookup yourdomain.com

# SSL 诊断
curl -vI https://yourdomain.com

# 服务器诊断（如果是自有服务器）
sudo systemctl status nginx
sudo systemctl status mariadb
pm2 status
pm2 logs
```

---

## ✅ 完成标志

当以下所有项目都打勾时，您的域名绑定就完成了：

- [ ] 域名可以正常访问（HTTP 和 HTTPS）
- [ ] SSL 证书显示为有效
- [ ] 所有功能正常运行
- [ ] 性能达到预期
- [ ] 监控系统已配置
- [ ] 备份策略已实施

🎉 **恭喜！您的网站已成功上线！**

---

**最后更新**: 2025-11-24  
**文档版本**: 1.0
