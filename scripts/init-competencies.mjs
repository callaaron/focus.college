#!/usr/bin/env node
/**
 * 初始化能力域和能力数据
 * 
 * 这个脚本会：
 * 1. 创建8个能力域（模块）
 * 2. 创建35个细分能力，每个能力关联到对应的域
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// 8个能力域（模块）定义
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

// 35个细分能力定义
const competenciesData = [
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

async function main() {
  console.log('🚀 开始初始化能力数据...\n');
  
  // 创建数据库连接
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // 1. 清空现有数据
    console.log('📝 清空现有数据...');
    await connection.query('DELETE FROM competencies');
    await connection.query('DELETE FROM competencyDomains');
    console.log('✅ 现有数据已清空\n');
    
    // 2. 插入能力域
    console.log('📝 插入能力域数据...');
    for (const domain of domains) {
      await connection.query(
        'INSERT INTO competencyDomains (module, name, description, sortOrder) VALUES (?, ?, ?, ?)',
        [domain.module, domain.name, domain.description, domain.sortOrder]
      );
      console.log(`   ✓ ${domain.module} - ${domain.name}`);
    }
    console.log(`✅ 已插入 ${domains.length} 个能力域\n`);
    
    // 3. 获取能力域ID映射
    const [domainRecords] = await connection.query('SELECT id, name FROM competencyDomains');
    const domainMap = {};
    for (const record of domainRecords) {
      domainMap[record.name] = record.id;
    }
    
    // 4. 插入能力数据
    console.log('📝 插入能力数据...');
    for (const comp of competenciesData) {
      const domainId = domainMap[comp.category];
      if (!domainId) {
        console.warn(`   ⚠️  警告: 找不到能力域 "${comp.category}" 对应的ID，跳过能力 "${comp.name}"`);
        continue;
      }
      
      await connection.query(
        'INSERT INTO competencies (domainId, name, category, description, isCore, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
        [domainId, comp.name, comp.category, comp.description, true, comp.sortOrder]
      );
      console.log(`   ✓ [${comp.category}] ${comp.name}`);
    }
    console.log(`✅ 已插入 ${competenciesData.length} 个能力\n`);
    
    // 5. 验证数据
    const [domainCount] = await connection.query('SELECT COUNT(*) as count FROM competencyDomains');
    const [compCount] = await connection.query('SELECT COUNT(*) as count FROM competencies');
    
    console.log('📊 数据统计:');
    console.log(`   - 能力域: ${domainCount[0].count} 个`);
    console.log(`   - 能力: ${compCount[0].count} 个`);
    console.log();
    
    console.log('✨ 能力数据初始化完成！\n');
    
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
