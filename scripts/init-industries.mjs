#!/usr/bin/env node
/**
 * 初始化行业数据
 * 
 * 创建20个主流行业，涵盖互联网、金融、制造、服务等各个领域
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { industries } from '../drizzle/schema.ts';

// 加载环境变量
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// 20个行业定义
const industriesData = [
  {
    name: '互联网科技',
    code: 'tech_internet',
    description: '互联网、移动互联网、Web3.0等技术驱动的公司',
    keyCharacteristics: '快速迭代;用户增长导向;技术创新;平台化思维;数据驱动'
  },
  {
    name: '企业服务(SaaS)',
    code: 'enterprise_saas',
    description: '为企业提供软件服务和解决方案',
    keyCharacteristics: '订阅制收入;客户成功;产品标准化;规模化扩张;持续服务'
  },
  {
    name: '电子商务',
    code: 'ecommerce',
    description: '在线零售、B2C、B2B电商平台',
    keyCharacteristics: 'GMV增长;供应链效率;用户体验;物流配送;营销获客'
  },
  {
    name: '金融科技',
    code: 'fintech',
    description: '金融服务、支付、借贷、保险等科技金融',
    keyCharacteristics: '合规要求高;风控体系;数据安全;金融创新;监管合规'
  },
  {
    name: '人工智能',
    code: 'artificial_intelligence',
    description: 'AI技术研发和应用，包括机器学习、深度学习等',
    keyCharacteristics: '算法创新;算力需求;数据质量;场景落地;技术壁垒'
  },
  {
    name: '医疗健康',
    code: 'healthcare',
    description: '医疗服务、医疗器械、生物医药、健康管理',
    keyCharacteristics: '合规审批;临床验证;长周期;高投入;专业壁垒'
  },
  {
    name: '教育培训',
    code: 'education',
    description: '在线教育、职业培训、K12教育等',
    keyCharacteristics: '内容质量;教学效果;获客成本;续费率;口碑传播'
  },
  {
    name: '文娱传媒',
    code: 'media_entertainment',
    description: '内容制作、短视频、直播、游戏、影视',
    keyCharacteristics: '内容创意;流量运营;IP开发;变现能力;用户留存'
  },
  {
    name: '智能制造',
    code: 'smart_manufacturing',
    description: '工业4.0、智能工厂、自动化生产',
    keyCharacteristics: '技术研发;生产效率;供应链;质量管控;成本控制'
  },
  {
    name: '新能源汽车',
    code: 'new_energy_vehicle',
    description: '电动汽车、智能驾驶、汽车电子',
    keyCharacteristics: '技术创新;供应链;制造工艺;品牌营销;充电网络'
  },
  {
    name: '消费品牌',
    code: 'consumer_brand',
    description: '新消费品牌、快消品、日用品',
    keyCharacteristics: '品牌建设;渠道布局;产品创新;供应链;用户心智'
  },
  {
    name: '房地产建筑',
    code: 'real_estate',
    description: '房地产开发、物业管理、建筑工程',
    keyCharacteristics: '资金周转;项目管理;政策敏感;风险管控;销售去化'
  },
  {
    name: '物流供应链',
    code: 'logistics',
    description: '物流配送、仓储管理、供应链服务',
    keyCharacteristics: '效率优化;成本控制;网络覆盖;信息化;时效保障'
  },
  {
    name: '餐饮零售',
    code: 'food_retail',
    description: '连锁餐饮、便利店、超市等',
    keyCharacteristics: '标准化;选址能力;运营效率;成本控制;用户体验'
  },
  {
    name: '旅游酒店',
    code: 'tourism_hospitality',
    description: '旅游服务、酒店管理、民宿',
    keyCharacteristics: '服务质量;运营效率;季节性;口碑营销;体验设计'
  },
  {
    name: '咨询服务',
    code: 'consulting',
    description: '管理咨询、战略咨询、财务咨询',
    keyCharacteristics: '专业能力;客户关系;知识管理;项目交付;品牌影响力'
  },
  {
    name: '专业服务',
    code: 'professional_services',
    description: '法律、会计、人力资源等专业服务',
    keyCharacteristics: '专业资质;服务质量;客户信任;合规要求;人才培养'
  },
  {
    name: '先进制造',
    code: 'advanced_manufacturing',
    description: '高端装备、精密制造、航空航天',
    keyCharacteristics: '技术门槛;研发投入;质量标准;认证周期;客户粘性'
  },
  {
    name: '农业科技',
    code: 'agritech',
    description: '现代农业、农业科技、生物技术',
    keyCharacteristics: '技术应用;规模化;标准化;供应链;市场渠道'
  },
  {
    name: '环保能源',
    code: 'clean_energy',
    description: '清洁能源、环保技术、碳中和',
    keyCharacteristics: '政策驱动;技术创新;投资回报;可持续性;社会责任'
  }
];

async function main() {
  console.log('🚀 开始初始化行业数据...\n');
  
  // 创建数据库连接
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // 1. 清空现有数据
    console.log('📝 清空现有行业数据...');
    await connection.query('DELETE FROM industryCompetencies');
    await connection.query('DELETE FROM industries');
    console.log('✅ 现有数据已清空\n');
    
    // 2. 插入行业数据
    console.log('📝 插入行业数据...');
    for (const industry of industriesData) {
      await connection.query(
        'INSERT INTO industries (name, code, description, keyCharacteristics) VALUES (?, ?, ?, ?)',
        [industry.name, industry.code, industry.description, industry.keyCharacteristics]
      );
      console.log(`   ✓ ${industry.name} (${industry.code})`);
    }
    console.log(`✅ 已插入 ${industriesData.length} 个行业\n`);
    
    // 3. 验证数据
    const [count] = await connection.query('SELECT COUNT(*) as count FROM industries');
    console.log('📊 数据统计:');
    console.log(`   - 行业数量: ${count[0].count} 个`);
    console.log();
    
    console.log('✨ 行业数据初始化完成！\n');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行脚本
main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
