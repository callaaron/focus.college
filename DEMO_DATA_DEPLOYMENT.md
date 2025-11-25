# 🎭 演示账户数据部署指南

## 📋 演示账户信息

系统包含3个演示账户，用于展示不同角色的能力画像：

| 账户 | 用户名 | 密码 | 角色 | 特点 |
|------|--------|------|------|------|
| 1 | `demo_pm` | `demo123` | 高级产品经理 | 互联网行业，中层管理，3年经验 |
| 2 | `demo_cto` | `demo123` | 首席技术官 | AI行业，高管层，8年经验 |
| 3 | `demo_ceo` | `demo123` | 首席执行官 | 金融科技，高管层，12年经验 |

---

## 🚀 部署演示数据

### 方法1：使用自动化脚本（推荐）

```bash
# 部署到Cloudflare D1生产数据库
bash scripts/deploy-demo-data.sh
```

脚本会自动：
1. ✅ 生成密码哈希
2. ✅ 准备SQL文件
3. ✅ 部署到D1数据库
4. ✅ 显示账户信息

---

### 方法2：手动执行SQL

#### 步骤1：生成密码哈希

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('demo123', 10));"
```

#### 步骤2：编辑SQL文件

将生成的哈希替换到 `scripts/seed-demo-users-d1.sql` 中的：
```sql
'$2a$10$YourHashedPasswordHere'
```

#### 步骤3：执行SQL

```bash
# 生产环境
wrangler d1 execute focus-college-db --remote --file=scripts/seed-demo-users-d1.sql

# 本地测试
wrangler d1 execute focus-college-db --local --file=scripts/seed-demo-users-d1.sql
```

---

## 📊 演示数据详情

### 1. demo_pm (产品经理)

```json
{
  "profile": {
    "fullName": "张伟 (产品经理)",
    "industry": "互联网",
    "industryId": 1,
    "currentRole": "高级产品经理",
    "positionId": 5,
    "managementLevel": "middle",
    "companySize": "medium",
    "companyStage": "series_b",
    "yearsOfManagement": 3,
    "directReports": 5,
    "teamSize": 8
  },
  "competencyScores": {
    "average": 70-75,
    "levels": ["basic", "intermediate", "proficient"]
  }
}
```

**特点**：
- 中级管理经验
- B轮互联网公司
- 小团队管理
- 能力均衡发展

---

### 2. demo_cto (技术总监)

```json
{
  "profile": {
    "fullName": "李明 (技术总监)",
    "industry": "人工智能",
    "industryId": 2,
    "currentRole": "首席技术官",
    "positionId": 2,
    "managementLevel": "executive",
    "companySize": "large",
    "companyStage": "series_c",
    "yearsOfManagement": 8,
    "directReports": 15,
    "teamSize": 120
  },
  "competencyScores": {
    "average": 85-90,
    "levels": ["intermediate", "proficient", "expert"]
  }
}
```

**特点**：
- 高管层经验
- C轮AI公司
- 大团队管理（120人）
- 高级技术能力

---

### 3. demo_ceo (首席执行官)

```json
{
  "profile": {
    "fullName": "王芳 (首席执行官)",
    "industry": "金融科技",
    "industryId": 3,
    "currentRole": "首席执行官",
    "positionId": 1,
    "managementLevel": "executive",
    "companySize": "large",
    "companyStage": "pre_ipo",
    "yearsOfManagement": 12,
    "directReports": 8,
    "teamSize": 500
  },
  "competencyScores": {
    "average": 90-95,
    "levels": ["proficient", "expert", "expert"]
  }
}
```

**特点**：
- 最高管理层
- Pre-IPO金融科技公司
- 超大团队管理（500人）
- 专家级综合能力

---

## 🎯 能力评分模式

演示账户的能力评分按以下规则生成：

```sql
-- PM能力评分：65-85分
competencyId % 3 = 0 → 85分 (proficient)
competencyId % 3 = 1 → 75分 (intermediate)
competencyId % 3 = 2 → 65分 (basic)

-- CTO能力评分：75-95分
competencyId % 3 = 0 → 95分 (expert)
competencyId % 3 = 1 → 85分 (proficient)
competencyId % 3 = 2 → 75分 (intermediate)

-- CEO能力评分：78-98分
competencyId % 3 = 0 → 98分 (expert)
competencyId % 3 = 1 → 88分 (expert)
competencyId % 3 = 2 → 78分 (proficient)
```

这样的分布能够：
- ✅ 展示不同等级的能力差异
- ✅ 提供真实的雷达图效果
- ✅ 体现职位与能力的关系

---

## ✅ 部署验证

部署完成后，请验证：

### 1. 登录测试

```bash
# 测试 demo_pm
curl -X POST https://focus-college.pages.dev/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_pm","password":"demo123"}'
```

### 2. 访问页面测试

- 访问: https://focus-college.pages.dev/login
- 输入: demo_pm / demo123
- 检查: 能否正常登录并看到完整profile

### 3. 数据完整性检查

登录后检查：
- [ ] 用户画像页面是否显示完整信息？
- [ ] 能力看板是否显示雷达图？
- [ ] 评估历史是否有数据？
- [ ] 各个能力域是否有评分？

---

## 🔧 故障排除

### 问题1：SQL执行失败

**错误**: `no such table: users`

**解决方案**：
```bash
# 1. 检查表是否存在
wrangler d1 execute focus-college-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"

# 2. 如果表不存在，先运行迁移
wrangler d1 migrations apply focus-college-db --remote
```

### 问题2：密码错误

**错误**: 无法登录演示账户

**解决方案**：
```bash
# 重新生成密码哈希并更新
PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('demo123', 10));")
echo "UPDATE users SET passwordHash='$PASSWORD_HASH' WHERE username IN ('demo_pm', 'demo_cto', 'demo_ceo');" | wrangler d1 execute focus-college-db --remote --file=-
```

### 问题3：能力评分缺失

**错误**: 能力看板无数据

**解决方案**：
```bash
# 检查能力表是否有数据
wrangler d1 execute focus-college-db --remote --command="SELECT COUNT(*) FROM competencies;"

# 如果没有，先导入能力数据
bash scripts/deploy-seed-d1.sh
```

---

## 📝 维护建议

### 定期更新演示数据

建议每月更新一次演示数据，保持数据的时效性：

```bash
# 1. 备份现有数据
wrangler d1 export focus-college-db --remote --output=backup-$(date +%Y%m%d).sql

# 2. 清理旧演示数据
wrangler d1 execute focus-college-db --remote --command="DELETE FROM competencyScores WHERE userId IN (101,102,103);"

# 3. 重新导入
bash scripts/deploy-demo-data.sh
```

### 监控演示账户使用

定期检查演示账户的登录情况：

```bash
wrangler d1 execute focus-college-db --remote --command="
  SELECT username, lastSignedIn 
  FROM users 
  WHERE isDemo = 1 
  ORDER BY lastSignedIn DESC;
"
```

---

## 🎉 部署完成

演示数据部署完成后，你的系统将拥有：

- ✅ 3个不同层级的演示账户
- ✅ 完整的用户画像数据
- ✅ 35个能力项的评分数据
- ✅ 真实的雷达图展示效果

用户可以立即体验完整的系统功能！🚀

---

**部署指南版本**: v1.0  
**最后更新**: 2025-11-25  
**维护人员**: GenSpark AI
