# 创业进化系统 - 配置指南

## 环境配置

### 1. 复制环境变量文件

```bash
cp .env.example .env
```

### 2. 配置 OpenAI API Key

系统的"综合分析"功能需要 OpenAI API Key。请按以下步骤配置:

#### 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录您的账号
3. 进入 [API Keys](https://platform.openai.com/api-keys) 页面
4. 点击 "Create new secret key" 创建新的 API Key
5. 复制生成的 Key (格式: `sk-...`)

#### 配置到 .env 文件

编辑 `.env` 文件,替换占位符:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

⚠️ **注意**: 
- 请不要将真实的 API Key 提交到 Git 仓库
- `.env` 文件已被添加到 `.gitignore` 中
- 如果您没有配置 API Key,AI 分析功能将无法使用,但其他功能正常

### 3. 其他配置项

#### 数据库配置

```env
DATABASE_URL=mysql://webapp:webapp_password_2024@localhost:3306/competency_system
```

如果您的数据库配置不同,请相应修改。

#### JWT Secret

```env
JWT_SECRET=development-secret-key-change-in-production-12345678
```

⚠️ **生产环境请务必更换为强随机字符串！**

## 启动开发服务器

### 安装依赖

```bash
npm install
```

### 启动后端

```bash
npm run dev
```

后端服务器将运行在 `http://localhost:3000`

### 启动前端 (另一个终端)

```bash
npx vite
```

前端服务器将运行在 `http://localhost:5173`

## Demo 账号

系统提供了 3 个演示账号用于测试:

| 用户名 | 密码 | 角色 | 描述 |
|--------|------|------|------|
| `demo_ceo` | `demo123` | CEO | 张总 - 10年管理经验 |
| `demo_cto` | `demo123` | CTO | 李总 - 15年技术管理 |
| `demo_manager` | `demo123` | Manager | 王经理 - 5年项目管理 |

访问 `/login` 页面即可使用这些账号登录。

## 功能说明

### 可用功能 (无需 OpenAI API Key)

- ✅ 用户登录/注册
- ✅ 能力评估
- ✅ 能力雷达图可视化
- ✅ 个人资料管理
- ✅ 成长路径查看

### 需要 OpenAI API Key 的功能

- 🤖 综合分析 (AI 生成的个性化分析报告)
- 🤖 智能推荐 (基于 AI 的成长建议)

## 常见问题

### Q: "OPENAI_API_KEY is not configured" 错误

**A**: 这表示您还没有配置 OpenAI API Key。请按照上述步骤配置,或者暂时跳过 AI 分析功能。

### Q: OpenAI API Key 是必须的吗？

**A**: 不是必须的。系统的基础功能都可以正常使用,只有 AI 分析功能需要 API Key。

### Q: API Key 会产生费用吗？

**A**: 是的,OpenAI API 按使用量计费。建议查看 [OpenAI Pricing](https://openai.com/pricing) 了解详情。

### Q: 如何验证 API Key 是否配置成功？

**A**: 
1. 重启后端服务器
2. 登录系统
3. 进入"综合分析"页面
4. 如果能正常生成分析报告,说明配置成功

## 技术支持

如有问题,请查看项目文档或联系开发团队。
