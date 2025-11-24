/**
 * Seed script to populate industry-competency relationships
 * 
 * This script establishes relationships between industries and competencies,
 * defining which competencies are important for each industry with importance levels (1-5).
 * 
 * Run with: npx tsx scripts/seed-industry-competencies.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { industryCompetencies } from "../drizzle/schema";

/**
 * Industry-Competency Relationship Data
 * 
 * Format: { industryId, competencyId, importance, description }
 * - industryId: ID from industries table (1-21)
 * - competencyId: ID from competencies table (1-40)
 * - importance: 1-5 (5 = critical, 4 = very important, 3 = important, 2 = useful, 1 = nice to have)
 * - description: Industry-specific context for this competency
 */
const relationshipsData = [
  // 1. 互联网/电商 (Internet/E-commerce) - 8 competencies
  { industryId: 1, competencyId: 6, importance: 5, description: '深度理解用户需求，打造爆款产品' },  // 需求分析
  { industryId: 1, competencyId: 7, importance: 5, description: '快速迭代产品功能，优化用户体验' },  // 产品设计
  { industryId: 1, competencyId: 15, importance: 5, description: '通过增长黑客实现用户规模爆发' },  // 用户增长
  { industryId: 1, competencyId: 14, importance: 4, description: '通过数据分析优化转化漏斗' },  // 数据分析
  { industryId: 1, competencyId: 30, importance: 4, description: '构建高性能的分布式系统架构' },  // 技术选型
  { industryId: 1, competencyId: 32, importance: 4, description: '设计可扩展的微服务架构' },  // 技术架构
  { industryId: 1, competencyId: 26, importance: 3, description: '快速融资支持业务扩张' },  // 融资能力
  { industryId: 1, competencyId: 21, importance: 3, description: '优化业务流程提升运营效率' },  // 流程优化

  // 2. 软件/IT服务 (Software/IT Services) - 8 competencies
  { industryId: 2, competencyId: 31, importance: 5, description: '有效管理研发团队和技术项目' },  // 研发管理
  { industryId: 2, competencyId: 32, importance: 5, description: '设计稳定可靠的企业级架构' },  // 技术架构
  { industryId: 2, competencyId: 7, importance: 4, description: '设计符合客户需求的解决方案' },  // 产品设计
  { industryId: 2, competencyId: 23, importance: 4, description: '确保交付质量和客户满意度' },  // 质量管控
  { industryId: 2, competencyId: 22, importance: 4, description: '高效管理多个客户项目' },  // 项目管理
  { industryId: 2, competencyId: 16, importance: 3, description: '吸引优秀技术人才加入' },  // 人才招聘
  { industryId: 2, competencyId: 30, importance: 3, description: '选择适合的技术栈和工具' },  // 技术选型
  { industryId: 2, competencyId: 34, importance: 3, description: '平衡技术债务和业务需求' },  // 技术债务管理

  // 3. 人工智能 (Artificial Intelligence) - 8 competencies
  { industryId: 3, competencyId: 33, importance: 5, description: '跟踪AI前沿技术并应用落地' },  // 技术创新
  { industryId: 3, competencyId: 31, importance: 5, description: '管理算法团队和AI项目' },  // 研发管理
  { industryId: 3, competencyId: 6, importance: 4, description: '识别AI技术的应用场景' },  // 需求分析
  { industryId: 3, competencyId: 2, importance: 4, description: '分析AI市场机会和竞争态势' },  // 市场分析
  { industryId: 3, competencyId: 30, importance: 4, description: '选择AI框架和云计算平台' },  // 技术选型
  { industryId: 3, competencyId: 26, importance: 4, description: 'AI项目需要大量资金支持' },  // 融资能力
  { industryId: 3, competencyId: 14, importance: 3, description: '分析模型效果和业务指标' },  // 数据分析
  { industryId: 3, competencyId: 39, importance: 3, description: '快速学习AI新技术和论文' },  // 学习能力

  // 4. 金融科技 (FinTech) - 8 competencies
  { industryId: 4, competencyId: 28, importance: 5, description: '深刻理解财务合规和风控' },  // 财务分析
  { industryId: 4, competencyId: 27, importance: 5, description: '严格控制资金风险和成本' },  // 成本控制
  { industryId: 4, competencyId: 23, importance: 5, description: '确保金融产品的质量和安全' },  // 质量管控
  { industryId: 4, competencyId: 32, importance: 4, description: '设计高安全性的金融系统架构' },  // 技术架构
  { industryId: 4, competencyId: 6, importance: 4, description: '深入理解金融用户需求' },  // 需求分析
  { industryId: 4, competencyId: 26, importance: 4, description: '获取金融牌照和融资' },  // 融资能力
  { industryId: 4, competencyId: 14, importance: 3, description: '分析金融数据和用户行为' },  // 数据分析
  { industryId: 4, competencyId: 29, importance: 3, description: '评估金融投资机会' },  // 投资决策

  // 5. 企业服务 (Enterprise Services) - 8 competencies
  { industryId: 5, competencyId: 6, importance: 5, description: '深度理解企业客户痛点' },  // 需求分析
  { industryId: 5, competencyId: 7, importance: 5, description: '设计解决企业问题的产品' },  // 产品设计
  { industryId: 5, competencyId: 13, importance: 4, description: '拓展企业客户渠道' },  // 渠道拓展
  { industryId: 5, competencyId: 23, importance: 4, description: '保证服务质量和SLA' },  // 质量管控
  { industryId: 5, competencyId: 22, importance: 4, description: '管理多个企业客户项目' },  // 项目管理
  { industryId: 5, competencyId: 11, importance: 3, description: '建立企业服务品牌信任' },  // 品牌建设
  { industryId: 5, competencyId: 36, importance: 3, description: '与企业决策者有效沟通' },  // 沟通表达
  { industryId: 5, competencyId: 26, importance: 3, description: '获取企业客户和融资' },  // 融资能力

  // 6. 教育培训 (Education & Training) - 8 competencies
  { industryId: 6, competencyId: 8, importance: 5, description: '基于用户反馈优化课程内容' },  // 产品迭代
  { industryId: 6, competencyId: 9, importance: 5, description: '提升学习体验和完课率' },  // 用户体验
  { industryId: 6, competencyId: 11, importance: 4, description: '建立教育品牌口碑' },  // 品牌建设
  { industryId: 6, competencyId: 15, importance: 4, description: '获取学员并降低获客成本' },  // 用户增长
  { industryId: 6, competencyId: 16, importance: 4, description: '招募优秀的师资团队' },  // 人才招聘
  { industryId: 6, competencyId: 13, importance: 3, description: '开拓线上线下招生渠道' },  // 渠道拓展
  { industryId: 6, competencyId: 23, importance: 3, description: '保证教学质量和效果' },  // 质量管控
  { industryId: 6, competencyId: 27, importance: 3, description: '控制教学成本提高利润' },  // 成本控制

  // 7. 医疗健康 (Healthcare) - 8 competencies
  { industryId: 7, competencyId: 23, importance: 5, description: '确保医疗产品的质量和安全' },  // 质量管控
  { industryId: 7, competencyId: 28, importance: 5, description: '管理医疗资金和医保对接' },  // 财务分析
  { industryId: 7, competencyId: 6, importance: 4, description: '深入理解医疗场景需求' },  // 需求分析
  { industryId: 7, competencyId: 26, importance: 4, description: '获取医疗资质和融资' },  // 融资能力
  { industryId: 7, competencyId: 13, importance: 4, description: '拓展医院和患者渠道' },  // 渠道拓展
  { industryId: 7, competencyId: 32, importance: 3, description: '设计安全可靠的医疗系统' },  // 技术架构
  { industryId: 7, competencyId: 11, importance: 3, description: '建立医疗品牌信任度' },  // 品牌建设
  { industryId: 7, competencyId: 16, importance: 3, description: '招募医疗专业人才' },  // 人才招聘

  // 8. 文娱传媒 (Media & Entertainment) - 8 competencies
  { industryId: 8, competencyId: 10, importance: 5, description: '持续创新内容形式和题材' },  // 创新思维
  { industryId: 8, competencyId: 9, importance: 5, description: '打造极致的内容消费体验' },  // 用户体验
  { industryId: 8, competencyId: 11, importance: 4, description: '建立IP品牌和粉丝基础' },  // 品牌建设
  { industryId: 8, competencyId: 15, importance: 4, description: '扩大用户规模和影响力' },  // 用户增长
  { industryId: 8, competencyId: 12, importance: 4, description: '策划爆款内容和活动' },  // 营销策划
  { industryId: 8, competencyId: 14, importance: 3, description: '分析内容数据优化策略' },  // 数据分析
  { industryId: 8, competencyId: 26, importance: 3, description: '融资支持内容制作' },  // 融资能力
  { industryId: 8, competencyId: 16, importance: 3, description: '吸引优秀创作者加入' },  // 人才招聘

  // 9. 新零售 (New Retail) - 8 competencies
  { industryId: 9, competencyId: 24, importance: 5, description: '优化零售供应链效率' },  // 供应链管理
  { industryId: 9, competencyId: 25, importance: 5, description: '分析运营数据优化坪效' },  // 运营数据分析
  { industryId: 9, competencyId: 13, importance: 4, description: '开拓线上线下销售渠道' },  // 渠道拓展
  { industryId: 9, competencyId: 27, importance: 4, description: '严格控制采购和运营成本' },  // 成本控制
  { industryId: 9, competencyId: 9, importance: 4, description: '提升购物体验和复购率' },  // 用户体验
  { industryId: 9, competencyId: 15, importance: 3, description: '拓展新客户和会员' },  // 用户增长
  { industryId: 9, competencyId: 11, importance: 3, description: '建立零售品牌认知' },  // 品牌建设
  { industryId: 9, competencyId: 21, importance: 3, description: '优化门店和仓储流程' },  // 流程优化

  // 10. 智能硬件 (Smart Hardware) - 8 competencies
  { industryId: 10, competencyId: 7, importance: 5, description: '设计用户喜爱的硬件产品' },  // 产品设计
  { industryId: 10, competencyId: 24, importance: 5, description: '管理硬件供应链和制造' },  // 供应链管理
  { industryId: 10, competencyId: 33, importance: 4, description: '将创新技术应用到硬件' },  // 技术创新
  { industryId: 10, competencyId: 23, importance: 4, description: '确保硬件质量和可靠性' },  // 质量管控
  { industryId: 10, competencyId: 13, importance: 4, description: '拓展线上线下销售渠道' },  // 渠道拓展
  { industryId: 10, competencyId: 27, importance: 3, description: '控制制造成本提高利润' },  // 成本控制
  { industryId: 10, competencyId: 11, importance: 3, description: '建立硬件产品品牌' },  // 品牌建设
  { industryId: 10, competencyId: 26, importance: 3, description: '融资支持硬件研发和生产' },  // 融资能力

  // 11. 汽车交通 (Automotive & Transportation) - 8 competencies
  { industryId: 11, competencyId: 24, importance: 5, description: '优化汽车供应链和物流' },  // 供应链管理
  { industryId: 11, competencyId: 23, importance: 5, description: '确保汽车安全和质量标准' },  // 质量管控
  { industryId: 11, competencyId: 33, importance: 4, description: '应用新能源和智能驾驶技术' },  // 技术创新
  { industryId: 11, competencyId: 26, importance: 4, description: '获取大额融资支持生产' },  // 融资能力
  { industryId: 11, competencyId: 13, importance: 4, description: '建立经销商和直销渠道' },  // 渠道拓展
  { industryId: 11, competencyId: 11, importance: 3, description: '建立汽车品牌影响力' },  // 品牌建设
  { industryId: 11, competencyId: 31, importance: 3, description: '管理车辆研发项目' },  // 研发管理
  { industryId: 11, competencyId: 27, importance: 3, description: '控制生产和运营成本' },  // 成本控制

  // 12. 房产家居 (Real Estate & Home) - 8 competencies
  { industryId: 12, competencyId: 28, importance: 5, description: '管理房产资金和现金流' },  // 财务分析
  { industryId: 12, competencyId: 26, importance: 5, description: '获取土地和项目融资' },  // 融资能力
  { industryId: 12, competencyId: 13, importance: 4, description: '拓展房产销售渠道' },  // 渠道拓展
  { industryId: 12, competencyId: 11, importance: 4, description: '建立地产品牌知名度' },  // 品牌建设
  { industryId: 12, competencyId: 22, importance: 4, description: '管理房产开发项目' },  // 项目管理
  { industryId: 12, competencyId: 24, importance: 3, description: '优化建材供应链' },  // 供应链管理
  { industryId: 12, competencyId: 27, importance: 3, description: '控制建设成本' },  // 成本控制
  { industryId: 12, competencyId: 9, importance: 3, description: '提升购房和装修体验' },  // 用户体验

  // 13. 农业科技 (AgTech) - 8 competencies
  { industryId: 13, competencyId: 33, importance: 5, description: '应用农业科技创新提高产量' },  // 技术创新
  { industryId: 13, competencyId: 24, importance: 5, description: '优化农产品供应链' },  // 供应链管理
  { industryId: 13, competencyId: 13, importance: 4, description: '拓展农产品销售渠道' },  // 渠道拓展
  { industryId: 13, competencyId: 27, importance: 4, description: '降低农业生产成本' },  // 成本控制
  { industryId: 13, competencyId: 26, importance: 4, description: '获取农业项目融资' },  // 融资能力
  { industryId: 13, competencyId: 11, importance: 3, description: '建立农产品品牌' },  // 品牌建设
  { industryId: 13, competencyId: 23, importance: 3, description: '保证农产品质量安全' },  // 质量管控
  { industryId: 13, competencyId: 25, importance: 3, description: '分析农业生产数据' },  // 运营数据分析

  // 14. 先进制造 (Advanced Manufacturing) - 8 competencies
  { industryId: 14, competencyId: 23, importance: 5, description: '确保制造质量和精度' },  // 质量管控
  { industryId: 14, competencyId: 24, importance: 5, description: '优化制造供应链' },  // 供应链管理
  { industryId: 14, competencyId: 33, importance: 4, description: '应用智能制造技术' },  // 技术创新
  { industryId: 14, competencyId: 21, importance: 4, description: '优化生产流程提高效率' },  // 流程优化
  { industryId: 14, competencyId: 27, importance: 4, description: '严格控制制造成本' },  // 成本控制
  { industryId: 14, competencyId: 31, importance: 3, description: '管理制造技术研发' },  // 研发管理
  { industryId: 14, competencyId: 26, importance: 3, description: '融资购买生产设备' },  // 融资能力
  { industryId: 14, competencyId: 22, importance: 3, description: '管理制造项目进度' },  // 项目管理

  // 15. 新能源 (New Energy) - 8 competencies
  { industryId: 15, competencyId: 33, importance: 5, description: '研发新能源技术创新' },  // 技术创新
  { industryId: 15, competencyId: 26, importance: 5, description: '获取新能源项目大额融资' },  // 融资能力
  { industryId: 15, competencyId: 31, importance: 4, description: '管理新能源研发项目' },  // 研发管理
  { industryId: 15, competencyId: 23, importance: 4, description: '确保新能源安全和稳定' },  // 质量管控
  { industryId: 15, competencyId: 24, importance: 4, description: '建立新能源供应链' },  // 供应链管理
  { industryId: 15, competencyId: 27, importance: 3, description: '降低新能源成本' },  // 成本控制
  { industryId: 15, competencyId: 2, importance: 3, description: '分析新能源市场机会' },  // 市场分析
  { industryId: 15, competencyId: 13, importance: 3, description: '拓展新能源客户' },  // 渠道拓展

  // 16. 环保 (Environmental Protection) - 8 competencies
  { industryId: 16, competencyId: 33, importance: 5, description: '开发环保技术解决方案' },  // 技术创新
  { industryId: 16, competencyId: 26, importance: 5, description: '获取环保项目融资' },  // 融资能力
  { industryId: 16, competencyId: 23, importance: 4, description: '确保环保标准合规' },  // 质量管控
  { industryId: 16, competencyId: 6, importance: 4, description: '理解环保项目需求' },  // 需求分析
  { industryId: 16, competencyId: 13, importance: 4, description: '拓展政府和企业客户' },  // 渠道拓展
  { industryId: 16, competencyId: 22, importance: 3, description: '管理环保工程项目' },  // 项目管理
  { industryId: 16, competencyId: 27, importance: 3, description: '控制环保项目成本' },  // 成本控制
  { industryId: 16, competencyId: 11, importance: 3, description: '建立环保品牌形象' },  // 品牌建设

  // 17. 物流供应链 (Logistics & Supply Chain) - 8 competencies
  { industryId: 17, competencyId: 24, importance: 5, description: '优化端到端供应链效率' },  // 供应链管理
  { industryId: 17, competencyId: 25, importance: 5, description: '分析物流数据优化路线' },  // 运营数据分析
  { industryId: 17, competencyId: 21, importance: 4, description: '优化仓储和配送流程' },  // 流程优化
  { industryId: 17, competencyId: 27, importance: 4, description: '降低物流运营成本' },  // 成本控制
  { industryId: 17, competencyId: 32, importance: 4, description: '构建智能物流系统' },  // 技术架构
  { industryId: 17, competencyId: 13, importance: 3, description: '拓展物流客户网络' },  // 渠道拓展
  { industryId: 17, competencyId: 23, importance: 3, description: '保证物流服务质量' },  // 质量管控
  { industryId: 17, competencyId: 22, importance: 3, description: '管理物流项目实施' },  // 项目管理

  // 18. 旅游出行 (Travel & Tourism) - 8 competencies
  { industryId: 18, competencyId: 9, importance: 5, description: '打造极致的旅游体验' },  // 用户体验
  { industryId: 18, competencyId: 11, importance: 5, description: '建立旅游目的地品牌' },  // 品牌建设
  { industryId: 18, competencyId: 13, importance: 4, description: '拓展旅游销售渠道' },  // 渠道拓展
  { industryId: 18, competencyId: 12, importance: 4, description: '策划吸引人的旅游产品' },  // 营销策划
  { industryId: 18, competencyId: 24, importance: 4, description: '管理旅游供应链资源' },  // 供应链管理
  { industryId: 18, competencyId: 27, importance: 3, description: '控制旅游运营成本' },  // 成本控制
  { industryId: 18, competencyId: 15, importance: 3, description: '扩大旅游用户群体' },  // 用户增长
  { industryId: 18, competencyId: 23, importance: 3, description: '保证旅游服务质量' },  // 质量管控

  // 19. 社交网络 (Social Network) - 8 competencies
  { industryId: 19, competencyId: 15, importance: 5, description: '实现用户快速增长和裂变' },  // 用户增长
  { industryId: 19, competencyId: 9, importance: 5, description: '打造吸引人的社交体验' },  // 用户体验
  { industryId: 19, competencyId: 8, importance: 4, description: '快速迭代社交功能' },  // 产品迭代
  { industryId: 19, competencyId: 32, importance: 4, description: '构建高并发社交架构' },  // 技术架构
  { industryId: 19, competencyId: 14, importance: 4, description: '分析用户行为数据' },  // 数据分析
  { industryId: 19, competencyId: 26, importance: 3, description: '融资支持用户增长' },  // 融资能力
  { industryId: 19, competencyId: 11, importance: 3, description: '建立社交平台品牌' },  // 品牌建设
  { industryId: 19, competencyId: 10, importance: 3, description: '创新社交互动方式' },  // 创新思维

  // 20. 本地生活 (Local Services) - 8 competencies
  { industryId: 20, competencyId: 13, importance: 5, description: '拓展本地商家和用户' },  // 渠道拓展
  { industryId: 20, competencyId: 25, importance: 5, description: '分析本地运营数据' },  // 运营数据分析
  { industryId: 20, competencyId: 21, importance: 4, description: '优化本地服务流程' },  // 流程优化
  { industryId: 20, competencyId: 9, importance: 4, description: '提升本地服务体验' },  // 用户体验
  { industryId: 20, competencyId: 24, importance: 4, description: '管理本地供应链' },  // 供应链管理
  { industryId: 20, competencyId: 15, importance: 3, description: '扩大本地用户规模' },  // 用户增长
  { industryId: 20, competencyId: 11, importance: 3, description: '建立本地服务品牌' },  // 品牌建设
  { industryId: 20, competencyId: 27, importance: 3, description: '控制运营成本' },  // 成本控制

  // 21. 其他 (Other) - 8 通用能力
  { industryId: 21, competencyId: 1, importance: 4, description: '设计适合自身的商业模式' },  // 商业模式设计
  { industryId: 21, competencyId: 2, importance: 4, description: '分析所在行业市场' },  // 市场分析
  { industryId: 21, competencyId: 3, importance: 4, description: '制定企业发展战略' },  // 战略规划
  { industryId: 21, competencyId: 16, importance: 3, description: '招聘合适人才' },  // 人才招聘
  { industryId: 21, competencyId: 26, importance: 3, description: '获取创业融资' },  // 融资能力
  { industryId: 21, competencyId: 35, importance: 3, description: '做出关键决策' },  // 战略决策
  { industryId: 21, competencyId: 36, importance: 3, description: '有效沟通协作' },  // 沟通表达
  { industryId: 21, competencyId: 39, importance: 3, description: '持续学习成长' },  // 学习能力
];

async function seedIndustryCompetencies() {
  console.log("🌱 Starting industry-competency relationship seeding...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log(`\n🔗 Inserting ${relationshipsData.length} industry-competency relationships...`);
    
    let insertedCount = 0;
    for (const rel of relationshipsData) {
      await db.insert(industryCompetencies).values(rel as any);
      insertedCount++;
      
      // Progress indicator every 20 records
      if (insertedCount % 20 === 0) {
        console.log(`   Progress: ${insertedCount}/${relationshipsData.length} relationships inserted`);
      }
    }
    
    console.log("✅ Successfully inserted all industry-competency relationships");

    console.log("\n🎉 Industry-competency seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`- ${relationshipsData.length} industry-competency relationships`);
    console.log("- 21 industries covered");
    console.log("- ~8 key competencies per industry");
    
    await connection.end();
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    await connection.end();
    throw error;
  }
}

// Run the seed function
seedIndustryCompetencies()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
