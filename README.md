<div align="center">

# 创业进化系统

### Competency Assessment & Growth Platform for Entrepreneurs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white)](https://trpc.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-4D6BFE)](https://www.deepseek.com)
[![MySQL](https://img.shields.io/badge/MySQL-9-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)

通过结构化问卷、AI 分析和多维评分模型，帮助创业者和管理者**识别能力短板**、**规划学习路径**、**追踪成长轨迹**。

[功能介绍](#功能概览) · [快速开始](#快速开始) · [演示账户](#演示账户) · [能力模型](#能力模型) · [贡献指南](#贡献指南)

</div>

---

## 功能概览

| 模块 | 说明 |
|:----:|------|
| **能力评估** | 49 道结构化问卷，覆盖 8 大能力域 40 项核心能力 |
| **能力看板** | 雷达图可视化 + 四色渐变统计卡（已掌握 / 学习中 / 待开始） |
| **缺口分析** | 自动识别短板能力（< 60 分），按优先级排序推荐提升方向 |
| **学习路径** | 基于缺口分析生成个性化学习路径，关联学习资源 |
| **今日挑战** | 每日场景化挑战题，积分排行榜 + 连续打卡 |
| **成就系统** | 多维度成就解锁（评估 / 学习 / 成长 / 社交） |
| **企业评估** | 四维度企业能力诊断（战略 / 运营 / 组织 / 创新） |
| **AI 分析** | DeepSeek 驱动的能力提升建议与综合分析报告 |
| **管理后台** | 用户管理、题库管理、数据统计 |

## 评分模型

能力综合得分采用**四源加权**模型，兼顾客观性与主观参考：

```
综合得分 = 问卷答题 × 40% + AI分析 × 30% + 自我评估 × 20% + 证据上传 × 10%
```

| 等级 | 分数区间 | 状态 |
|:----:|:--------:|:----:|
| L5 | 81 - 100 | 已掌握 |
| L4 | 61 - 80 | 学习中 |
| L3 | 41 - 60 | 学习中 |
| L2 | 21 - 40 | 待开始 |
| L1 | 0 - 20 | 待开始 |

## 能力模型

8 大能力域，40 项核心能力，覆盖创业者必备能力全图谱：

| 能力域 | 核心能力 |
|--------|----------|
| **战略领导力** | 商业模式设计 · 战略规划 · 市场分析 · 竞争策略 · 商业洞察 |
| **产品创新** | 需求分析 · 产品设计 · 产品迭代 · 用户体验 · 创新思维 |
| **市场营销** | 品牌建设 · 营销策划 · 渠道拓展 · 数据分析 · 用户增长 |
| **团队管理** | 人才招聘 · 团队激励 · 绩效管理 · 组织文化 · 冲突处理 |
| **运营管理** | 流程优化 · 项目管理 · 质量管控 · 风险控制 · 成本管理 |
| **财务能力** | 财务规划 · 资本运作 · 成本管控 · 投资判断 · 合规管理 |
| **资源整合** | 人脉拓展 · 资源整合 · 合作谈判 · 供应链管理 · 政企关系 |
| **创业心态** | 抗压能力 · 决策魄力 · 自我迭代 · 领导魅力 · 社会责任 |

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · wouter · Radix UI · Recharts |
| **后端** | Express · tRPC · Drizzle ORM · MySQL 9 · superjson |
| **AI** | DeepSeek v4-pro（`/chat/completions` + `thinking.enabled`） |
| **认证** | JWT（jose）· bcryptjs · httpOnly cookie |

## 快速开始

### 环境要求

- Node.js 22+
- MySQL 8+
- npm 或 pnpm

### 安装与配置

```bash
# 1. 克隆仓库
git clone https://github.com/callaaron/focus.college.git
cd focus.college

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
#    编辑 .env，填写 DATABASE_URL、JWT_SECRET、DEEPSEEK_API_KEY
```

### 初始化数据库

```bash
# 创建数据库
mysql -u root -e "CREATE DATABASE competency_system;"

# 运行 Drizzle migration
npx drizzle-kit generate && npx drizzle-kit migrate

# 插入能力域和能力（8 域 + 40 能力）
mysql -u root competency_system < scripts/insert-universal-competencies.sql

# 插入评估题目（49 题）
mysql -u root competency_system < drizzle/seed-questions.sql

# 插入演示账户评估数据（3 账户 × 完整评估）
node scripts/seed-demo-data.cjs
```

### 启动

```bash
# 开发模式（热更新）
npm run dev

# 生产构建（单 bundle，兼容 QQ 浏览器）
npm run build:legacy

# 启动生产服务
NODE_ENV=production node dist/index.js
```

服务默认监听 `0.0.0.0:3000`。

## 演示账户

内置 3 个角色差异化演示账户，开箱即用：

| 用户名 | 密码 | 角色 | 能力画像 |
|--------|------|------|----------|
| `demo_ceo` | `demo123` | CEO（张总） | 战略 / 心态强，运营偏弱 · 均分 66 · 3 项已掌握 |
| `demo_cto` | `demo123` | CTO（李总） | 创新 / 运营强，营销偏弱 · 均分 59 · 1 项已掌握 |
| `demo_manager` | `demo123` | 运营总监（王经理） | 整体中等，财务短板 · 均分 54 · 0 项已掌握 |

> 演示数据由 `scripts/seed-demo-data.cjs` 生成，每个账户包含：userProfile + 评估会话 + 25 条答题 + 40 条能力评分。

## 项目结构

```
focus.college/
├── client/                  # 前端
│   ├── src/
│   │   ├── components/      # 通用组件（PageContainer、DashboardLayout、UI）
│   │   ├── pages/           # 20+ 页面
│   │   ├── hooks/           # 自定义 hooks
│   │   └── index.css        # 全局样式（Inter + oklch 色系）
│   └── index.html
├── server/                  # 后端
│   ├── _core/               # 核心模块（auth · cookies · llm · trpc · sdk）
│   ├── routers.ts           # tRPC 路由
│   ├── db.ts                # 数据库访问层
│   └── scoreCalculation.ts  # 评分计算
├── drizzle/                 # Schema 与 migration
│   └── schema.ts            # Drizzle ORM 表定义
├── scripts/
│   └── seed-demo-data.cjs   # 演示数据 seed 脚本
├── vite.config.ts           # Vite 配置（含 QQ 浏览器 shim）
└── .env                     # 环境变量（gitignored）
```

## 部署

### 局域网部署

```bash
npm run build:legacy
NODE_ENV=production node dist/index.js &
# 局域网访问: http://<server-ip>:3000
```

详细部署指南见 [`DEPLOYMENT_LAN_GUIDE.md`](./DEPLOYMENT_LAN_GUIDE.md)。

### 注意事项

- **Cookie 安全**: http 环境下 `sameSite` 自动降级为 `lax`，https 下使用 `none + secure`
- **QQ 浏览器兼容**: `vite.config.ts` 含 `qq-browser-shim` 插件，将 `<script type="module">` 转为动态 `import()`，单 bundle 输出

## 贡献指南

欢迎参与贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解开发规范和提交流程。

- 发现 bug？[提交 Issue](https://github.com/callaaron/focus.college/issues/new?labels=bug&template=bug_report.md)
- 有想法？[提交功能建议](https://github.com/callaaron/focus.college/issues/new?labels=enhancement&template=feature_request.md)
- 想贡献代码？Fork → 创建分支 → 提交 PR

## License

[MIT](./LICENSE) © 2024 [Aaron](https://github.com/callaaron)

---

<div align="center">

如果这个项目对你有帮助，请点个 **Star** ⭐ 支持一下！

</div>
