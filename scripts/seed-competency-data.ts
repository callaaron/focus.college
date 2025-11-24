/**
 * Seed script to populate competency system data
 * 
 * This script inserts:
 * - 8 competency domains
 * - 40 universal competencies (5 per domain)
 * - 12 common positions
 * 
 * Run with: npx tsx scripts/seed-competency-data.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { competencyDomains, competencies, positions } from "../drizzle/schema";

async function seedCompetencyData() {
  console.log("🌱 Starting competency data seeding...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // 1. Insert 8 Competency Domains
    console.log("\n📊 Inserting 8 competency domains...");
    const domainData = [
      { module: 'core', name: '战略规划', description: '企业战略制定、商业模式设计、市场定位等战略层面的能力', sortOrder: 1 },
      { module: 'core', name: '产品创新', description: '产品设计、用户体验、产品迭代等产品相关能力', sortOrder: 2 },
      { module: 'core', name: '市场营销', description: '品牌建设、市场推广、用户增长等市场营销能力', sortOrder: 3 },
      { module: 'core', name: '团队管理', description: '团队建设、人才招聘、组织文化等人力资源管理能力', sortOrder: 4 },
      { module: 'core', name: '运营管理', description: '业务流程、运营效率、质量管控等运营管理能力', sortOrder: 5 },
      { module: 'core', name: '财务融资', description: '财务管理、融资能力、成本控制等财务相关能力', sortOrder: 6 },
      { module: 'core', name: '技术研发', description: '技术架构、研发管理、技术创新等技术能力', sortOrder: 7 },
      { module: 'core', name: '领导力', description: '领导风格、决策能力、影响力等领导力相关能力', sortOrder: 8 },
    ];

    for (const domain of domainData) {
      await db.insert(competencyDomains).values(domain);
    }
    console.log("✅ Successfully inserted 8 competency domains");

    // 2. Insert 40 Universal Competencies (5 per domain)
    console.log("\n🎯 Inserting 40 universal competencies...");
    const competencyData = [
      // 战略规划域 (Domain 1)
      { name: '商业模式设计', description: '设计可持续的商业模式，明确价值主张、收入来源和成本结构', domainId: 1, category: 'core', isCore: true, sortOrder: 1 },
      { name: '市场分析', description: '分析市场规模、竞争格局、行业趋势，识别市场机会', domainId: 1, category: 'core', isCore: true, sortOrder: 2 },
      { name: '战略规划', description: '制定长期战略目标和阶段性里程碑，规划企业发展路径', domainId: 1, category: 'core', isCore: true, sortOrder: 3 },
      { name: '竞争策略', description: '制定差异化竞争策略，构建核心竞争优势', domainId: 1, category: 'core', isCore: true, sortOrder: 4 },
      { name: '商业洞察', description: '敏锐捕捉商业机会，预判市场变化和行业趋势', domainId: 1, category: 'core', isCore: true, sortOrder: 5 },

      // 产品创新域 (Domain 2)
      { name: '需求分析', description: '识别和分析用户真实需求，定义产品核心价值', domainId: 2, category: 'core', isCore: true, sortOrder: 1 },
      { name: '产品设计', description: '设计产品功能、交互流程和用户体验', domainId: 2, category: 'core', isCore: true, sortOrder: 2 },
      { name: '产品迭代', description: '基于用户反馈快速迭代产品，持续优化产品体验', domainId: 2, category: 'core', isCore: true, sortOrder: 3 },
      { name: '用户体验', description: '关注用户体验细节，提升产品易用性和满意度', domainId: 2, category: 'core', isCore: true, sortOrder: 4 },
      { name: '创新思维', description: '保持创新意识，探索新的产品方向和商业模式', domainId: 2, category: 'core', isCore: true, sortOrder: 5 },

      // 市场营销域 (Domain 3)
      { name: '品牌建设', description: '塑造品牌形象，建立品牌认知和品牌价值', domainId: 3, category: 'core', isCore: true, sortOrder: 1 },
      { name: '营销策划', description: '制定营销策略，设计营销活动和推广方案', domainId: 3, category: 'core', isCore: true, sortOrder: 2 },
      { name: '渠道拓展', description: '开拓多元化营销渠道，扩大市场覆盖面', domainId: 3, category: 'core', isCore: true, sortOrder: 3 },
      { name: '数据分析', description: '分析营销数据，优化营销ROI和转化率', domainId: 3, category: 'core', isCore: true, sortOrder: 4 },
      { name: '用户增长', description: '设计增长策略，实现用户规模的快速增长', domainId: 3, category: 'core', isCore: true, sortOrder: 5 },

      // 团队管理域 (Domain 4)
      { name: '人才招聘', description: '识别和吸引优秀人才，搭建高效团队', domainId: 4, category: 'core', isCore: true, sortOrder: 1 },
      { name: '团队激励', description: '设计激励机制，激发团队成员积极性和创造力', domainId: 4, category: 'core', isCore: true, sortOrder: 2 },
      { name: '绩效管理', description: '设定明确目标，实施有效的绩效评估和反馈', domainId: 4, category: 'core', isCore: true, sortOrder: 3 },
      { name: '组织文化', description: '塑造积极的组织文化，增强团队凝聚力', domainId: 4, category: 'core', isCore: true, sortOrder: 4 },
      { name: '冲突处理', description: '妥善处理团队冲突，维护团队和谐氛围', domainId: 4, category: 'core', isCore: true, sortOrder: 5 },

      // 运营管理域 (Domain 5)
      { name: '流程优化', description: '优化业务流程，提升运营效率和执行力', domainId: 5, category: 'core', isCore: true, sortOrder: 1 },
      { name: '项目管理', description: '管理项目进度、资源和风险，确保项目按时交付', domainId: 5, category: 'core', isCore: true, sortOrder: 2 },
      { name: '质量管控', description: '建立质量标准，实施质量监控和持续改进', domainId: 5, category: 'core', isCore: true, sortOrder: 3 },
      { name: '供应链管理', description: '优化供应链效率，降低成本并保证交付质量', domainId: 5, category: 'core', isCore: true, sortOrder: 4 },
      { name: '运营数据分析', description: '分析运营数据，发现问题并制定改进措施', domainId: 5, category: 'core', isCore: true, sortOrder: 5 },

      // 财务融资域 (Domain 6)
      { name: '财务规划', description: '制定财务预算和资金使用计划，确保资金健康', domainId: 6, category: 'core', isCore: true, sortOrder: 1 },
      { name: '融资能力', description: '准备融资材料，与投资人沟通并完成融资', domainId: 6, category: 'core', isCore: true, sortOrder: 2 },
      { name: '成本控制', description: '控制各项成本支出，提高资金使用效率', domainId: 6, category: 'core', isCore: true, sortOrder: 3 },
      { name: '财务分析', description: '分析财务报表，评估财务健康状况和经营风险', domainId: 6, category: 'core', isCore: true, sortOrder: 4 },
      { name: '投资决策', description: '评估投资机会和风险，做出合理的投资决策', domainId: 6, category: 'core', isCore: true, sortOrder: 5 },

      // 技术研发域 (Domain 7)
      { name: '技术选型', description: '选择合适的技术栈和架构，支持业务快速发展', domainId: 7, category: 'core', isCore: true, sortOrder: 1 },
      { name: '研发管理', description: '管理研发团队和项目，确保技术产出质量和效率', domainId: 7, category: 'core', isCore: true, sortOrder: 2 },
      { name: '技术架构', description: '设计可扩展的技术架构，支撑业务长期发展', domainId: 7, category: 'core', isCore: true, sortOrder: 3 },
      { name: '技术创新', description: '关注技术前沿，将新技术应用于产品创新', domainId: 7, category: 'core', isCore: true, sortOrder: 4 },
      { name: '技术债务管理', description: '平衡技术债务和业务发展，避免技术风险积累', domainId: 7, category: 'core', isCore: true, sortOrder: 5 },

      // 领导力域 (Domain 8)
      { name: '战略决策', description: '在不确定性中做出关键决策，把握企业发展方向', domainId: 8, category: 'core', isCore: true, sortOrder: 1 },
      { name: '沟通表达', description: '清晰表达想法和愿景，有效沟通和说服他人', domainId: 8, category: 'core', isCore: true, sortOrder: 2 },
      { name: '抗压能力', description: '在高压环境下保持冷静，应对挑战和挫折', domainId: 8, category: 'core', isCore: true, sortOrder: 3 },
      { name: '学习能力', description: '快速学习新知识和技能，适应快速变化的环境', domainId: 8, category: 'core', isCore: true, sortOrder: 4 },
      { name: '影响力', description: '通过个人魅力和专业能力影响团队和利益相关方', domainId: 8, category: 'core', isCore: true, sortOrder: 5 },
    ];

    for (const comp of competencyData) {
      await db.insert(competencies).values(comp as any);
    }
    console.log("✅ Successfully inserted 40 universal competencies");

    // 3. Insert Common Positions
    console.log("\n👔 Inserting 12 common positions...");
    const positionData = [
      { name: 'CEO/创始人', code: 'CEO', description: '公司最高决策者，负责公司整体战略、融资和重大决策', level: 'executive', category: 'management' },
      { name: 'CTO/技术负责人', code: 'CTO', description: '技术团队负责人，负责技术战略、架构设计和研发管理', level: 'executive', category: 'technology' },
      { name: 'CPO/产品负责人', code: 'CPO', description: '产品团队负责人，负责产品战略、规划和用户体验', level: 'executive', category: 'product' },
      { name: 'COO/运营负责人', code: 'COO', description: '运营团队负责人，负责业务运营、流程优化和执行落地', level: 'executive', category: 'operations' },
      { name: 'CFO/财务负责人', code: 'CFO', description: '财务团队负责人，负责财务管理、融资和投资决策', level: 'executive', category: 'finance' },
      { name: 'CMO/市场负责人', code: 'CMO', description: '市场团队负责人，负责品牌建设、市场推广和用户增长', level: 'executive', category: 'marketing' },
      { name: '产品经理', code: 'PM', description: '负责产品规划、需求分析和产品迭代', level: 'middle', category: 'product' },
      { name: '技术经理', code: 'TM', description: '负责技术团队管理、项目管理和技术方案设计', level: 'middle', category: 'technology' },
      { name: '运营经理', code: 'OM', description: '负责业务运营、数据分析和运营策略制定', level: 'middle', category: 'operations' },
      { name: '市场经理', code: 'MM', description: '负责市场活动策划、渠道拓展和品牌推广', level: 'middle', category: 'marketing' },
      { name: '销售负责人', code: 'SM', description: '负责销售团队管理、客户关系维护和销售策略', level: 'middle', category: 'sales' },
      { name: '人力资源负责人', code: 'HRM', description: '负责人才招聘、团队建设和组织文化塑造', level: 'middle', category: 'hr' },
    ];

    for (const pos of positionData) {
      await db.insert(positions).values(pos as any);
    }
    console.log("✅ Successfully inserted 12 common positions");

    console.log("\n🎉 Competency data seeding completed successfully!");
    console.log("\nSummary:");
    console.log("- 8 competency domains");
    console.log("- 40 universal competencies (5 per domain)");
    console.log("- 12 common positions");
    
    await connection.end();
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    await connection.end();
    throw error;
  }
}

// Run the seed function
seedCompetencyData()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
