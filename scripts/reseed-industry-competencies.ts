/**
 * Re-seed industry-competency relationships with correct industry IDs
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import { industries, industryCompetencies } from "../drizzle/schema";

async function reseedIndustryCompetencies() {
  console.log("🌱 重新建立行业-能力关联关系...\n");

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  try {
    // 1. 获取所有行业及其新ID
    console.log("📖 读取行业数据...");
    const allIndustries = await db.select().from(industries);
    
    const industryMap = new Map<string, number>();
    for (const ind of allIndustries) {
      industryMap.set(ind.code, ind.id);
      console.log(`  ${ind.name} (${ind.code}) -> ID: ${ind.id}`);
    }
    console.log(`✅ 找到 ${allIndustries.length} 个行业\n`);

    // 2. 定义关联关系（使用code而不是硬编码ID）
    const relationshipsData = [
      // 互联网/电商
      { code: 'internet_ecommerce', competencyId: 6, importance: 5, description: '深度理解用户需求，打造爆款产品' },
      { code: 'internet_ecommerce', competencyId: 7, importance: 5, description: '快速迭代产品功能，优化用户体验' },
      { code: 'internet_ecommerce', competencyId: 15, importance: 5, description: '通过增长黑客实现用户规模爆发' },
      { code: 'internet_ecommerce', competencyId: 14, importance: 4, description: '通过数据分析优化转化漏斗' },
      { code: 'internet_ecommerce', competencyId: 30, importance: 4, description: '构建高性能的分布式系统架构' },
      { code: 'internet_ecommerce', competencyId: 32, importance: 4, description: '设计可扩展的微服务架构' },
      { code: 'internet_ecommerce', competencyId: 26, importance: 3, description: '快速融资支持业务扩张' },
      { code: 'internet_ecommerce', competencyId: 21, importance: 3, description: '优化业务流程提升运营效率' },

      // 软件/IT服务
      { code: 'software_it', competencyId: 31, importance: 5, description: '有效管理研发团队和技术项目' },
      { code: 'software_it', competencyId: 32, importance: 5, description: '设计稳定可靠的企业级架构' },
      { code: 'software_it', competencyId: 7, importance: 4, description: '设计符合客户需求的解决方案' },
      { code: 'software_it', competencyId: 23, importance: 4, description: '确保交付质量和客户满意度' },
      { code: 'software_it', competencyId: 22, importance: 4, description: '高效管理多个客户项目' },
      { code: 'software_it', competencyId: 16, importance: 3, description: '吸引优秀技术人才加入' },
      { code: 'software_it', competencyId: 30, importance: 3, description: '选择适合的技术栈和工具' },
      { code: 'software_it', competencyId: 34, importance: 3, description: '平衡技术债务和业务需求' },

      // 人工智能
      { code: 'artificial_intelligence', competencyId: 33, importance: 5, description: '跟踪AI前沿技术并应用落地' },
      { code: 'artificial_intelligence', competencyId: 31, importance: 5, description: '管理算法团队和AI项目' },
      { code: 'artificial_intelligence', competencyId: 6, importance: 4, description: '识别AI技术的应用场景' },
      { code: 'artificial_intelligence', competencyId: 2, importance: 4, description: '分析AI市场机会和竞争态势' },
      { code: 'artificial_intelligence', competencyId: 30, importance: 4, description: '选择AI框架和云计算平台' },
      { code: 'artificial_intelligence', competencyId: 26, importance: 4, description: 'AI项目需要大量资金支持' },
      { code: 'artificial_intelligence', competencyId: 14, importance: 3, description: '分析模型效果和业务指标' },
      { code: 'artificial_intelligence', competencyId: 39, importance: 3, description: '快速学习AI新技术和论文' },

      // 金融科技
      { code: 'fintech', competencyId: 28, importance: 5, description: '深刻理解财务合规和风控' },
      { code: 'fintech', competencyId: 27, importance: 5, description: '严格控制资金风险和成本' },
      { code: 'fintech', competencyId: 23, importance: 5, description: '确保金融产品的质量和安全' },
      { code: 'fintech', competencyId: 32, importance: 4, description: '设计高安全性的金融系统架构' },
      { code: 'fintech', competencyId: 6, importance: 4, description: '深入理解金融用户需求' },
      { code: 'fintech', competencyId: 26, importance: 4, description: '获取金融牌照和融资' },
      { code: 'fintech', competencyId: 14, importance: 3, description: '分析金融数据和用户行为' },
      { code: 'fintech', competencyId: 29, importance: 3, description: '评估金融投资机会' },

      // 企业服务
      { code: 'enterprise_service', competencyId: 6, importance: 5, description: '深度理解企业客户痛点' },
      { code: 'enterprise_service', competencyId: 7, importance: 5, description: '设计解决企业问题的产品' },
      { code: 'enterprise_service', competencyId: 13, importance: 4, description: '拓展企业客户渠道' },
      { code: 'enterprise_service', competencyId: 23, importance: 4, description: '保证服务质量和SLA' },
      { code: 'enterprise_service', competencyId: 22, importance: 4, description: '管理多个企业客户项目' },
      { code: 'enterprise_service', competencyId: 11, importance: 3, description: '建立企业服务品牌信任' },
      { code: 'enterprise_service', competencyId: 36, importance: 3, description: '与企业决策者有效沟通' },
      { code: 'enterprise_service', competencyId: 26, importance: 3, description: '获取企业客户和融资' },

      // 教育培训
      { code: 'education', competencyId: 8, importance: 5, description: '基于用户反馈优化课程内容' },
      { code: 'education', competencyId: 9, importance: 5, description: '提升学习体验和完课率' },
      { code: 'education', competencyId: 11, importance: 4, description: '建立教育品牌口碑' },
      { code: 'education', competencyId: 15, importance: 4, description: '获取学员并降低获客成本' },
      { code: 'education', competencyId: 16, importance: 4, description: '招募优秀的师资团队' },
      { code: 'education', competencyId: 13, importance: 3, description: '开拓线上线下招生渠道' },
      { code: 'education', competencyId: 23, importance: 3, description: '保证教学质量和效果' },
      { code: 'education', competencyId: 27, importance: 3, description: '控制教学成本提高利润' },

      // 医疗健康
      { code: 'healthcare', competencyId: 23, importance: 5, description: '确保医疗产品的质量和安全' },
      { code: 'healthcare', competencyId: 28, importance: 5, description: '管理医疗资金和医保对接' },
      { code: 'healthcare', competencyId: 6, importance: 4, description: '深入理解医疗场景需求' },
      { code: 'healthcare', competencyId: 26, importance: 4, description: '获取医疗资质和融资' },
      { code: 'healthcare', competencyId: 13, importance: 4, description: '拓展医院和患者渠道' },
      { code: 'healthcare', competencyId: 32, importance: 3, description: '设计安全可靠的医疗系统' },
      { code: 'healthcare', competencyId: 11, importance: 3, description: '建立医疗品牌信任度' },
      { code: 'healthcare', competencyId: 16, importance: 3, description: '招募医疗专业人才' },

      // 文娱传媒
      { code: 'media_entertainment', competencyId: 10, importance: 5, description: '持续创新内容形式和题材' },
      { code: 'media_entertainment', competencyId: 9, importance: 5, description: '打造极致的内容消费体验' },
      { code: 'media_entertainment', competencyId: 11, importance: 4, description: '建立IP品牌和粉丝基础' },
      { code: 'media_entertainment', competencyId: 15, importance: 4, description: '扩大用户规模和影响力' },
      { code: 'media_entertainment', competencyId: 12, importance: 4, description: '策划爆款内容和活动' },
      { code: 'media_entertainment', competencyId: 14, importance: 3, description: '分析内容数据优化策略' },
      { code: 'media_entertainment', competencyId: 26, importance: 3, description: '融资支持内容制作' },
      { code: 'media_entertainment', competencyId: 16, importance: 3, description: '吸引优秀创作者加入' },

      // 新零售
      { code: 'new_retail', competencyId: 24, importance: 5, description: '优化零售供应链效率' },
      { code: 'new_retail', competencyId: 25, importance: 5, description: '分析运营数据优化坪效' },
      { code: 'new_retail', competencyId: 13, importance: 4, description: '开拓线上线下销售渠道' },
      { code: 'new_retail', competencyId: 27, importance: 4, description: '严格控制采购和运营成本' },
      { code: 'new_retail', competencyId: 9, importance: 4, description: '提升购物体验和复购率' },
      { code: 'new_retail', competencyId: 15, importance: 3, description: '拓展新客户和会员' },
      { code: 'new_retail', competencyId: 11, importance: 3, description: '建立零售品牌认知' },
      { code: 'new_retail', competencyId: 21, importance: 3, description: '优化门店和仓储流程' },

      // 智能硬件
      { code: 'smart_hardware', competencyId: 7, importance: 5, description: '设计用户喜爱的硬件产品' },
      { code: 'smart_hardware', competencyId: 24, importance: 5, description: '管理硬件供应链和制造' },
      { code: 'smart_hardware', competencyId: 33, importance: 4, description: '将创新技术应用到硬件' },
      { code: 'smart_hardware', competencyId: 23, importance: 4, description: '确保硬件质量和可靠性' },
      { code: 'smart_hardware', competencyId: 13, importance: 4, description: '拓展线上线下销售渠道' },
      { code: 'smart_hardware', competencyId: 27, importance: 3, description: '控制制造成本提高利润' },
      { code: 'smart_hardware', competencyId: 11, importance: 3, description: '建立硬件产品品牌' },
      { code: 'smart_hardware', competencyId: 26, importance: 3, description: '融资支持硬件研发和生产' },

      // 汽车交通
      { code: 'automotive', competencyId: 24, importance: 5, description: '优化汽车供应链和物流' },
      { code: 'automotive', competencyId: 23, importance: 5, description: '确保汽车安全和质量标准' },
      { code: 'automotive', competencyId: 33, importance: 4, description: '应用新能源和智能驾驶技术' },
      { code: 'automotive', competencyId: 26, importance: 4, description: '获取大额融资支持生产' },
      { code: 'automotive', competencyId: 13, importance: 4, description: '建立经销商和直销渠道' },
      { code: 'automotive', competencyId: 11, importance: 3, description: '建立汽车品牌影响力' },
      { code: 'automotive', competencyId: 31, importance: 3, description: '管理车辆研发项目' },
      { code: 'automotive', competencyId: 27, importance: 3, description: '控制生产和运营成本' },

      // 房产家居
      { code: 'real_estate', competencyId: 28, importance: 5, description: '管理房产资金和现金流' },
      { code: 'real_estate', competencyId: 26, importance: 5, description: '获取土地和项目融资' },
      { code: 'real_estate', competencyId: 13, importance: 4, description: '拓展房产销售渠道' },
      { code: 'real_estate', competencyId: 11, importance: 4, description: '建立地产品牌知名度' },
      { code: 'real_estate', competencyId: 22, importance: 4, description: '管理房产开发项目' },
      { code: 'real_estate', competencyId: 24, importance: 3, description: '优化建材供应链' },
      { code: 'real_estate', competencyId: 27, importance: 3, description: '控制建设成本' },
      { code: 'real_estate', competencyId: 9, importance: 3, description: '提升购房和装修体验' },

      // 农业科技
      { code: 'agritech', competencyId: 33, importance: 5, description: '应用农业科技创新提高产量' },
      { code: 'agritech', competencyId: 24, importance: 5, description: '优化农产品供应链' },
      { code: 'agritech', competencyId: 13, importance: 4, description: '拓展农产品销售渠道' },
      { code: 'agritech', competencyId: 27, importance: 4, description: '降低农业生产成本' },
      { code: 'agritech', competencyId: 26, importance: 4, description: '获取农业项目融资' },
      { code: 'agritech', competencyId: 11, importance: 3, description: '建立农产品品牌' },
      { code: 'agritech', competencyId: 23, importance: 3, description: '保证农产品质量安全' },
      { code: 'agritech', competencyId: 25, importance: 3, description: '分析农业生产数据' },

      // 先进制造
      { code: 'advanced_manufacturing', competencyId: 23, importance: 5, description: '确保制造质量和精度' },
      { code: 'advanced_manufacturing', competencyId: 24, importance: 5, description: '优化制造供应链' },
      { code: 'advanced_manufacturing', competencyId: 33, importance: 4, description: '应用智能制造技术' },
      { code: 'advanced_manufacturing', competencyId: 21, importance: 4, description: '优化生产流程提高效率' },
      { code: 'advanced_manufacturing', competencyId: 27, importance: 4, description: '严格控制制造成本' },
      { code: 'advanced_manufacturing', competencyId: 31, importance: 3, description: '管理制造技术研发' },
      { code: 'advanced_manufacturing', competencyId: 26, importance: 3, description: '融资购买生产设备' },
      { code: 'advanced_manufacturing', competencyId: 22, importance: 3, description: '管理制造项目进度' },

      // 新能源
      { code: 'new_energy', competencyId: 33, importance: 5, description: '研发新能源技术创新' },
      { code: 'new_energy', competencyId: 26, importance: 5, description: '获取新能源项目大额融资' },
      { code: 'new_energy', competencyId: 31, importance: 4, description: '管理新能源研发项目' },
      { code: 'new_energy', competencyId: 23, importance: 4, description: '确保新能源安全和稳定' },
      { code: 'new_energy', competencyId: 24, importance: 4, description: '建立新能源供应链' },
      { code: 'new_energy', competencyId: 27, importance: 3, description: '降低新能源成本' },
      { code: 'new_energy', competencyId: 2, importance: 3, description: '分析新能源市场机会' },
      { code: 'new_energy', competencyId: 13, importance: 3, description: '拓展新能源客户' },

      // 环保
      { code: 'environmental', competencyId: 33, importance: 5, description: '开发环保技术解决方案' },
      { code: 'environmental', competencyId: 26, importance: 5, description: '获取环保项目融资' },
      { code: 'environmental', competencyId: 23, importance: 4, description: '确保环保标准合规' },
      { code: 'environmental', competencyId: 6, importance: 4, description: '理解环保项目需求' },
      { code: 'environmental', competencyId: 13, importance: 4, description: '拓展政府和企业客户' },
      { code: 'environmental', competencyId: 22, importance: 3, description: '管理环保工程项目' },
      { code: 'environmental', competencyId: 27, importance: 3, description: '控制环保项目成本' },
      { code: 'environmental', competencyId: 11, importance: 3, description: '建立环保品牌形象' },

      // 物流供应链
      { code: 'logistics', competencyId: 24, importance: 5, description: '优化端到端供应链效率' },
      { code: 'logistics', competencyId: 25, importance: 5, description: '分析物流数据优化路线' },
      { code: 'logistics', competencyId: 21, importance: 4, description: '优化仓储和配送流程' },
      { code: 'logistics', competencyId: 27, importance: 4, description: '降低物流运营成本' },
      { code: 'logistics', competencyId: 32, importance: 4, description: '构建智能物流系统' },
      { code: 'logistics', competencyId: 13, importance: 3, description: '拓展物流客户网络' },
      { code: 'logistics', competencyId: 23, importance: 3, description: '保证物流服务质量' },
      { code: 'logistics', competencyId: 22, importance: 3, description: '管理物流项目实施' },

      // 旅游出行
      { code: 'travel_tourism', competencyId: 9, importance: 5, description: '打造极致的旅游体验' },
      { code: 'travel_tourism', competencyId: 11, importance: 5, description: '建立旅游目的地品牌' },
      { code: 'travel_tourism', competencyId: 13, importance: 4, description: '拓展旅游销售渠道' },
      { code: 'travel_tourism', competencyId: 12, importance: 4, description: '策划吸引人的旅游产品' },
      { code: 'travel_tourism', competencyId: 24, importance: 4, description: '管理旅游供应链资源' },
      { code: 'travel_tourism', competencyId: 27, importance: 3, description: '控制旅游运营成本' },
      { code: 'travel_tourism', competencyId: 15, importance: 3, description: '扩大旅游用户群体' },
      { code: 'travel_tourism', competencyId: 23, importance: 3, description: '保证旅游服务质量' },

      // 社交网络
      { code: 'social_network', competencyId: 15, importance: 5, description: '实现用户快速增长和裂变' },
      { code: 'social_network', competencyId: 9, importance: 5, description: '打造吸引人的社交体验' },
      { code: 'social_network', competencyId: 8, importance: 4, description: '快速迭代社交功能' },
      { code: 'social_network', competencyId: 32, importance: 4, description: '构建高并发社交架构' },
      { code: 'social_network', competencyId: 14, importance: 4, description: '分析用户行为数据' },
      { code: 'social_network', competencyId: 26, importance: 3, description: '融资支持用户增长' },
      { code: 'social_network', competencyId: 11, importance: 3, description: '建立社交平台品牌' },
      { code: 'social_network', competencyId: 10, importance: 3, description: '创新社交互动方式' },

      // 本地生活
      { code: 'local_services', competencyId: 13, importance: 5, description: '拓展本地商家和用户' },
      { code: 'local_services', competencyId: 25, importance: 5, description: '分析本地运营数据' },
      { code: 'local_services', competencyId: 21, importance: 4, description: '优化本地服务流程' },
      { code: 'local_services', competencyId: 9, importance: 4, description: '提升本地服务体验' },
      { code: 'local_services', competencyId: 24, importance: 4, description: '管理本地供应链' },
      { code: 'local_services', competencyId: 15, importance: 3, description: '扩大本地用户规模' },
      { code: 'local_services', competencyId: 11, importance: 3, description: '建立本地服务品牌' },
      { code: 'local_services', competencyId: 27, importance: 3, description: '控制运营成本' },

      // 其他
      { code: 'other', competencyId: 1, importance: 4, description: '设计适合自身的商业模式' },
      { code: 'other', competencyId: 2, importance: 4, description: '分析所在行业市场' },
      { code: 'other', competencyId: 3, importance: 4, description: '制定企业发展战略' },
      { code: 'other', competencyId: 16, importance: 3, description: '招聘合适人才' },
      { code: 'other', competencyId: 26, importance: 3, description: '获取创业融资' },
      { code: 'other', competencyId: 35, importance: 3, description: '做出关键决策' },
      { code: 'other', competencyId: 36, importance: 3, description: '有效沟通协作' },
      { code: 'other', competencyId: 39, importance: 3, description: '持续学习成长' },
    ];

    // 3. 插入关联关系
    console.log("🔗 插入行业-能力关联关系...");
    let insertedCount = 0;
    for (const rel of relationshipsData) {
      const industryId = industryMap.get(rel.code);
      if (!industryId) {
        console.warn(`  ⚠️  未找到行业: ${rel.code}`);
        continue;
      }

      await db.insert(industryCompetencies).values({
        industryId,
        competencyId: rel.competencyId,
        importance: rel.importance,
        description: rel.description,
      } as any);

      insertedCount++;
      if (insertedCount % 20 === 0) {
        console.log(`  进度: ${insertedCount}/${relationshipsData.length}`);
      }
    }

    console.log(`✅ 成功插入 ${insertedCount} 条关联关系\n`);
    console.log("🎉 重新建立行业-能力关联完成！");

    await connection.end();
  } catch (error) {
    console.error("\n❌ 错误:", error);
    await connection.end();
    throw error;
  }
}

reseedIndustryCompetencies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
