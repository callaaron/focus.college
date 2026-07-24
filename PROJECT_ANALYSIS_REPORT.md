# 创业进化系统 — 全面开发文档与需求梳理报告

> 生成时间：2026-07-25  
> 分析方法：代码库全量扫描（routers.ts / db.ts / 前端页面 / schema）+ Agent Teams 多维度产品评估

---

## 一、项目分析：整体架构与功能模块

### 1.1 系统定位

创业进化系统（focus.college）是一个面向创业者和管理者的能力评估与成长平台，核心价值主张：**通过结构化问卷 + AI 分析 + 多维评分模型，识别能力短板、规划学习路径、追踪成长轨迹**。

### 1.2 技术架构

| 层级 | 技术选型 |
|------|----------|
| 前端 | React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + wouter + Radix UI + Recharts |
| 后端 | Express + tRPC + Drizzle ORM + MySQL 9 + superjson |
| AI | DeepSeek v4-pro（13 处调用，含 thinking.enabled + reasoning_effort:high） |
| 认证 | JWT（jose）+ bcryptjs + httpOnly cookie |

### 1.3 双轨架构问题（关键发现）

项目存在 **MySQL 版** 和 **D1/Cloudflare 版** 两套后端，严重脱节：

| 维度 | MySQL 版（routers.ts, 4395行） | D1 版（routers-d1.ts, 2038行） |
|------|------|------|
| 功能完成度 | ~80% 可用 | ~15% 可用，大量 TODO |
| AI 集成 | 13 处真实 DeepSeek 调用 | 0 处，全部硬编码假数据 |
| 挑战系统 | 有题库但 schema 有 bug | 全部空壳，返回"开发中" |
| 成就系统 | 解锁逻辑空壳 | 硬编码 5 条假成就 |

> **客户端 TypeScript 类型导入的是 `routers-d1.ts`，但本地运行的是 `routers.ts`** — 导致类型与实际运行不匹配。

### 1.4 功能模块清单（24 个路由模块，~100 个 tRPC 过程）

| 模块 | 过程数 | 实现状态 | 数据状态 |
|------|--------|----------|----------|
| 用户认证（auth） | 5 | 完整 | 有 seed |
| 用户画像（profile） | 4 | 完整 | 有 seed |
| 能力评估（assessment） | 15 | ⚠️ 结果页 404 | 有 49 题 seed |
| 能力看板（competencies） | 11 | ⚠️ 行业对比硬编码 | 有 40 能力 seed |
| 场景分析（scenarios） | 3 | 完整（MySQL） | 无 seed |
| AI 文档分析（analysis） | 1 | 完整 | - |
| 学习路径（learning + learningPaths） | 10 | ⚠️ 资源表空 | **无资源 seed** |
| 挑战系统（challenges） | 5 | ❌ schema bug | 有 30 题 seed |
| 成就系统（achievements） | 3 | ❌ 解锁逻辑空壳 | **无成就 seed** |
| 企业评估（organization + organizationAssessment） | ~25 | ⚠️ 多个空壳 | 无 seed |
| 成长报告（report） | 1 | ⚠️ improvement 硬编码 | - |
| Wiki 知识库（wiki） | 5 | 完整但无数据 | **无数据** |
| 管理后台（admin + questions） | ~15 | ⚠️ admin CRUD 死代码 | - |
| 行业/职位（industry/position） | ~7 | 完整 | 有 seed |
| 反馈（feedback） | 2 | ❌ 字段不匹配 | - |

---

## 二、功能评估

### 2.1 核心功能清单（当前系统应具备的）

基于设计文档（COMPETENCY_SYSTEM_DESIGN.md）和实际代码，系统设计了以下核心功能链：

```
用户注册 → 完善画像 → 能力评估(问卷) → 能力看板(雷达图)
                                    ↓
                        缺口分析(短板识别) → 学习路径(AI推荐)
                                    ↓
                        场景挑战 → 成就解锁 → 成长报告
                                    ↓
                        企业评估 → 团队能力看板 → 招聘/培训建议
```

**实际可用的核心功能**（MySQL 环境下）：

1. ✅ 用户认证与画像管理
2. ✅ 能力问卷评估（49 题，8 域 40 能力）
3. ✅ 能力看板雷达图展示
4. ✅ AI 文档分析（上传文档→DeepSeek 多维度评估）
5. ✅ 场景分析（描述管理问题→DeepSeek 诊断+建议）
6. ✅ 缺口分析（短板识别+优先级排序）
7. ⚠️ 学习路径生成（AI 可生成，但学习资源表无初始数据）
8. ⚠️ 企业四维度评估（可填写保存，但 AI 分析不持久化）
9. ❌ 挑战系统（有题库但答题时 schema 报错）
10. ❌ 成就系统（无数据+解锁逻辑空壳+前端 Mock）

### 2.2 冗余或无实际价值的功能

| 功能 | 冗余原因 | 建议 |
|------|----------|------|
| **D1/Cloudflare 双轨架构** | routers-d1.ts 90% 是 TODO，维护成本翻倍 | **立即砍掉 D1 线**，专注 MySQL |
| **Wiki 知识库** | 有完整 CRUD 但无任何数据，无前端入口价值 | 砍掉，或改为"行业案例库" |
| **更新日志表（changelogs）** | 全代码库无任何引用，完全死表 | 删除 |
| **挑战成就表（challengeAchievements / userChallengeAchievements）** | schema 定义了但无任何代码引用 | 删除 |
| **演示数据表（demoAccounts / demoAccountAnalytics）** | 380 行代码维护演示账号，应改为 seed 脚本 | 重构为 seed |
| **行业对比 mock 数据** | routers.ts 中硬编码的"行业平均"，且能力域名与实际不匹配 | 要么做真实统计，要么显式标注"参考值" |
| **成就系统（当前状态）** | 后端空壳+前端 Mock，半成品比没有更糟 | 补齐或下线 |

### 2.3 功能断裂与未打通问题

这是最核心的发现——**"评估→学习→实践→再评估"的进化闭环在代码层面是断的**：

#### 断裂点 1：能力模型三套并存（最严重）

| 来源 | 能力域 | 能力数 | 用途 |
|------|--------|--------|------|
| SQL seed（insert-competency-domains.sql） | 战略规划/产品创新/市场营销/团队管理/运营管理/财务融资/技术研发/领导力 | 40 | DB 中的实际数据 |
| competencyData.ts（前端） | 战略规划/创新变革/决策思维/业务执行/沟通协作/自我管理/团队管理/人才发展 | 35 | 行业对比+雷达图渲染 |
| 设计文档（COMPETENCY_SYSTEM_DESIGN.md） | 战略规划/产品创新/市场营销/团队管理/运营管理/财务融资/技术研发/领导力 | 40 | 原始设计意图 |

> **用户看到的雷达图用的是 competencyData.ts 的 8 域，但能力评分来自 DB 的 40 能力** — 两个坐标系不一致，对比结果无意义。

#### 断裂点 2：学习资源表空 → 学习路径永远为空

```
缺口分析 → generateLearningPathFromGaps() → 查询 learningResources 表 → 表是空的 → 返回 null
```

`learningResources` 表无 seed 脚本，唯一填充途径是 AI 动态生成（`learning.generatePath`），但用户必须先手动触发。**首次使用的用户在学习路径页只会看到"暂无学习路径"**。

#### 断裂点 3：挑战完成 ≠ 能力分变化

挑战系统的积分（`userPoints`）和能力评分（`competencyScores`）是两套独立体系，**做挑战不会提升能力分**，违反了"实践→进化"的产品逻辑。

#### 断裂点 4：证据上传 ≠ 评分计算

`assessments.uploadEvidence` 上传文档后 AI 评估了能力掌握程度，但结果**不写入 competencyScores 表**，也不参与加权计算。证据源在 `scoreCalculation.ts` 中根本不存在（只有 3 源：问卷 40% + AI 35% + 自评 25%）。

#### 断裂点 5：企业 AI 分析不持久化

`organization.analyzeCapability` 调用 DeepSeek 分析后，`db.updateOrganizationAnalysis()` 是空函数体 — **AI 分析结果不存库**，刷新页面后丢失。

#### 断裂点 6：5 个企业高级功能完全空壳

```
getCompanyCapabilityAnalytics()    → return null
getCompanyMembersCapabilityComparison() → return []
getCompanyCapabilityTrends()       → return []
upsertCapabilityGoal()             → return 1（不写库）
getLatestCapabilityGapAnalysis()   → return null
```

这 5 个函数是企业版的核心价值主张 — 成员对比、趋势追踪、目标设定 — 全部空壳。

#### 断裂点 7：前端调用不存在的 API

| 页面 | 调用的 API | 状态 |
|------|-----------|------|
| `GapAnalysis.tsx` | `user.getProfile` | routers.ts 无 `user` 路由 |
| `GapAnalysis.tsx` | `competencies.getUserCompetencies`（复数） | 只有 `getUserCompetency`（单数） |
| `AssessmentResults.tsx` | `assessment.getResults` | routers.ts 中不存在 |
| `Achievements.tsx` | `achievements.getUserAchievements` | 后端返回空数组，前端用 Mock 兜底 |

#### 断裂点 8：Schema 字段不匹配（运行时 SQL 错误）

| 表 | 代码使用的字段 | Schema 实际字段 |
|------|--------------|----------------|
| competencyScores | selfAssessed / aiAssessed / currentLevel / score | selfAssessmentScore / aiAnalysisScore / level / finalScore |
| userChallenges | attemptNumber | 不存在 |
| feedbacks | description / contact | content（无 contact） |
| assessmentSessions | sessionType: "validation" | enum 只有 initial/regular/position |

---

## 三、评估维度验证

### 3.1 能否帮助企业家实现个人能力持续进化？

**结论：当前不能。系统是"一次性测试工具"，不是"持续进化工具"。**

| 进化闭环环节 | 实现状态 | 问题 |
|-------------|----------|------|
| 评估（测什么） | ⚠️ 三套模型并存 | 连"评的是什么"都没统一 |
| 识别短板（差在哪） | ⚠️ 行业基准是假的 | 硬编码 mock，且坐标系不一致 |
| 学习路径（怎么补） | ❌ 资源表空 | 首次使用永远看到"暂无路径" |
| 实践（做什么） | ❌ 挑战≠能力分 | 挑战积分和能力分不挂钩 |
| 再评估（变强了吗） | ❌ 无重测机制 | 无自动快照、无周期提醒、无成长对比 |

**评分模型问题**：
- `scoreCalculation.ts` 实际是 3 源（问卷 40% + AI 35% + 自评 25%），**证据源未进入计算**
- 49 题覆盖 40 能力，平均每能力 1.2 题，心理测量学信度不足（α < 0.5）
- 5 选项对应 L1-L5，是典型"社会赞许性陷阱"— 聪明人都会选 option5

**权重设计逻辑反了**：
- 当前：问卷 40%（最容易"装"）> AI 30% > 自评 25% > 证据 0%（最硬但不算分）
- 应该：证据 40% > AI 30% > 自评 20% > 问卷 10%（把问卷当门槛，把证据当定级）

### 3.2 能否帮助管理层了解企业团队能力现状与短板？

**结论：当前不能。企业版是"个人版的多人版本"，没有切中管理决策场景。**

| 管理层需求 | 当前实现 | 差距 |
|-----------|----------|------|
| 看到公司四维度自评分 | ✅ 可填写保存 | 但纯自评无交叉验证，CEO 可自评全 90 分 |
| 看到员工个人能力评分 | ✅ 如果员工也注册 | 但无聚合视图 |
| 成员能力对比 | ❌ 空壳 | `getCompanyMembersCapabilityComparison` 返回 [] |
| 能力趋势追踪 | ❌ 空壳 | `getCompanyCapabilityTrends` 返回 [] |
| 能力目标设定 | ❌ 空壳 | `upsertCapabilityGoal` 不写库 |
| 关键岗位继任准备度 | ❌ 不存在 | - |
| 招聘画像支持 | ❌ 不存在 | - |
| 培训 ROI 追踪 | ❌ 不存在 | - |
| AI 分析结果持久化 | ❌ 空函数 | 分析后刷新即丢失 |

**核心缺失**：系统没有"管理者愿意为它付费"的瞬间。当前企业版更像是把个人测评叠加了一个公司维度，没有解决管理决策问题。

---

## 四、优化建议

### 4.1 战略层：产品定义收敛（最重要）

**当前问题**：试图同时做测评工具 + 学习平台 + 企业管理 SaaS，每件都只做到 30%。

**建议方向**：聚焦一个主战场。推荐路径：

> **"创业团队的能力体检 + 招聘画像"** — 用能力数据指导招聘决策，刚需、可付费、数据飞轮清晰。

### 4.2 如果只做 3 件事（按优先级）

#### 第 1 件：统一能力模型 + 修通评估闭环（2-3 周）

- 选定一套能力模型（建议基于 competencyData.ts 的 35 能力，因为有 L1-L5 行为锚定）
- 删除 SQL seed 里另一套域，迁移已有数据
- 把 scoreCalculation.ts 改成 4 源（补回证据源），权重改为 证据 40% / AI 30% / 自评 20% / 问卷 10%
- 给 learningResources 表灌入至少 100 条真实资源（每能力 3 条：1 文章 + 1 视频 + 1 实战任务）

> **理由**：地基不修，上面盖什么都塌。当前连"评的是什么"都不统一。

#### 第 2 件：把"一次性测试"改造成"持续进化"（4-6 周）

- 加 `capabilitySnapshot` 自动写入（每月触发，基于周期内的新证据/挑战/场景分析）
- 把挑战完成、证据上传、场景分析都接上"能力分微调"（+1/-1 分）
- 加周期性重评提醒（90 天后重测，对比上次出"成长报告"）
- 学习路径页强制可见资源

> **核心 KPI**：不是 DAU，是"月活用户的能力分中位数变化"。

#### 第 3 件：企业版做"团队差距看板"（3-4 周）

不做全套，只做一个管理层真正会用的功能：

- **输入**：公司战略目标（选 3 个关键能力，设定目标分）
- **输出**：团队成员在这 3 项上的现状分布 + 差距热力图 + 招聘建议
- **实现**：把 `getCompanyMembersCapabilityComparison` 真正实现

> **判断标准**：如果 CEO 不会在周会上打开这个看板说"我们团队这周在 X 能力上跌了，要补"，就没做对。

### 4.3 技术层：立即修复的 P0 问题

| # | 问题 | 影响 | 修复方案 |
|---|------|------|----------|
| P0-1 | 三套能力模型并存 | 雷达图坐标系不一致 | 统一为一套，迁移数据 |
| P0-2 | GapAnalysis.tsx 调用不存在的 API | 页面崩溃 | 修复 API 调用或添加路由别名 |
| P0-3 | AssessmentResults.tsx 调用不存在的 `assessment.getResults` | 结果页 404 | 在 routers.ts 中实现该过程 |
| P0-4 | userChallenges 表缺 `attemptNumber` 字段 | 挑战答题 SQL 报错 | ALTER TABLE 加字段 |
| P0-5 | competencyScores 字段名不匹配 | 能力评分写入丢字段 | 统一字段名 |
| P0-6 | 客户端类型导入 routers-d1.ts | 类型与运行时不匹配 | 改为导入 routers.ts |
| P0-7 | admin 路由重复定义 | industries/positions CRUD 成死代码 | 删除重复定义 |

### 4.4 架构层：砍掉的技术债

| 项目 | 理由 | 动作 |
|------|------|------|
| D1/Cloudflare 双轨架构 | 90% TODO，维护成本翻倍 | **立即砍掉**，专注 MySQL |
| Wiki 功能 | 无数据、无入口价值 | 砍掉或改为案例库 |
| changlogs / challengeAchievements / userChallengeAchievements 表 | 完全死表 | 删除 |
| 行业对比 mock 数据 | 假数据损害信任 | 标注"参考值"或做真实统计 |
| 成就系统（当前状态） | 半成品比没有更糟 | 补齐后端或下线页面 |

### 4.5 产品层：从"测了就完了"到"持续进化"

| 机制 | 说明 | 优先级 |
|------|------|--------|
| 行为采样 | 用户做任何动作（答题/上传证据/做挑战）都触发能力分微调 | 高 |
| 证据为主 | 把 uploadEvidence 接入加权计算，证据是能力分提升主要通道 | 高 |
| AI 教练 | 每周 AI 主动给用户一段"本周你的 X 能力因为 Y 行为提升了 Z 分" | 中 |
| 季度重测 | 问卷每 90 天重测，对比上次出成长报告 | 中 |
| 能力徽章 | L4 以上生成可分享的能力徽章（LinkedIn / 朋友圈） | 低 |
| 导师匹配 | 按能力短板匹配擅长该领域的导师/教练 | 高（但运营重）|
| 同伴 cohort | 同期创业者互助小组 | 中 |

---

## 五、总结

### 一句话诊断

> **focus.college 当前不是一个"创业进化系统"，是一个"创业者能力测评工具 + 一堆半成品"。**

### 核心问题

不是"哪些功能是空壳"，而是**产品定义模糊** + **能力模型地基断裂**：

1. **三套能力模型并存** — 连"评的是什么"都没统一
2. **进化闭环断裂** — 评估→学习→实践→再评估的链条在代码层面是断的
3. **企业版无付费瞬间** — 5 个核心函数空壳，管理层没有"愿意为它付费"的功能
4. **双轨架构技术债** — D1 版 90% TODO，每天维护成本翻倍

### 行动建议

```
本周：统一能力模型（选定一套，迁移数据）
2 周：修通评估闭环（补学习资源 seed + 修复 7 个 P0 bug）
4 周：改造为持续进化工具（行为采样 + 能力分动态变化 + 季度重测）
6 周：企业版团队差距看板（一个管理层真正会用的功能）
```

> **先把能力模型统一了，再谈其他优化。地基不修，楼盖越高塌得越快。**
