# 能力体系深度关联设计方案

## 📋 目录
1. [现状分析](#现状分析)
2. [能力分层体系](#能力分层体系)
3. [关联逻辑设计](#关联逻辑设计)
4. [数据库设计](#数据库设计)
5. [实现方案](#实现方案)

---

## 现状分析

### 已有数据结构
```
competencyDomains (能力域)
    ↓
competencies (能力项)
    ↓
competencyScores (个人评分)

industries (行业)
industryCompetencies (行业-能力关联)

positions (岗位)
positionCompetencies (岗位-能力关联)
```

### 现有问题
1. ❌ 能力数据为空，无法使用
2. ❌ 缺少能力分层（通用/专用）
3. ❌ 行业-能力关联为空
4. ❌ 岗位-能力关联为空
5. ❌ 缺少能力推荐逻辑

---

## 能力分层体系

### 三层能力模型

```
┌─────────────────────────────────────────────┐
│            第一层：通用能力                   │
│     (Universal Competencies)                │
│  所有创业者都需要的基础能力                   │
│  - 战略思维、团队管理、沟通协作等             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            第二层：行业能力                   │
│     (Industry-Specific Competencies)        │
│  特定行业需要的专业能力                       │
│  - 互联网：产品设计、用户增长                 │
│  - 金融科技：风险控制、合规管理               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            第三层：岗位能力                   │
│     (Position-Specific Competencies)        │
│  特定岗位需要的专项能力                       │
│  - CEO：融资能力、战略决策                    │
│  - CTO：技术架构、团队建设                    │
└─────────────────────────────────────────────┘
```

### 能力域设计（8大模块）

| 能力域 | 代码 | 说明 | 包含能力数 |
|--------|------|------|-----------|
| 战略规划 | strategy | 商业模式、战略规划、市场定位 | 5 |
| 产品创新 | product | 产品设计、用户研究、迭代管理 | 5 |
| 市场营销 | marketing | 品牌建设、市场推广、用户增长 | 5 |
| 团队管理 | team | 人才招聘、团队建设、文化塑造 | 5 |
| 运营管理 | operations | 流程优化、数据分析、质量管理 | 5 |
| 财务融资 | finance | 财务管理、融资能力、成本控制 | 5 |
| 技术研发 | technology | 技术架构、技术选型、研发管理 | 5 |
| 领导力 | leadership | 决策能力、影响力、变革管理 | 5 |

**总计**: 40个通用能力

---

## 关联逻辑设计

### 1. 个人能力评估流程

```
用户信息
  ├── 行业类型 (互联网/金融/教育...)
  ├── 岗位角色 (CEO/CTO/产品经理...)
  └── 公司阶段 (种子轮/A轮/成熟期...)
          ↓
     能力推荐引擎
          ↓
  ┌────────┬────────┬────────┐
  ↓        ↓        ↓        ↓
通用能力  行业能力  岗位能力  阶段能力
(必评)   (推荐)   (推荐)   (推荐)
  ↓        ↓        ↓        ↓
      个人能力评分矩阵
          ↓
      差距分析 & 学习路径
```

### 2. 能力重要性权重

#### 通用能力（所有人都需要）
```
isCore = true
importance = 5 (必须评估)
weight = 1.0 (标准权重)
```

#### 行业能力（基于用户行业）
```
isCore = false
importance = 4-5 (强烈推荐)
weight = 0.8-1.0 (根据行业匹配度)
```

#### 岗位能力（基于用户岗位）
```
isCore = false
importance = 3-5 (推荐)
weight = 0.6-1.0 (根据岗位匹配度)
```

### 3. 能力推荐算法

```typescript
function recommendCompetencies(user: User): Competency[] {
  // 第一步：获取所有通用能力（必选）
  const universalCompetencies = getCompetencies({ isCore: true });
  
  // 第二步：获取行业相关能力
  const industryCompetencies = getIndustryCompetencies(user.industry);
  
  // 第三步：获取岗位相关能力
  const positionCompetencies = getPositionCompetencies(user.position);
  
  // 第四步：去重合并
  const allCompetencies = deduplicateAndMerge([
    universalCompetencies,
    industryCompetencies,
    positionCompetencies
  ]);
  
  // 第五步：按重要性排序
  return sortByImportance(allCompetencies);
}
```

### 4. 差距分析逻辑

```typescript
function analyzeGap(user: User): GapAnalysis {
  // 获取用户当前能力评分
  const currentScores = getUserCompetencyScores(user.id);
  
  // 获取岗位能力要求
  const requirements = getPositionRequirements(user.position);
  
  // 计算差距
  const gaps = requirements.map(req => ({
    competency: req.competency,
    current: currentScores[req.competencyId] || 0,
    required: req.requiredLevel * 20, // 转换为0-100分
    gap: (req.requiredLevel * 20) - (currentScores[req.competencyId] || 0),
    importance: req.importance,
    priority: calculatePriority(req, currentScores)
  }));
  
  // 按优先级排序
  return gaps.sort((a, b) => b.priority - a.priority);
}
```

---

## 数据库设计

### 1. 能力表增强 (competencies)

```sql
ALTER TABLE competencies 
ADD COLUMN competencyType ENUM('universal', 'industry', 'position', 'stage') 
DEFAULT 'universal' 
COMMENT '能力类型：通用/行业/岗位/阶段';

ADD COLUMN applicableStages TEXT 
COMMENT '适用阶段JSON：["seed","angel","series_a"]';

ADD COLUMN tags TEXT 
COMMENT '能力标签JSON：["技术类","管理类"]';
```

### 2. 行业-能力关联表 (industryCompetencies)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | INT | 主键 | 1 |
| industryId | INT | 行业ID | 1 (互联网) |
| competencyId | INT | 能力ID | 15 (用户增长) |
| importance | INT | 重要性1-5 | 5 (必需) |
| description | TEXT | 行业特定说明 | "互联网行业需要..." |

### 3. 岗位-能力关联表 (positionCompetencies)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | INT | 主键 | 1 |
| positionId | INT | 岗位ID | 1 (CEO) |
| competencyId | INT | 能力ID | 1 (战略规划) |
| importance | INT | 重要性1-5 | 5 (必需) |
| requiredLevel | INT | 要求等级1-5 | 4 (熟练) |
| description | TEXT | 岗位特定说明 | "CEO需要..." |

---

## 实现方案

### Phase 1: 基础数据准备

#### 1.1 创建8大能力域
```sql
INSERT INTO competencyDomains (name, code, description, sortOrder)
VALUES
('战略规划', 'strategy', '商业模式、战略规划、市场定位', 1),
('产品创新', 'product', '产品设计、用户研究、迭代管理', 2),
('市场营销', 'marketing', '品牌建设、市场推广、用户增长', 3),
('团队管理', 'team', '人才招聘、团队建设、文化塑造', 4),
('运营管理', 'operations', '流程优化、数据分析、质量管理', 5),
('财务融资', 'finance', '财务管理、融资能力、成本控制', 6),
('技术研发', 'technology', '技术架构、技术选型、研发管理', 7),
('领导力', 'leadership', '决策能力、影响力、变革管理', 8);
```

#### 1.2 创建40个通用能力
每个能力域5个核心能力

#### 1.3 创建岗位数据
```sql
-- CEO、CTO、CPO、COO、CFO、CMO等
INSERT INTO positions ...
```

#### 1.4 建立关联关系
- 21个行业 × 平均8个关键能力 = ~170条关联
- 10个岗位 × 平均12个关键能力 = ~120条关联

### Phase 2: 能力推荐引擎

#### 2.1 后端API实现
```typescript
// server/routers.ts
competency: router({
  // 获取推荐能力列表
  getRecommended: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const profile = await getUserProfile(user.id);
    
    // 获取通用能力
    const universal = await getUniversalCompetencies();
    
    // 获取行业能力
    const industry = await getIndustryCompetencies(profile.industryId);
    
    // 获取岗位能力
    const position = await getPositionCompetencies(profile.positionId);
    
    return mergeAndRank({ universal, industry, position });
  }),
  
  // 获取能力要求（用于差距分析）
  getRequirements: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getUserProfile(ctx.user.id);
    return getPositionRequirements(profile.positionId);
  }),
});
```

#### 2.2 前端展示优化
```typescript
// 能力分类展示
<Tabs>
  <Tab label="通用能力 (40)" />
  <Tab label="行业能力 (8)" />
  <Tab label="岗位能力 (12)" />
</Tabs>

// 能力卡片带标签
<CompetencyCard>
  <Badge>通用</Badge>
  <Badge>必需</Badge>
  <Badge>CEO核心</Badge>
</CompetencyCard>
```

### Phase 3: 差距分析增强

#### 3.1 多维度差距
```typescript
{
  overallGap: 25,  // 总体差距
  gaps: [
    {
      category: "通用能力",
      avgGap: 15,
      competencies: [...]
    },
    {
      category: "行业能力",
      avgGap: 30,
      competencies: [...]
    },
    {
      category: "岗位能力",
      avgGap: 35,
      competencies: [...]
    }
  ]
}
```

#### 3.2 优先级计算
```typescript
priority = (gap * importance * weight) / 100

where:
  gap: 差距分数 (0-100)
  importance: 重要性 (1-5)
  weight: 权重因子
    - 通用能力: 1.0
    - 行业能力: 0.8-1.0 (根据匹配度)
    - 岗位能力: 0.6-1.0 (根据匹配度)
```

### Phase 4: 学习路径优化

#### 4.1 分层学习路径
```
基础层（通用能力）
  ↓ 先掌握基础
行业层（行业能力）
  ↓ 理解行业特点
岗位层（岗位能力）
  ↓ 精通岗位技能
高级层（进阶能力）
```

#### 4.2 路径生成逻辑
```typescript
function generateLearningPath(gaps: Gap[]): LearningPath {
  // 第一步：筛选高优先级差距
  const priorityGaps = gaps.filter(g => g.priority >= threshold);
  
  // 第二步：按能力类型分组
  const grouped = groupBy(priorityGaps, 'competencyType');
  
  // 第三步：设计学习顺序
  return {
    phase1: grouped.universal,  // 先学通用
    phase2: grouped.industry,   // 再学行业
    phase3: grouped.position,   // 最后学岗位
  };
}
```

---

## 数据示例

### 示例1: 互联网行业CEO的能力要求

#### 通用能力 (必需)
1. ✅ 战略规划能力 (重要性: 5)
2. ✅ 团队管理能力 (重要性: 5)
3. ✅ 决策能力 (重要性: 5)
4. ✅ 融资能力 (重要性: 4)
5. ✅ 沟通能力 (重要性: 4)

#### 行业能力 (互联网)
1. 📱 用户增长能力 (重要性: 5)
2. 📱 产品思维 (重要性: 5)
3. 📱 数据驱动决策 (重要性: 4)
4. 📱 快速迭代能力 (重要性: 4)

#### 岗位能力 (CEO)
1. 👔 愿景设定能力 (要求等级: 4, 重要性: 5)
2. 👔 融资谈判能力 (要求等级: 4, 重要性: 5)
3. 👔 公关能力 (要求等级: 3, 重要性: 4)
4. 👔 跨部门协调 (要求等级: 4, 重要性: 4)

**总计**: 13个关键能力需要评估

### 示例2: 金融科技行业CTO的能力要求

#### 通用能力 (必需)
1. ✅ 技术架构能力 (重要性: 5)
2. ✅ 团队管理能力 (重要性: 5)
3. ✅ 战略思维 (重要性: 4)

#### 行业能力 (金融科技)
1. 💰 风险控制能力 (重要性: 5)
2. 💰 合规理解能力 (重要性: 5)
3. 💰 安全架构能力 (重要性: 5)
4. 💰 金融业务理解 (重要性: 4)

#### 岗位能力 (CTO)
1. 💻 技术选型能力 (要求等级: 5, 重要性: 5)
2. 💻 系统设计能力 (要求等级: 5, 重要性: 5)
3. 💻 技术团队建设 (要求等级: 4, 重要性: 5)
4. 💻 研发流程管理 (要求等级: 4, 重要性: 4)

**总计**: 11个关键能力需要评估

---

## 实施时间表

### Week 1: 数据准备
- [ ] Day 1-2: 创建能力域和通用能力
- [ ] Day 3-4: 创建岗位数据
- [ ] Day 5: 建立行业-能力关联
- [ ] Day 6-7: 建立岗位-能力关联

### Week 2: 后端开发
- [ ] Day 1-2: 实现能力推荐API
- [ ] Day 3-4: 实现差距分析增强
- [ ] Day 5-6: 实现学习路径优化
- [ ] Day 7: 测试和调试

### Week 3: 前端开发
- [ ] Day 1-2: 能力分类展示
- [ ] Day 3-4: 差距分析页面优化
- [ ] Day 5-6: 学习路径页面优化
- [ ] Day 7: 整体测试

---

## 预期效果

### 用户体验提升
1. ✅ 个性化能力推荐（基于行业+岗位）
2. ✅ 更精准的差距分析
3. ✅ 更科学的学习路径
4. ✅ 清晰的能力分层展示

### 系统价值提升
1. 📊 能力评估更全面
2. 🎯 推荐更精准
3. 📈 用户留存率提升
4. 💡 商业价值更明显

---

## 技术债务

### 需要解决的问题
1. ⚠️ 能力数据需要持续维护
2. ⚠️ 行业能力需要行业专家审核
3. ⚠️ 岗位要求需要定期更新
4. ⚠️ 算法需要根据反馈优化

### 后续优化方向
1. 🔮 AI自动生成能力要求
2. 🔮 用户行为数据反馈优化
3. 🔮 行业基准数据对比
4. 🔮 能力成长轨迹预测

---

**设计方案 v1.0 - 2025-11-22**
