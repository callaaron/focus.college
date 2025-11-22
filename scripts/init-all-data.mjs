#!/usr/bin/env node
/**
 * 初始化所有基础数据
 * 包括：能力域、能力、行业、职位
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// 8个能力域
const domains = [
  { module: '战略与方向', name: '战略规划', description: '制定和执行长期战略目标的能力', sortOrder: 1 },
  { module: '战略与方向', name: '创新变革', description: '推动创新和变革的能力', sortOrder: 2 },
  { module: '战略与方向', name: '决策思维', description: '做出正确决策的思维能力', sortOrder: 3 },
  { module: '执行与运营', name: '业务执行', description: '高效执行业务目标的能力', sortOrder: 4 },
  { module: '团队与领导力', name: '沟通协作', description: '有效沟通和协作的能力', sortOrder: 5 },
  { module: '团队与领导力', name: '团队管理', description: '管理和发展团队的能力', sortOrder: 6 },
  { module: '团队与领导力', name: '人才发展', description: '培养和发展人才的能力', sortOrder: 7 },
  { module: '自我与心智', name: '自我管理', description: '管理自我情绪和时间的能力', sortOrder: 8 }
];

// 35个能力
const competencies = [
  // 战略规划 (4个)
  { name: '战略规划与执行', category: '战略规划', description: '制定组织长期发展方向并推动落地的能力', sortOrder: 1 },
  { name: '市场洞察与分析', category: '战略规划', description: '识别市场机会和威胁的能力', sortOrder: 2 },
  { name: '目标管理与分解', category: '战略规划', description: '设定清晰目标并分解到可执行层面的能力', sortOrder: 3 },
  { name: '资源配置优化', category: '战略规划', description: '整合和优化内外部资源以实现战略目标的能力', sortOrder: 4 },
  // 创新变革 (3个)
  { name: '商业模式创新', category: '创新变革', description: '设计创新商业模式和盈利方式的能力', sortOrder: 5 },
  { name: '产品创新能力', category: '创新变革', description: '创造有价值的新产品和服务的能力', sortOrder: 6 },
  { name: '组织变革推动', category: '创新变革', description: '推动组织变革和转型的能力', sortOrder: 7 },
  // 决策思维 (4个)
  { name: '数据驱动决策', category: '决策思维', description: '基于数据分析做出科学决策的能力', sortOrder: 8 },
  { name: '风险评估管理', category: '决策思维', description: '识别、评估和管理风险的能力', sortOrder: 9 },
  { name: '问题分析解决', category: '决策思维', description: '系统化分析和解决复杂问题的能力', sortOrder: 10 },
  { name: '系统性思维', category: '决策思维', description: '从整体视角思考和解决问题的能力', sortOrder: 11 },
  // 业务执行 (5个)
  { name: '项目管理执行', category: '业务执行', description: '规划和执行项目以达成目标的能力', sortOrder: 12 },
  { name: '流程优化改进', category: '业务执行', description: '优化业务流程提升效率的能力', sortOrder: 13 },
  { name: '质量标准管控', category: '业务执行', description: '建立和维护高质量标准的能力', sortOrder: 14 },
  { name: '结果导向执行', category: '业务执行', description: '专注结果并高效达成目标的能力', sortOrder: 15 },
  { name: '敏捷响应调整', category: '业务执行', description: '快速响应变化并灵活调整的能力', sortOrder: 16 },
  // 沟通协作 (5个)
  { name: '有效沟通表达', category: '沟通协作', description: '清晰准确地表达观点和想法的能力', sortOrder: 17 },
  { name: '倾听理解能力', category: '沟通协作', description: '深度倾听并理解他人需求的能力', sortOrder: 18 },
  { name: '跨部门协作', category: '沟通协作', description: '协调不同部门共同达成目标的能力', sortOrder: 19 },
  { name: '冲突化解管理', category: '沟通协作', description: '妥善处理和化解冲突的能力', sortOrder: 20 },
  { name: '影响力说服力', category: '沟通协作', description: '影响和说服他人达成共识的能力', sortOrder: 21 },
  // 团队管理 (5个)
  { name: '团队建设发展', category: '团队管理', description: '打造高效团队的能力', sortOrder: 22 },
  { name: '授权赋能下属', category: '团队管理', description: '合理授权并赋能团队成员的能力', sortOrder: 23 },
  { name: '绩效管理激励', category: '团队管理', description: '管理绩效并有效激励团队的能力', sortOrder: 24 },
  { name: '文化价值观塑造', category: '团队管理', description: '塑造积极团队文化和价值观的能力', sortOrder: 25 },
  { name: '凝聚力向心力', category: '团队管理', description: '增强团队凝聚力和向心力的能力', sortOrder: 26 },
  // 人才发展 (4个)
  { name: '人才识别选拔', category: '人才发展', description: '识别和选拔优秀人才的能力', sortOrder: 27 },
  { name: '辅导培养下属', category: '人才发展', description: '辅导和培养下属成长的能力', sortOrder: 28 },
  { name: '继任者计划', category: '人才发展', description: '培养继任者和梯队人才的能力', sortOrder: 29 },
  { name: '学习型组织建设', category: '人才发展', description: '建设学习型组织的能力', sortOrder: 30 },
  // 自我管理 (5个)
  { name: '自我认知反思', category: '自我管理', description: '深度认知自我并持续反思的能力', sortOrder: 31 },
  { name: '情绪管理调节', category: '自我管理', description: '管理和调节自身情绪的能力', sortOrder: 32 },
  { name: '压力应对韧性', category: '自我管理', description: '应对压力和挑战的韧性', sortOrder: 33 },
  { name: '时间精力管理', category: '自我管理', description: '高效管理时间和精力的能力', sortOrder: 34 },
  { name: '持续学习成长', category: '自我管理', description: '保持学习和自我成长的能力', sortOrder: 35 }
];

// 20个行业
const industries = [
  { name: '互联网科技', code: 'tech_internet', description: '互联网、移动互联网、Web3.0等技术驱动的公司', keyCharacteristics: '快速迭代;用户增长导向;技术创新;平台化思维;数据驱动' },
  { name: '企业服务(SaaS)', code: 'enterprise_saas', description: '为企业提供软件服务和解决方案', keyCharacteristics: '订阅制收入;客户成功;产品标准化;规模化扩张;持续服务' },
  { name: '电子商务', code: 'ecommerce', description: '在线零售、B2C、B2B电商平台', keyCharacteristics: 'GMV增长;供应链效率;用户体验;物流配送;营销获客' },
  { name: '金融科技', code: 'fintech', description: '金融服务、支付、借贷、保险等科技金融', keyCharacteristics: '合规要求高;风控体系;数据安全;金融创新;监管合规' },
  { name: '人工智能', code: 'artificial_intelligence', description: 'AI技术研发和应用，包括机器学习、深度学习等', keyCharacteristics: '算法创新;算力需求;数据质量;场景落地;技术壁垒' },
  { name: '医疗健康', code: 'healthcare', description: '医疗服务、医疗器械、生物医药、健康管理', keyCharacteristics: '合规审批;临床验证;长周期;高投入;专业壁垒' },
  { name: '教育培训', code: 'education', description: '在线教育、职业培训、K12教育等', keyCharacteristics: '内容质量;教学效果;获客成本;续费率;口碑传播' },
  { name: '文娱传媒', code: 'media_entertainment', description: '内容制作、短视频、直播、游戏、影视', keyCharacteristics: '内容创意;流量运营;IP开发;变现能力;用户留存' },
  { name: '智能制造', code: 'smart_manufacturing', description: '工业4.0、智能工厂、自动化生产', keyCharacteristics: '技术研发;生产效率;供应链;质量管控;成本控制' },
  { name: '新能源汽车', code: 'new_energy_vehicle', description: '电动汽车、智能驾驶、汽车电子', keyCharacteristics: '技术创新;供应链;制造工艺;品牌营销;充电网络' },
  { name: '消费品牌', code: 'consumer_brand', description: '新消费品牌、快消品、日用品', keyCharacteristics: '品牌建设;渠道布局;产品创新;供应链;用户心智' },
  { name: '房地产建筑', code: 'real_estate', description: '房地产开发、物业管理、建筑工程', keyCharacteristics: '资金周转;项目管理;政策敏感;风险管控;销售去化' },
  { name: '物流供应链', code: 'logistics', description: '物流配送、仓储管理、供应链服务', keyCharacteristics: '效率优化;成本控制;网络覆盖;信息化;时效保障' },
  { name: '餐饮零售', code: 'food_retail', description: '连锁餐饮、便利店、超市等', keyCharacteristics: '标准化;选址能力;运营效率;成本控制;用户体验' },
  { name: '旅游酒店', code: 'tourism_hospitality', description: '旅游服务、酒店管理、民宿', keyCharacteristics: '服务质量;运营效率;季节性;口碑营销;体验设计' },
  { name: '咨询服务', code: 'consulting', description: '管理咨询、战略咨询、财务咨询', keyCharacteristics: '专业能力;客户关系;知识管理;项目交付;品牌影响力' },
  { name: '专业服务', code: 'professional_services', description: '法律、会计、人力资源等专业服务', keyCharacteristics: '专业资质;服务质量;客户信任;合规要求;人才培养' },
  { name: '先进制造', code: 'advanced_manufacturing', description: '高端装备、精密制造、航空航天', keyCharacteristics: '技术门槛;研发投入;质量标准;认证周期;客户粘性' },
  { name: '农业科技', code: 'agritech', description: '现代农业、农业科技、生物技术', keyCharacteristics: '技术应用;规模化;标准化;供应链;市场渠道' },
  { name: '环保能源', code: 'clean_energy', description: '清洁能源、环保技术、碳中和', keyCharacteristics: '政策驱动;技术创新;投资回报;可持续性;社会责任' }
];

// 10个主要职位（简化版）
const positions = [
  { name: 'CEO/创始人', code: 'ceo', category: '高管', level: 'executive', description: '公司最高管理者', keyResponsibilities: '制定公司战略;管理高管团队;对外代表公司;融资和投资者关系;企业文化建设' },
  { name: 'CTO/技术副总裁', code: 'cto', category: '高管', level: 'executive', description: '技术负责人', keyResponsibilities: '技术战略规划;技术团队管理;技术架构决策;创新推动;技术人才培养' },
  { name: 'COO/运营副总裁', code: 'coo', category: '高管', level: 'executive', description: '运营负责人', keyResponsibilities: '运营体系搭建;流程优化;跨部门协调;运营效率提升;执行力保障' },
  { name: '产品总监', code: 'product_director', category: '产品', level: 'senior', description: '产品部门负责人', keyResponsibilities: '产品规划;需求管理;用户研究;产品迭代;跨部门协作' },
  { name: '技术总监', code: 'tech_director', category: '技术', level: 'senior', description: '技术部门负责人', keyResponsibilities: '技术规划;架构设计;团队管理;技术攻关;质量保障' },
  { name: '运营总监', code: 'operations_director', category: '运营', level: 'senior', description: '运营部门负责人', keyResponsibilities: '运营策略;用户增长;活动策划;数据分析;团队管理' },
  { name: '产品经理', code: 'product_manager', category: '产品', level: 'middle', description: '产品线负责人', keyResponsibilities: '需求分析;产品设计;项目推进;数据跟踪;用户反馈' },
  { name: '技术经理', code: 'tech_manager', category: '技术', level: 'middle', description: '技术团队管理者', keyResponsibilities: '技术方案;代码质量;团队管理;进度管控;技术分享' },
  { name: '运营经理', code: 'operations_manager', category: '运营', level: 'middle', description: '运营团队管理者', keyResponsibilities: '运营策划;用户运营;内容运营;活动执行;数据分析' },
  { name: '团队Leader', code: 'team_lead', category: '团队管理', level: 'junior', description: '小团队负责人', keyResponsibilities: '任务分配;进度跟踪;团队协作;问题解决;个人成长' }
];

async function main() {
  console.log('🚀 开始初始化所有基础数据...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // 1. 清空数据
    console.log('📝 清空现有数据...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM competencies');
    await connection.query('DELETE FROM competencyDomains');
    await connection.query('DELETE FROM industries');
    await connection.query('DELETE FROM positions');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ 数据已清空\n');
    
    // 2. 插入能力域
    console.log('📝 插入能力域...');
    for (const domain of domains) {
      await connection.query(
        'INSERT INTO competencyDomains (module, name, description, sortOrder) VALUES (?, ?, ?, ?)',
        [domain.module, domain.name, domain.description, domain.sortOrder]
      );
    }
    console.log(`✅ 已插入 ${domains.length} 个能力域\n`);
    
    // 3. 获取能力域映射
    const [domainRecords] = await connection.query('SELECT id, name FROM competencyDomains');
    const domainMap = {};
    domainRecords.forEach(record => {
      domainMap[record.name] = record.id;
    });
    
    // 4. 插入能力
    console.log('📝 插入能力...');
    for (const comp of competencies) {
      const domainId = domainMap[comp.category];
      await connection.query(
        'INSERT INTO competencies (domainId, name, category, description, isCore, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
        [domainId, comp.name, comp.category, comp.description, true, comp.sortOrder]
      );
    }
    console.log(`✅ 已插入 ${competencies.length} 个能力\n`);
    
    // 5. 插入行业
    console.log('📝 插入行业...');
    for (const industry of industries) {
      await connection.query(
        'INSERT INTO industries (name, code, description, keyCharacteristics) VALUES (?, ?, ?, ?)',
        [industry.name, industry.code, industry.description, industry.keyCharacteristics]
      );
    }
    console.log(`✅ 已插入 ${industries.length} 个行业\n`);
    
    // 6. 插入职位
    console.log('📝 插入职位...');
    for (const position of positions) {
      await connection.query(
        'INSERT INTO positions (name, code, category, level, description, keyResponsibilities) VALUES (?, ?, ?, ?, ?, ?)',
        [position.name, position.code, position.category, position.level, position.description, position.keyResponsibilities]
      );
    }
    console.log(`✅ 已插入 ${positions.length} 个职位\n`);
    
    // 7. 统计
    const [domainCount] = await connection.query('SELECT COUNT(*) as count FROM competencyDomains');
    const [compCount] = await connection.query('SELECT COUNT(*) as count FROM competencies');
    const [indCount] = await connection.query('SELECT COUNT(*) as count FROM industries');
    const [posCount] = await connection.query('SELECT COUNT(*) as count FROM positions');
    
    console.log('📊 数据统计:');
    console.log(`   - 能力域: ${domainCount[0].count} 个`);
    console.log(`   - 能力: ${compCount[0].count} 个`);
    console.log(`   - 行业: ${indCount[0].count} 个`);
    console.log(`   - 职位: ${posCount[0].count} 个`);
    console.log();
    
    console.log('✨ 所有基础数据初始化完成！\n');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
