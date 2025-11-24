# 宝塔面板数据库配置指南

> 使用您自己的服务器 + 宝塔面板 MySQL 数据库

---

## 🎯 优势

✅ **完全免费** - 使用自己的服务器  
✅ **零代码修改** - MySQL 完全兼容  
✅ **完全控制** - 数据在自己手里  
✅ **无存储限制** - 取决于服务器硬盘  
✅ **快速稳定** - 国内访问速度快  

---

## 📋 前置准备

- [x] 已有服务器（阿里云/腾讯云/其他）
- [x] 已安装宝塔面板
- [x] 服务器可以访问外网
- [ ] 需要开放 MySQL 外网访问

---

## 🔧 步骤一：宝塔面板创建数据库

### 1.1 登录宝塔面板

访问您的宝塔面板：
```
http://您的服务器IP:8888
或
https://您的域名:8888
```

输入账号密码登录

---

### 1.2 安装 MySQL（如果未安装）

1. 在宝塔面板左侧菜单，点击 **软件商店**
2. 搜索 **MySQL**
3. 选择版本（推荐 **MySQL 5.7** 或 **MySQL 8.0**）
4. 点击 **安装**
5. 等待安装完成（约 5-10 分钟）

✅ 安装完成后，可以在 **已安装** 中看到 MySQL

---

### 1.3 创建数据库

1. 在宝塔面板左侧菜单，点击 **数据库**
2. 点击 **添加数据库**

填写信息：
```
数据库名: focus_college
用户名: focus_college_user
密码: [点击生成随机密码，或自定义]
访问权限: 所有人（重要！）
备注: Focus College 生产数据库
```

**重要**: 
- ⚠️ **访问权限** 必须选择 **所有人**（允许外网访问）
- 💾 记录好**数据库名、用户名、密码**

3. 点击 **提交**

✅ 数据库创建成功

---

### 1.4 记录数据库信息

创建成功后，记录以下信息：

```
数据库地址: 您的服务器IP（或域名）
端口: 3306（默认）
数据库名: focus_college
用户名: focus_college_user
密码: ___________________________（保存好）
```

---

## 🔐 步骤二：配置防火墙和安全组

### 2.1 宝塔面板放行端口

1. 在宝塔面板，点击 **安全**
2. 找到端口列表
3. 检查 **3306** 端口是否放行
4. 如果没有，点击 **添加规则**：
   ```
   端口: 3306
   协议: TCP
   备注: MySQL 外网访问
   ```
5. 点击 **放行**

---

### 2.2 服务器安全组配置

#### 如果使用阿里云：

1. 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
2. 进入 **实例** 列表
3. 点击您的服务器实例
4. 点击 **安全组** 标签
5. 点击 **配置规则**
6. 点击 **添加安全组规则**

入方向规则：
```
授权策略: 允许
协议类型: 自定义 TCP
端口范围: 3306/3306
授权对象: 0.0.0.0/0
描述: MySQL 外网访问
```

7. 点击 **确定**

#### 如果使用腾讯云：

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/cvm/instance)
2. 进入 **实例** 列表
3. 点击您的服务器实例
4. 点击 **安全组** → **修改规则**
5. 在 **入站规则** 中，点击 **添加规则**

```
类型: 自定义
来源: 0.0.0.0/0
协议端口: TCP:3306
策略: 允许
备注: MySQL
```

6. 点击 **完成**

---

## 🧪 步骤三：测试数据库连接

### 3.1 在本地测试连接

在您的开发机器上运行：

```bash
# 方法 1: 使用 mysql 命令（需要安装 MySQL 客户端）
mysql -h 您的服务器IP -P 3306 -u focus_college_user -p

# 输入密码后，如果看到 mysql> 提示符，说明连接成功！

# 退出
exit
```

```bash
# 方法 2: 使用 telnet 测试端口
telnet 您的服务器IP 3306

# 如果显示 "Connected to..."，说明端口开放正常
```

```bash
# 方法 3: 使用项目中的测试脚本
cd /home/user/webapp
cat > scripts/test-remote-db.ts << 'EOF'
import mysql from 'mysql2/promise';

async function testConnection() {
  console.log("🔍 测试远程数据库连接...\n");

  const config = {
    host: process.env.DB_HOST || '您的服务器IP',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'focus_college_user',
    password: process.env.DB_PASSWORD || '您的密码',
    database: process.env.DB_NAME || 'focus_college',
    charset: 'utf8mb4'
  };

  console.log("连接配置:");
  console.log(`主机: ${config.host}`);
  console.log(`端口: ${config.port}`);
  console.log(`用户: ${config.user}`);
  console.log(`数据库: ${config.database}`);
  console.log("");

  try {
    console.log("正在连接...");
    const connection = await mysql.createConnection(config);
    console.log("✅ 连接成功！\n");

    // 测试查询
    const [result] = await connection.query('SELECT VERSION() as version');
    console.log(`MySQL 版本: ${(result as any)[0].version}`);

    await connection.end();
    console.log("\n🎉 数据库连接测试通过！");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ 连接失败:", error.message);
    console.error("\n请检查:");
    console.error("1. 服务器 IP 是否正确");
    console.error("2. MySQL 3306 端口是否开放");
    console.error("3. 数据库用户名和密码是否正确");
    console.error("4. 宝塔数据库访问权限是否设置为'所有人'");
    console.error("5. 服务器安全组是否放行 3306 端口");
    process.exit(1);
  }
}

testConnection();
EOF

# 运行测试
npx tsx scripts/test-remote-db.ts
```

✅ 如果看到 "数据库连接测试通过"，说明配置正确！

---

## 🚀 步骤四：配置 Cloudflare Pages 环境变量

### 4.1 构建 DATABASE_URL

根据您的数据库信息，构建连接字符串：

```
格式：
mysql://用户名:密码@服务器IP:端口/数据库名

示例：
mysql://focus_college_user:your_password@123.456.789.123:3306/focus_college
```

**您的 DATABASE_URL**（请填写）：
```
mysql://focus_college_user:___________@___________:3306/focus_college
```

---

### 4.2 在 Cloudflare Pages 中配置

1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 进入 **Workers & Pages**
3. 选择您的 `focus-college` 项目
4. 点击 **Settings** 标签
5. 在左侧菜单点击 **Environment variables**
6. 点击 **Add variable**（Production）

添加以下变量：

**Variable 1**:
```
Variable name: DATABASE_URL
Value: mysql://focus_college_user:your_password@your_server_ip:3306/focus_college
```

**Variable 2**:
```
Variable name: JWT_SECRET
Value: [运行命令生成: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

**Variable 3**:
```
Variable name: NODE_VERSION
Value: 22
```

**Variable 4**:
```
Variable name: VITE_APP_TITLE
Value: 创业进化系统
```

**Variable 5**:
```
Variable name: NODE_ENV
Value: production
```

7. 点击 **Save**

---

## 📦 步骤五：初始化数据库

### 5.1 在本地运行迁移

```bash
cd /home/user/webapp

# 设置数据库连接（使用您的实际信息）
export DATABASE_URL="mysql://focus_college_user:your_password@your_server_ip:3306/focus_college"

# 1. 运行数据库迁移
echo "🔨 运行数据库迁移..."
npm run db:push

# 2. 插入能力体系数据
echo "📊 插入能力体系数据..."
npx tsx scripts/seed-competency-data.ts

# 3. 插入行业-能力关联
echo "🏢 插入行业-能力关联..."
npx tsx scripts/seed-industry-competencies.ts

# 4. 插入职位-能力关联
echo "👔 插入职位-能力关联..."
npx tsx scripts/seed-position-competencies.ts

# 5. 修复行业编码
echo "🔧 修复行业编码..."
npx tsx scripts/fix-industries-encoding.ts

# 6. 插入题库数据
echo "📝 插入题库数据..."
npx tsx scripts/fix-question-encoding.ts

echo "✅ 数据库初始化完成！"
```

---

### 5.2 验证数据

```bash
# 连接数据库查看数据
mysql -h your_server_ip -P 3306 -u focus_college_user -p focus_college

# 在 MySQL 提示符下运行
SELECT COUNT(*) FROM competencies;  -- 应该返回 40
SELECT COUNT(*) FROM industries;    -- 应该返回 21
SELECT COUNT(*) FROM positions;     -- 应该返回 12
SELECT COUNT(*) FROM assessmentQuestions; -- 应该返回 30

# 退出
exit
```

✅ 数据正确插入

---

## 🌐 步骤六：部署到 Cloudflare Pages

### 6.1 触发重新部署

由于添加了环境变量，需要重新部署：

**方法 1: 在 Cloudflare Dashboard**
1. 进入项目 → **Deployments** 标签
2. 找到最新的部署
3. 点击右侧 **...** → **Retry deployment**

**方法 2: 推送新提交**
```bash
cd /home/user/webapp
git commit --allow-empty -m "trigger redeploy with database config"
git push origin main
```

等待 3-5 分钟部署完成

---

### 6.2 验证部署

部署完成后，访问您的临时域名或自定义域名：
- https://focus-college-xxx.pages.dev
- https://focus.college（如果已绑定域名）

检查：
- [ ] ✅ 网站可以正常访问
- [ ] ✅ 可以注册新用户
- [ ] ✅ 可以登录
- [ ] ✅ 能力评估功能正常
- [ ] ✅ 浏览器控制台无错误

---

## 🔒 步骤七：安全优化（可选但推荐）

### 7.1 限制数据库访问 IP

为了安全，可以将数据库访问限制为只允许 Cloudflare IP：

1. 在宝塔面板 → **数据库** → 找到 `focus_college`
2. 点击 **权限** 或 **修改**
3. 将 **访问权限** 从 "所有人" 改为 "指定 IP"
4. 添加 Cloudflare IP 段（这些是 Cloudflare Pages 的出口 IP）：
   ```
   173.245.48.0/20
   103.21.244.0/22
   103.22.200.0/22
   103.31.4.0/22
   141.101.64.0/18
   108.162.192.0/18
   190.93.240.0/20
   188.114.96.0/20
   197.234.240.0/22
   198.41.128.0/17
   162.158.0.0/15
   104.16.0.0/13
   104.24.0.0/14
   172.64.0.0/13
   131.0.72.0/22
   ```

⚠️ **注意**: 这样配置后，您本地开发无法直接连接数据库，需要：
- 使用 SSH 隧道
- 或暂时改回 "所有人"

---

### 7.2 定期备份

在宝塔面板配置自动备份：

1. 点击 **计划任务**
2. 点击 **添加任务**
3. 任务类型：**备份数据库**
4. 任务名称：`Focus College DB 备份`
5. 执行周期：**每天** 凌晨 2:00
6. 备份到：**服务器磁盘** + **七牛云/阿里云OSS**（如有）
7. 保留备份：**7 天**
8. 点击 **添加任务**

✅ 数据库每天自动备份

---

### 7.3 监控数据库性能

在宝塔面板：
1. 点击 **软件商店**
2. 找到已安装的 **MySQL**
3. 点击 **设置**
4. 查看 **性能调整** 和 **负载状态**
5. 根据服务器配置调整参数

---

## 📊 步骤八：验证部署完成

### 8.1 运行检查脚本

```bash
cd /home/user/webapp
./check-deployment.sh
```

应该看到：
- ✅ DNS 解析正确
- ✅ HTTPS 正常
- ✅ SSL 证书有效
- ✅ 性能良好

---

### 8.2 功能测试清单

- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 个人能力评估
- [ ] 企业能力评估
- [ ] 能力分析报告
- [ ] 学习路径推荐
- [ ] 管理后台（题库管理）
- [ ] 数据持久化（刷新页面后数据还在）

---

## 💰 成本分析

### 使用自己服务器的成本

假设服务器配置：
- **2核 4GB 内存**
- **阿里云/腾讯云**
- **按年付费**

成本：
- 服务器：￥300-500/年（已有）
- 宝塔面板：免费版足够
- MySQL：免费（使用服务器资源）
- **额外成本**: **￥0**

vs 云数据库：
- PlanetScale: $15/月 = $180/年 = ￥1260/年
- Railway: $5/月 = $60/年 = ￥420/年

**节省**: ￥420-1260/年 💰

---

## 🆘 常见问题

### Q1: 连接数据库失败，提示 "Connection refused"

**解决方法**:
1. 检查宝塔面板 MySQL 是否正在运行
2. 检查 3306 端口是否开放（宝塔面板 → 安全）
3. 检查服务器安全组是否放行 3306
4. 使用 `telnet 服务器IP 3306` 测试端口

---

### Q2: 连接数据库失败，提示 "Access denied"

**解决方法**:
1. 检查用户名和密码是否正确
2. 检查数据库访问权限是否设置为 "所有人"
3. 在宝塔面板重置数据库密码

---

### Q3: 网站可以访问，但 API 请求失败

**解决方法**:
1. 检查浏览器控制台错误
2. 检查 Cloudflare Pages 环境变量是否正确
3. 检查 DATABASE_URL 格式是否正确
4. 重新部署 Cloudflare Pages

---

### Q4: 数据库性能慢

**解决方法**:
1. 在宝塔面板检查 MySQL 负载
2. 增加 MySQL 内存配置
3. 添加必要的索引
4. 考虑升级服务器配置

---

### Q5: 本地开发如何连接生产数据库？

**不推荐直接连接生产数据库**，建议：

**方法 1: 使用本地数据库**
```bash
# 本地运行 MySQL（Docker）
docker run -d \
  --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=dev_password \
  -e MYSQL_DATABASE=focus_college \
  -p 3306:3306 \
  mysql:8.0

# 本地 DATABASE_URL
export DATABASE_URL="mysql://root:dev_password@localhost:3306/focus_college"
```

**方法 2: SSH 隧道**
```bash
# 通过 SSH 隧道连接
ssh -L 3307:localhost:3306 root@your_server_ip

# 然后连接到本地 3307 端口
export DATABASE_URL="mysql://focus_college_user:password@localhost:3307/focus_college"
```

---

## ✅ 完成检查清单

- [ ] 宝塔面板已创建数据库
- [ ] 数据库访问权限设置为 "所有人"
- [ ] 服务器 3306 端口已放行
- [ ] 安全组规则已添加
- [ ] 本地可以连接数据库
- [ ] Cloudflare Pages 环境变量已配置
- [ ] 数据库已初始化（表结构 + 初始数据）
- [ ] Cloudflare Pages 已重新部署
- [ ] 网站可以正常访问
- [ ] 所有功能测试通过
- [ ] 已配置数据库自动备份

---

## 🎉 恭喜！

您已成功配置好自己服务器的 MySQL 数据库，并完成了 focus.college 的部署！

**您的部署架构**：
```
用户浏览器
    ↓ HTTPS
Cloudflare CDN (全球加速)
    ↓
Cloudflare Pages (前端 + API)
    ↓ MySQL 连接
您的服务器 (宝塔 MySQL)
```

**优势**：
- ✅ 完全免费（除服务器成本）
- ✅ 数据完全掌控
- ✅ 无存储限制
- ✅ 国内访问快

---

## 📞 需要帮助？

如果遇到问题，提供以下信息：

1. **服务器类型**: 阿里云/腾讯云/其他
2. **宝塔版本**: _______
3. **MySQL 版本**: _______
4. **错误信息**: _______
5. **连接测试结果**: _______

我会帮您诊断并解决问题！

---

**文档版本**: 1.0  
**创建时间**: 2025-11-24  
**适用场景**: 自有服务器 + 宝塔面板
