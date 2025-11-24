# focus.college 部署快速参考卡 🚀

> 5 分钟了解全部部署流程

---

## 📚 文档导航

| 文档 | 用途 | 阅读时间 |
|------|------|---------|
| **FOCUS_COLLEGE_DEPLOYMENT.md** | 📖 完整部署指南 | 15 分钟 |
| **ALIYUN_DNS_SETUP.md** | 🌐 阿里云 DNS 配置 | 10 分钟 |
| **QUICK_DOMAIN_SETUP.md** | ⚡ 快速上手 | 5 分钟 |
| **DOMAIN_SETUP_CHECKLIST.md** | ✅ 检查清单 | 随时查阅 |

---

## 🎯 部署流程总览

```
1. Cloudflare 注册    (5分钟)
          ↓
2. 连接 GitHub        (5分钟)
          ↓
3. 配置构建          (3分钟)
          ↓
4. 准备数据库        (10分钟)
          ↓
5. 阿里云 DNS 修改   (5分钟)
          ↓
6. 等待 DNS 生效     (30分钟-2小时)
          ↓
7. 绑定域名          (5分钟)
          ↓
8. 测试验证          (10分钟)
          ↓
     🎉 完成！
```

**总计时间**: 60-90 分钟（不含 DNS 等待时间）

---

## 🔑 关键信息

### Cloudflare 账号
- 网址: https://dash.cloudflare.com/
- 账号: _______________
- 项目名: focus-college

### 域名信息
- 域名: focus.college
- 注册商: 阿里云
- Cloudflare Nameserver 1: ___.ns.cloudflare.com
- Cloudflare Nameserver 2: ___.ns.cloudflare.com

### 数据库信息
- 提供商: _______________ (推荐 PlanetScale)
- 连接字符串: mysql://...
- 数据库名: focus-college

### 环境变量
```env
NODE_VERSION=22
DATABASE_URL=mysql://...
JWT_SECRET=[生成的32位字符串]
VITE_APP_TITLE=创业进化系统
NODE_ENV=production
```

---

## ⚡ 快速命令

### 生成 JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 检查部署状态
```bash
cd /home/user/webapp
./check-deployment.sh
```

### 初始化数据库
```bash
export DATABASE_URL="mysql://..."
npm run db:push
npx tsx scripts/seed-competency-data.ts
npx tsx scripts/seed-industry-competencies.ts
npx tsx scripts/seed-position-competencies.ts
npx tsx scripts/fix-industries-encoding.ts
npx tsx scripts/fix-question-encoding.ts
```

### 检查 DNS
```bash
nslookup focus.college
dig focus.college NS
```

### 测试访问
```bash
curl -I https://focus.college
```

---

## 📋 部署检查清单

### Cloudflare 设置
- [ ] 已注册 Cloudflare 账号
- [ ] 已添加 focus.college 域名
- [ ] 已创建 Pages 项目
- [ ] 已连接 GitHub 仓库
- [ ] 构建命令: `npm run build`
- [ ] 输出目录: `dist/public`
- [ ] 环境变量已配置

### 数据库设置
- [ ] 已选择数据库提供商
- [ ] 已创建数据库实例
- [ ] 已获取连接字符串
- [ ] 已运行数据库迁移
- [ ] 已插入初始数据

### DNS 配置
- [ ] 已在阿里云修改 Nameservers
- [ ] 已在 Cloudflare 验证域名
- [ ] DNS 已开始传播
- [ ] 已绑定自定义域名

### 验证测试
- [ ] 临时域名可访问
- [ ] 自定义域名可访问
- [ ] HTTPS 正常工作
- [ ] 所有功能正常
- [ ] 性能符合预期

---

## 🆘 快速故障排除

### 问题: 网站无法访问
```bash
# 1. 检查 DNS
nslookup focus.college

# 2. 检查部署状态
./check-deployment.sh

# 3. 查看 Cloudflare Pages 日志
# 访问: https://dash.cloudflare.com/
```

### 问题: API 错误
```
# 检查环境变量
1. Cloudflare Pages → Settings → Environment variables
2. 确认 DATABASE_URL 正确
3. 确认 JWT_SECRET 存在
4. 重新部署
```

### 问题: 数据库连接失败
```bash
# 测试数据库连接
mysql -h [host] -P [port] -u [user] -p [database]

# 检查 IP 白名单（如果使用云数据库）
```

---

## 📞 获取帮助

### 在线资源
- Cloudflare Docs: https://developers.cloudflare.com/pages/
- PlanetScale Docs: https://planetscale.com/docs
- GitHub 仓库: https://github.com/callaaron/focus.college

### 状态检查工具
- DNS 传播: https://www.whatsmydns.net/
- SSL 测试: https://www.ssllabs.com/ssltest/
- 网站速度: https://www.webpagetest.org/

### 联系支持
- Cloudflare Support: https://dash.cloudflare.com/support
- 项目 Issues: https://github.com/callaaron/focus.college/issues

---

## 🎯 下一步

部署完成后：

1. **配置监控**
   - 设置 Uptime Robot
   - 启用 Cloudflare Analytics
   - 配置错误通知

2. **性能优化**
   - 启用 Cloudflare Cache
   - 配置 Auto Minify
   - 启用 Brotli 压缩

3. **安全加固**
   - 启用 WAF 规则
   - 配置 Rate Limiting
   - 启用 Bot Protection

4. **SEO 优化**
   - 提交到 Google Search Console
   - 配置 robots.txt
   - 添加 sitemap.xml

---

## 📊 重要链接

| 服务 | URL |
|------|-----|
| 生产环境 | https://focus.college |
| Cloudflare Dashboard | https://dash.cloudflare.com/ |
| GitHub 仓库 | https://github.com/callaaron/focus.college |
| 阿里云控制台 | https://www.aliyun.com/ |

---

## 📝 操作记录

**部署日期**: ___________  
**部署人员**: ___________  
**首次部署**: ___________  
**域名生效**: ___________  
**测试通过**: ___________  

---

**祝部署顺利！** 🎉

有任何问题随时查阅详细文档或寻求帮助。
