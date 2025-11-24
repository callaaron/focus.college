/**
 * Seed script to populate position-competency relationships
 * 
 * This script establishes relationships between positions and competencies,
 * defining which competencies are required for each position with required levels (1-5) and importance (1-5).
 * 
 * Run with: npx tsx scripts/seed-position-competencies.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { positionCompetencies } from "../drizzle/schema";

/**
 * Position-Competency Relationship Data
 * 
 * Format: { positionId, competencyId, requiredLevel, importance, description }
 * - positionId: ID from positions table (1-12)
 * - competencyId: ID from competencies table (1-40)
 * - requiredLevel: 1-5 (5 = expert, 4 = advanced, 3 = intermediate, 2 = basic, 1 = awareness)
 * - importance: 1-5 (5 = critical, 4 = very important, 3 = important, 2 = useful, 1 = nice to have)
 * - description: Position-specific context for this competency
 */
const relationshipsData = [
  // 1. CEO/创始人 (Position ID: 1) - 12 competencies
  { positionId: 1, competencyId: 1, requiredLevel: 5, importance: 5, description: 'CEO必须设计和优化商业模式' },  // 商业模式设计
  { positionId: 1, competencyId: 3, requiredLevel: 5, importance: 5, description: 'CEO负责制定公司战略方向' },  // 战略规划
  { positionId: 1, competencyId: 35, requiredLevel: 5, importance: 5, description: 'CEO做出所有关键决策' },  // 战略决策
  { positionId: 1, competencyId: 26, requiredLevel: 5, importance: 5, description: 'CEO负责融资和投资人关系' },  // 融资能力
  { positionId: 1, competencyId: 2, requiredLevel: 4, importance: 4, description: 'CEO需要深入理解市场' },  // 市场分析
  { positionId: 1, competencyId: 40, requiredLevel: 4, importance: 4, description: 'CEO影响团队和利益相关方' },  // 影响力
  { positionId: 1, competencyId: 36, requiredLevel: 4, importance: 4, description: 'CEO向团队传达愿景' },  // 沟通表达
  { positionId: 1, competencyId: 16, requiredLevel: 4, importance: 4, description: 'CEO吸引核心创始团队' },  // 人才招聘
  { positionId: 1, competencyId: 19, requiredLevel: 3, importance: 3, description: 'CEO塑造组织文化' },  // 组织文化
  { positionId: 1, competencyId: 28, requiredLevel: 3, importance: 3, description: 'CEO监控财务健康' },  // 财务分析
  { positionId: 1, competencyId: 37, requiredLevel: 4, importance: 3, description: 'CEO承受高压和不确定性' },  // 抗压能力
  { positionId: 1, competencyId: 39, requiredLevel: 4, importance: 3, description: 'CEO快速学习和适应' },  // 学习能力

  // 2. CTO/技术负责人 (Position ID: 2) - 12 competencies
  { positionId: 2, competencyId: 32, requiredLevel: 5, importance: 5, description: 'CTO设计系统架构' },  // 技术架构
  { positionId: 2, competencyId: 31, requiredLevel: 5, importance: 5, description: 'CTO管理研发团队' },  // 研发管理
  { positionId: 2, competencyId: 30, requiredLevel: 5, importance: 5, description: 'CTO负责技术选型' },  // 技术选型
  { positionId: 2, competencyId: 33, requiredLevel: 4, importance: 4, description: 'CTO推动技术创新' },  // 技术创新
  { positionId: 2, competencyId: 34, requiredLevel: 4, importance: 4, description: 'CTO管理技术债务' },  // 技术债务管理
  { positionId: 2, competencyId: 16, requiredLevel: 4, importance: 4, description: 'CTO招聘技术人才' },  // 人才招聘
  { positionId: 2, competencyId: 22, requiredLevel: 4, importance: 3, description: 'CTO管理技术项目' },  // 项目管理
  { positionId: 2, competencyId: 23, requiredLevel: 4, importance: 3, description: 'CTO确保代码质量' },  // 质量管控
  { positionId: 2, competencyId: 17, requiredLevel: 3, importance: 3, description: 'CTO激励技术团队' },  // 团队激励
  { positionId: 2, competencyId: 36, requiredLevel: 3, importance: 3, description: 'CTO与业务团队沟通' },  // 沟通表达
  { positionId: 2, competencyId: 39, requiredLevel: 4, importance: 3, description: 'CTO学习新技术' },  // 学习能力
  { positionId: 2, competencyId: 3, requiredLevel: 3, importance: 2, description: 'CTO参与技术战略' },  // 战略规划

  // 3. CPO/产品负责人 (Position ID: 3) - 12 competencies
  { positionId: 3, competencyId: 6, requiredLevel: 5, importance: 5, description: 'CPO深度理解用户需求' },  // 需求分析
  { positionId: 3, competencyId: 7, requiredLevel: 5, importance: 5, description: 'CPO设计产品方案' },  // 产品设计
  { positionId: 3, competencyId: 8, requiredLevel: 5, importance: 5, description: 'CPO推动产品迭代' },  // 产品迭代
  { positionId: 3, competencyId: 9, requiredLevel: 5, importance: 4, description: 'CPO提升用户体验' },  // 用户体验
  { positionId: 3, competencyId: 10, requiredLevel: 4, importance: 4, description: 'CPO创新产品方向' },  // 创新思维
  { positionId: 3, competencyId: 14, requiredLevel: 4, importance: 4, description: 'CPO分析产品数据' },  // 数据分析
  { positionId: 3, competencyId: 2, requiredLevel: 4, importance: 3, description: 'CPO分析产品市场' },  // 市场分析
  { positionId: 3, competencyId: 22, requiredLevel: 3, importance: 3, description: 'CPO管理产品项目' },  // 项目管理
  { positionId: 3, competencyId: 36, requiredLevel: 4, importance: 3, description: 'CPO与各方沟通需求' },  // 沟通表达
  { positionId: 3, competencyId: 3, requiredLevel: 3, importance: 3, description: 'CPO制定产品战略' },  // 战略规划
  { positionId: 3, competencyId: 16, requiredLevel: 3, importance: 2, description: 'CPO招聘产品团队' },  // 人才招聘
  { positionId: 3, competencyId: 39, requiredLevel: 4, importance: 2, description: 'CPO学习行业知识' },  // 学习能力

  // 4. COO/运营负责人 (Position ID: 4) - 12 competencies
  { positionId: 4, competencyId: 21, requiredLevel: 5, importance: 5, description: 'COO优化运营流程' },  // 流程优化
  { positionId: 4, competencyId: 25, requiredLevel: 5, importance: 5, description: 'COO分析运营数据' },  // 运营数据分析
  { positionId: 4, competencyId: 22, requiredLevel: 5, importance: 5, description: 'COO管理运营项目' },  // 项目管理
  { positionId: 4, competencyId: 23, requiredLevel: 4, importance: 4, description: 'COO确保运营质量' },  // 质量管控
  { positionId: 4, competencyId: 24, requiredLevel: 4, importance: 4, description: 'COO管理供应链' },  // 供应链管理
  { positionId: 4, competencyId: 27, requiredLevel: 4, importance: 4, description: 'COO控制运营成本' },  // 成本控制
  { positionId: 4, competencyId: 16, requiredLevel: 4, importance: 3, description: 'COO搭建运营团队' },  // 人才招聘
  { positionId: 4, competencyId: 17, requiredLevel: 3, importance: 3, description: 'COO激励运营团队' },  // 团队激励
  { positionId: 4, competencyId: 36, requiredLevel: 3, importance: 3, description: 'COO跨部门沟通协调' },  // 沟通表达
  { positionId: 4, competencyId: 3, requiredLevel: 3, importance: 3, description: 'COO制定运营战略' },  // 战略规划
  { positionId: 4, competencyId: 14, requiredLevel: 4, importance: 2, description: 'COO分析业务数据' },  // 数据分析
  { positionId: 4, competencyId: 35, requiredLevel: 3, importance: 2, description: 'COO做运营决策' },  // 战略决策

  // 5. CFO/财务负责人 (Position ID: 5) - 12 competencies
  { positionId: 5, competencyId: 25, requiredLevel: 5, importance: 5, description: 'CFO管理财务规划' },  // 财务规划
  { positionId: 5, competencyId: 28, requiredLevel: 5, importance: 5, description: 'CFO分析财务报表' },  // 财务分析
  { positionId: 5, competencyId: 27, requiredLevel: 5, importance: 5, description: 'CFO控制成本支出' },  // 成本控制
  { positionId: 5, competencyId: 26, requiredLevel: 5, importance: 5, description: 'CFO负责融资对接' },  // 融资能力
  { positionId: 5, competencyId: 29, requiredLevel: 4, importance: 4, description: 'CFO评估投资机会' },  // 投资决策
  { positionId: 5, competencyId: 3, requiredLevel: 4, importance: 4, description: 'CFO参与财务战略' },  // 战略规划
  { positionId: 5, competencyId: 23, requiredLevel: 4, importance: 3, description: 'CFO确保财务合规' },  // 质量管控
  { positionId: 5, competencyId: 22, requiredLevel: 3, importance: 3, description: 'CFO管理财务项目' },  // 项目管理
  { positionId: 5, competencyId: 36, requiredLevel: 4, importance: 3, description: 'CFO与投资人沟通' },  // 沟通表达
  { positionId: 5, competencyId: 14, requiredLevel: 4, importance: 2, description: 'CFO分析业务数据' },  // 数据分析
  { positionId: 5, competencyId: 35, requiredLevel: 3, importance: 2, description: 'CFO做财务决策' },  // 战略决策
  { positionId: 5, competencyId: 16, requiredLevel: 3, importance: 2, description: 'CFO招聘财务团队' },  // 人才招聘

  // 6. CMO/市场负责人 (Position ID: 6) - 12 competencies
  { positionId: 6, competencyId: 11, requiredLevel: 5, importance: 5, description: 'CMO建设品牌影响力' },  // 品牌建设
  { positionId: 6, competencyId: 12, requiredLevel: 5, importance: 5, description: 'CMO策划营销活动' },  // 营销策划
  { positionId: 6, competencyId: 15, requiredLevel: 5, importance: 5, description: 'CMO推动用户增长' },  // 用户增长
  { positionId: 6, competencyId: 13, requiredLevel: 5, importance: 4, description: 'CMO拓展营销渠道' },  // 渠道拓展
  { positionId: 6, competencyId: 14, requiredLevel: 4, importance: 4, description: 'CMO分析营销数据' },  // 数据分析
  { positionId: 6, competencyId: 2, requiredLevel: 4, importance: 4, description: 'CMO分析市场趋势' },  // 市场分析
  { positionId: 6, competencyId: 10, requiredLevel: 4, importance: 3, description: 'CMO创新营销方式' },  // 创新思维
  { positionId: 6, competencyId: 16, requiredLevel: 4, importance: 3, description: 'CMO搭建市场团队' },  // 人才招聘
  { positionId: 6, competencyId: 27, requiredLevel: 3, importance: 3, description: 'CMO控制营销成本' },  // 成本控制
  { positionId: 6, competencyId: 36, requiredLevel: 4, importance: 3, description: 'CMO对外传播品牌' },  // 沟通表达
  { positionId: 6, competencyId: 3, requiredLevel: 3, importance: 2, description: 'CMO制定市场战略' },  // 战略规划
  { positionId: 6, competencyId: 22, requiredLevel: 3, importance: 2, description: 'CMO管理营销项目' },  // 项目管理

  // 7. 产品经理 (Position ID: 7) - 12 competencies
  { positionId: 7, competencyId: 6, requiredLevel: 5, importance: 5, description: 'PM分析用户需求' },  // 需求分析
  { positionId: 7, competencyId: 7, requiredLevel: 5, importance: 5, description: 'PM设计产品方案' },  // 产品设计
  { positionId: 7, competencyId: 8, requiredLevel: 4, importance: 4, description: 'PM推动产品迭代' },  // 产品迭代
  { positionId: 7, competencyId: 9, requiredLevel: 4, importance: 4, description: 'PM优化用户体验' },  // 用户体验
  { positionId: 7, competencyId: 14, requiredLevel: 4, importance: 4, description: 'PM分析产品数据' },  // 数据分析
  { positionId: 7, competencyId: 22, requiredLevel: 4, importance: 3, description: 'PM管理产品项目' },  // 项目管理
  { positionId: 7, competencyId: 36, requiredLevel: 4, importance: 3, description: 'PM跨团队沟通' },  // 沟通表达
  { positionId: 7, competencyId: 10, requiredLevel: 3, importance: 3, description: 'PM创新产品功能' },  // 创新思维
  { positionId: 7, competencyId: 2, requiredLevel: 3, importance: 2, description: 'PM了解市场竞品' },  // 市场分析
  { positionId: 7, competencyId: 30, requiredLevel: 2, importance: 2, description: 'PM了解技术可行性' },  // 技术选型
  { positionId: 7, competencyId: 39, requiredLevel: 3, importance: 2, description: 'PM学习产品知识' },  // 学习能力
  { positionId: 7, competencyId: 35, requiredLevel: 3, importance: 2, description: 'PM做产品决策' },  // 战略决策

  // 8. 技术经理 (Position ID: 8) - 12 competencies
  { positionId: 8, competencyId: 31, requiredLevel: 5, importance: 5, description: '技术经理管理研发团队' },  // 研发管理
  { positionId: 8, competencyId: 32, requiredLevel: 5, importance: 5, description: '技术经理设计技术方案' },  // 技术架构
  { positionId: 8, competencyId: 22, requiredLevel: 5, importance: 4, description: '技术经理管理技术项目' },  // 项目管理
  { positionId: 8, competencyId: 30, requiredLevel: 4, importance: 4, description: '技术经理选择技术栈' },  // 技术选型
  { positionId: 8, competencyId: 23, requiredLevel: 4, importance: 4, description: '技术经理确保代码质量' },  // 质量管控
  { positionId: 8, competencyId: 16, requiredLevel: 4, importance: 3, description: '技术经理招聘工程师' },  // 人才招聘
  { positionId: 8, competencyId: 17, requiredLevel: 4, importance: 3, description: '技术经理激励团队' },  // 团队激励
  { positionId: 8, competencyId: 34, requiredLevel: 3, importance: 3, description: '技术经理管理技术债务' },  // 技术债务管理
  { positionId: 8, competencyId: 36, requiredLevel: 3, importance: 3, description: '技术经理与产品沟通' },  // 沟通表达
  { positionId: 8, competencyId: 33, requiredLevel: 3, importance: 2, description: '技术经理应用新技术' },  // 技术创新
  { positionId: 8, competencyId: 39, requiredLevel: 3, importance: 2, description: '技术经理学习新技术' },  // 学习能力
  { positionId: 8, competencyId: 18, requiredLevel: 3, importance: 2, description: '技术经理管理团队绩效' },  // 绩效管理

  // 9. 运营经理 (Position ID: 9) - 12 competencies
  { positionId: 9, competencyId: 25, requiredLevel: 5, importance: 5, description: '运营经理分析运营数据' },  // 运营数据分析
  { positionId: 9, competencyId: 21, requiredLevel: 4, importance: 4, description: '运营经理优化流程' },  // 流程优化
  { positionId: 9, competencyId: 15, requiredLevel: 4, importance: 4, description: '运营经理推动用户增长' },  // 用户增长
  { positionId: 9, competencyId: 22, requiredLevel: 4, importance: 4, description: '运营经理管理运营项目' },  // 项目管理
  { positionId: 9, competencyId: 14, requiredLevel: 4, importance: 3, description: '运营经理分析业务数据' },  // 数据分析
  { positionId: 9, competencyId: 23, requiredLevel: 3, importance: 3, description: '运营经理确保运营质量' },  // 质量管控
  { positionId: 9, competencyId: 27, requiredLevel: 3, importance: 3, description: '运营经理控制运营成本' },  // 成本控制
  { positionId: 9, competencyId: 9, requiredLevel: 3, importance: 3, description: '运营经理优化用户体验' },  // 用户体验
  { positionId: 9, competencyId: 36, requiredLevel: 3, importance: 2, description: '运营经理跨团队协作' },  // 沟通表达
  { positionId: 9, competencyId: 10, requiredLevel: 3, importance: 2, description: '运营经理创新运营方式' },  // 创新思维
  { positionId: 9, competencyId: 16, requiredLevel: 3, importance: 2, description: '运营经理搭建运营团队' },  // 人才招聘
  { positionId: 9, competencyId: 39, requiredLevel: 3, importance: 2, description: '运营经理学习运营知识' },  // 学习能力

  // 10. 市场经理 (Position ID: 10) - 12 competencies
  { positionId: 10, competencyId: 12, requiredLevel: 5, importance: 5, description: '市场经理策划营销活动' },  // 营销策划
  { positionId: 10, competencyId: 13, requiredLevel: 5, importance: 5, description: '市场经理拓展营销渠道' },  // 渠道拓展
  { positionId: 10, competencyId: 11, requiredLevel: 4, importance: 4, description: '市场经理建设品牌' },  // 品牌建设
  { positionId: 10, competencyId: 15, requiredLevel: 4, importance: 4, description: '市场经理推动用户增长' },  // 用户增长
  { positionId: 10, competencyId: 14, requiredLevel: 4, importance: 4, description: '市场经理分析营销数据' },  // 数据分析
  { positionId: 10, competencyId: 22, requiredLevel: 3, importance: 3, description: '市场经理管理营销项目' },  // 项目管理
  { positionId: 10, competencyId: 2, requiredLevel: 3, importance: 3, description: '市场经理分析市场竞品' },  // 市场分析
  { positionId: 10, competencyId: 27, requiredLevel: 3, importance: 3, description: '市场经理控制营销预算' },  // 成本控制
  { positionId: 10, competencyId: 36, requiredLevel: 4, importance: 2, description: '市场经理对外沟通' },  // 沟通表达
  { positionId: 10, competencyId: 10, requiredLevel: 3, importance: 2, description: '市场经理创新营销方式' },  // 创新思维
  { positionId: 10, competencyId: 16, requiredLevel: 2, importance: 2, description: '市场经理搭建市场团队' },  // 人才招聘
  { positionId: 10, competencyId: 39, requiredLevel: 3, importance: 2, description: '市场经理学习市场知识' },  // 学习能力

  // 11. 销售负责人 (Position ID: 11) - 12 competencies
  { positionId: 11, competencyId: 13, requiredLevel: 5, importance: 5, description: '销售负责人拓展销售渠道' },  // 渠道拓展
  { positionId: 11, competencyId: 36, requiredLevel: 5, importance: 5, description: '销售负责人与客户沟通' },  // 沟通表达
  { positionId: 11, competencyId: 2, requiredLevel: 4, importance: 4, description: '销售负责人分析市场机会' },  // 市场分析
  { positionId: 11, competencyId: 16, requiredLevel: 4, importance: 4, description: '销售负责人招聘销售团队' },  // 人才招聘
  { positionId: 11, competencyId: 17, requiredLevel: 4, importance: 4, description: '销售负责人激励销售团队' },  // 团队激励
  { positionId: 11, competencyId: 18, requiredLevel: 4, importance: 3, description: '销售负责人管理销售绩效' },  // 绩效管理
  { positionId: 11, competencyId: 14, requiredLevel: 3, importance: 3, description: '销售负责人分析销售数据' },  // 数据分析
  { positionId: 11, competencyId: 22, requiredLevel: 3, importance: 3, description: '销售负责人管理销售项目' },  // 项目管理
  { positionId: 11, competencyId: 40, requiredLevel: 4, importance: 3, description: '销售负责人影响客户决策' },  // 影响力
  { positionId: 11, competencyId: 3, requiredLevel: 3, importance: 2, description: '销售负责人制定销售战略' },  // 战略规划
  { positionId: 11, competencyId: 27, requiredLevel: 3, importance: 2, description: '销售负责人控制销售成本' },  // 成本控制
  { positionId: 11, competencyId: 39, requiredLevel: 3, importance: 2, description: '销售负责人学习行业知识' },  // 学习能力

  // 12. 人力资源负责人 (Position ID: 12) - 12 competencies
  { positionId: 12, competencyId: 16, requiredLevel: 5, importance: 5, description: 'HR负责人招聘优秀人才' },  // 人才招聘
  { positionId: 12, competencyId: 19, requiredLevel: 5, importance: 5, description: 'HR负责人塑造组织文化' },  // 组织文化
  { positionId: 12, competencyId: 17, requiredLevel: 5, importance: 4, description: 'HR负责人设计激励机制' },  // 团队激励
  { positionId: 12, competencyId: 18, requiredLevel: 5, importance: 4, description: 'HR负责人管理绩效评估' },  // 绩效管理
  { positionId: 12, competencyId: 20, requiredLevel: 4, importance: 4, description: 'HR负责人处理团队冲突' },  // 冲突处理
  { positionId: 12, competencyId: 36, requiredLevel: 4, importance: 3, description: 'HR负责人与员工沟通' },  // 沟通表达
  { positionId: 12, competencyId: 22, requiredLevel: 3, importance: 3, description: 'HR负责人管理HR项目' },  // 项目管理
  { positionId: 12, competencyId: 14, requiredLevel: 3, importance: 3, description: 'HR负责人分析人力数据' },  // 数据分析
  { positionId: 12, competencyId: 3, requiredLevel: 3, importance: 3, description: 'HR负责人制定HR战略' },  // 战略规划
  { positionId: 12, competencyId: 27, requiredLevel: 3, importance: 2, description: 'HR负责人控制人力成本' },  // 成本控制
  { positionId: 12, competencyId: 21, requiredLevel: 3, importance: 2, description: 'HR负责人优化HR流程' },  // 流程优化
  { positionId: 12, competencyId: 39, requiredLevel: 3, importance: 2, description: 'HR负责人学习HR知识' },  // 学习能力
];

async function seedPositionCompetencies() {
  console.log("🌱 Starting position-competency relationship seeding...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log(`\n🔗 Inserting ${relationshipsData.length} position-competency relationships...`);
    
    let insertedCount = 0;
    for (const rel of relationshipsData) {
      await db.insert(positionCompetencies).values(rel as any);
      insertedCount++;
      
      // Progress indicator every 20 records
      if (insertedCount % 20 === 0) {
        console.log(`   Progress: ${insertedCount}/${relationshipsData.length} relationships inserted`);
      }
    }
    
    console.log("✅ Successfully inserted all position-competency relationships");

    console.log("\n🎉 Position-competency seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`- ${relationshipsData.length} position-competency relationships`);
    console.log("- 12 positions covered");
    console.log("- 12 key competencies per position");
    
    await connection.end();
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    await connection.end();
    throw error;
  }
}

// Run the seed function
seedPositionCompetencies()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
