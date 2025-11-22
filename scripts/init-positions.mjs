#!/usr/bin/env node
/**
 * 初始化职位数据
 * 
 * 创建50个常见管理职位，覆盖从基层到高层的各个级别
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// 50个职位定义
const positionsData = [
  // ========== 高管级别 (Executive) ==========
  { name: 'CEO/创始人', code: 'ceo', category: '高管', level: 'executive', description: '公司最高管理者，负责整体战略和运营', keyResponsibilities: '制定公司战略;管理高管团队;对外代表公司;融资和投资者关系;企业文化建设' },
  { name: 'CTO/技术副总裁', code: 'cto', category: '高管', level: 'executive', description: '技术负责人，负责技术战略和研发', keyResponsibilities: '技术战略规划;技术团队管理;技术架构决策;创新推动;技术人才培养' },
  { name: 'COO/运营副总裁', code: 'coo', category: '高管', level: 'executive', description: '运营负责人，负责日常运营管理', keyResponsibilities: '运营体系搭建;流程优化;跨部门协调;运营效率提升;执行力保障' },
  { name: 'CFO/财务副总裁', code: 'cfo', category: '高管', level: 'executive', description: '财务负责人，负责财务战略和管理', keyResponsibilities: '财务战略规划;资金管理;财务合规;投融资;成本控制' },
  { name: 'CPO/产品副总裁', code: 'cpo', category: '高管', level: 'executive', description: '产品负责人，负责产品战略和管理', keyResponsibilities: '产品战略规划;产品线管理;用户体验;产品创新;产品团队管理' },
  { name: 'CMO/市场副总裁', code: 'cmo', category: '高管', level: 'executive', description: '市场负责人，负责市场战略和品牌', keyResponsibilities: '市场战略;品牌建设;营销推广;市场洞察;增长策略' },
  { name: 'CHO/人力资源副总裁', code: 'cho', category: '高管', level: 'executive', description: '人力资源负责人，负责人才战略', keyResponsibilities: '人才战略;组织发展;企业文化;绩效管理;人才培养' },
  { name: 'CGO/增长副总裁', code: 'cgo', category: '高管', level: 'executive', description: '增长负责人，负责用户和收入增长', keyResponsibilities: '增长战略;增长实验;数据分析;渠道拓展;转化优化' },
  
  // ========== 高级管理者 (Senior) ==========
  { name: '事业部总经理', code: 'bu_gm', category: '高级管理', level: 'senior', description: '事业部最高负责人', keyResponsibilities: '事业部战略;P&L负责;团队管理;业务增长;资源协调' },
  { name: '技术总监', code: 'tech_director', category: '技术', level: 'senior', description: '技术部门负责人', keyResponsibilities: '技术规划;架构设计;团队管理;技术攻关;质量保障' },
  { name: '产品总监', code: 'product_director', category: '产品', level: 'senior', description: '产品部门负责人', keyResponsibilities: '产品规划;需求管理;用户研究;产品迭代;跨部门协作' },
  { name: '运营总监', code: 'operations_director', category: '运营', level: 'senior', description: '运营部门负责人', keyResponsibilities: '运营策略;用户增长;活动策划;数据分析;团队管理' },
  { name: '市场总监', code: 'marketing_director', category: '市场', level: 'senior', description: '市场部门负责人', keyResponsibilities: '市场策略;品牌推广;营销活动;预算管理;效果评估' },
  { name: '销售总监', code: 'sales_director', category: '销售', level: 'senior', description: '销售部门负责人', keyResponsibilities: '销售策略;目标达成;团队管理;客户关系;渠道拓展' },
  { name: '人力资源总监', code: 'hr_director', category: '人力资源', level: 'senior', description: 'HR部门负责人', keyResponsibilities: '招聘;培训发展;绩效管理;薪酬福利;员工关系' },
  { name: '财务总监', code: 'finance_director', category: '财务', level: 'senior', description: '财务部门负责人', keyResponsibilities: '财务规划;预算管理;成本控制;财务报告;税务筹划' },
  { name: '设计总监', code: 'design_director', category: '设计', level: 'senior', description: '设计部门负责人', keyResponsibilities: '设计战略;品牌视觉;用户体验;设计规范;团队管理' },
  { name: '数据总监', code: 'data_director', category: '数据', level: 'senior', description: '数据部门负责人', keyResponsibilities: '数据战略;数据架构;数据分析;数据产品;团队建设' },
  { name: '客户成功总监', code: 'cs_director', category: '客户成功', level: 'senior', description: '客户成功部门负责人', keyResponsibilities: '客户成功策略;续费率;客户健康度;团队管理;客户价值' },
  
  // ========== 中层管理者 (Middle) ==========
  { name: '产品经理', code: 'product_manager', category: '产品', level: 'middle', description: '产品线负责人', keyResponsibilities: '需求分析;产品设计;项目推进;数据跟踪;用户反馈' },
  { name: '高级产品经理', code: 'senior_pm', category: '产品', level: 'middle', description: '资深产品经理', keyResponsibilities: '产品策略;复杂需求;团队协作;商业分析;产品创新' },
  { name: '技术经理', code: 'tech_manager', category: '技术', level: 'middle', description: '技术团队管理者', keyResponsibilities: '技术方案;代码质量;团队管理;进度管控;技术分享' },
  { name: '架构师', code: 'architect', category: '技术', level: 'middle', description: '技术架构负责人', keyResponsibilities: '系统架构;技术选型;性能优化;技术规范;技术评审' },
  { name: '研发经理', code: 'dev_manager', category: '技术', level: 'middle', description: '研发团队管理者', keyResponsibilities: '项目管理;团队管理;技术攻关;质量把控;人才培养' },
  { name: '运营经理', code: 'operations_manager', category: '运营', level: 'middle', description: '运营团队管理者', keyResponsibilities: '运营策划;用户运营;内容运营;活动执行;数据分析' },
  { name: '增长经理', code: 'growth_manager', category: '增长', level: 'middle', description: '增长团队负责人', keyResponsibilities: '增长策略;实验设计;数据分析;渠道优化;转化提升' },
  { name: '市场经理', code: 'marketing_manager', category: '市场', level: 'middle', description: '市场营销负责人', keyResponsibilities: '营销策划;活动执行;媒体投放;效果分析;预算管理' },
  { name: '销售经理', code: 'sales_manager', category: '销售', level: 'middle', description: '销售团队管理者', keyResponsibilities: '销售目标;客户开发;团队管理;销售流程;客户关系' },
  { name: '客户经理', code: 'account_manager', category: '客户', level: 'middle', description: '大客户管理者', keyResponsibilities: '客户关系;需求挖掘;方案设计;续约维护;客户满意度' },
  { name: '项目经理', code: 'project_manager', category: '项目管理', level: 'middle', description: '项目管理者', keyResponsibilities: '项目规划;进度管理;资源协调;风险管控;交付保障' },
  { name: 'HR经理', code: 'hr_manager', category: '人力资源', level: 'middle', description: 'HR团队管理者', keyResponsibilities: '招聘管理;培训组织;绩效实施;员工关系;政策落地' },
  { name: '设计经理', code: 'design_manager', category: '设计', level: 'middle', description: '设计团队管理者', keyResponsibilities: '设计管理;设计评审;团队协作;视觉规范;用户体验' },
  { name: '数据分析师', code: 'data_analyst', category: '数据', level: 'middle', description: '数据分析专家', keyResponsibilities: '数据分析;报告产出;指标体系;业务洞察;数据可视化' },
  { name: '用户研究经理', code: 'user_research', category: '用户研究', level: 'middle', description: '用户研究负责人', keyResponsibilities: '用户调研;需求洞察;用户画像;可用性测试;研究报告' },
  
  // ========== 基层管理者 (Junior) ==========
  { name: '团队Leader', code: 'team_lead', category: '团队管理', level: 'junior', description: '小团队负责人', keyResponsibilities: '任务分配;进度跟踪;团队协作;问题解决;个人成长' },
  { name: '技术Lead', code: 'tech_lead', category: '技术', level: 'junior', description: '技术小组负责人', keyResponsibilities: '技术方案;代码审查;技术指导;技术分享;项目推进' },
  { name: '产品组长', code: 'product_lead', category: '产品', level: 'junior', description: '产品小组负责人', keyResponsibilities: '需求管理;产品设计;项目协调;用户反馈;迭代优化' },
  { name: '运营主管', code: 'operations_lead', category: '运营', level: 'junior', description: '运营小组负责人', keyResponsibilities: '活动策划;内容运营;用户运营;数据分析;流程优化' },
  { name: '销售主管', code: 'sales_lead', category: '销售', level: 'junior', description: '销售小组负责人', keyResponsibilities: '销售任务;客户开发;团队辅导;销售技巧;目标达成' },
  { name: '市场主管', code: 'marketing_lead', category: '市场', level: 'junior', description: '市场小组负责人', keyResponsibilities: '营销执行;渠道管理;活动组织;数据跟踪;方案优化' },
  { name: '设计主管', code: 'design_lead', category: '设计', level: 'junior', description: '设计小组负责人', keyResponsibilities: '设计执行;设计评审;团队协作;设计规范;视觉优化' },
  { name: '客服主管', code: 'cs_lead', category: '客户服务', level: 'junior', description: '客服团队负责人', keyResponsibilities: '客服管理;问题解决;满意度;流程优化;团队培训' },
  { name: '内容主管', code: 'content_lead', category: '内容', level: 'junior', description: '内容团队负责人', keyResponsibilities: '内容策划;内容生产;内容审核;数据分析;内容优化' },
  { name: '测试主管', code: 'qa_lead', category: '质量', level: 'junior', description: '测试团队负责人', keyResponsibilities: '测试计划;用例设计;缺陷管理;质量保障;自动化推进' },
  { name: '商务主管', code: 'bd_lead', category: '商务', level: 'junior', description: '商务团队负责人', keyResponsibilities: '商务拓展;合作洽谈;合同管理;关系维护;资源整合' },
  { name: '培训主管', code: 'training_lead', category: '培训', level: 'junior', description: '培训团队负责人', keyResponsibilities: '培训体系;课程设计;讲师管理;培训执行;效果评估' },
  { name: '行政主管', code: 'admin_lead', category: '行政', level: 'junior', description: '行政团队负责人', keyResponsibilities: '行政管理;后勤保障;费用管理;供应商管理;办公环境' },
  { name: '财务主管', code: 'finance_lead', category: '财务', level: 'junior', description: '财务团队负责人', keyResponsibilities: '财务核算;报表编制;预算跟踪;费用审核;财务合规' },
  { name: '采购主管', code: 'procurement_lead', category: '采购', level: 'junior', description: '采购团队负责人', keyResponsibilities: '采购管理;供应商管理;成本控制;合同管理;质量监督' }
];

async function main() {
  console.log('🚀 开始初始化职位数据...\n');
  
  // 创建数据库连接
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // 1. 清空现有数据
    console.log('📝 清空现有职位数据...');
    await connection.query('DELETE FROM positionCompetencies');
    await connection.query('DELETE FROM positions');
    console.log('✅ 现有数据已清空\n');
    
    // 2. 插入职位数据
    console.log('📝 插入职位数据...');
    let executiveCount = 0;
    let seniorCount = 0;
    let middleCount = 0;
    let juniorCount = 0;
    
    for (const position of positionsData) {
      await db.insert(positions).values(position);
      console.log(`   ✓ [${position.level}] ${position.name}`);
      
      // 统计各级别数量
      if (position.level === 'executive') executiveCount++;
      else if (position.level === 'senior') seniorCount++;
      else if (position.level === 'middle') middleCount++;
      else if (position.level === 'junior') juniorCount++;
    }
    console.log(`✅ 已插入 ${positionsData.length} 个职位\n`);
    
    // 3. 验证数据
    const [count] = await connection.query('SELECT COUNT(*) as count FROM positions');
    console.log('📊 数据统计:');
    console.log(`   - 总职位数: ${count[0].count} 个`);
    console.log(`   - 高管级别 (Executive): ${executiveCount} 个`);
    console.log(`   - 高级管理 (Senior): ${seniorCount} 个`);
    console.log(`   - 中层管理 (Middle): ${middleCount} 个`);
    console.log(`   - 基层管理 (Junior): ${juniorCount} 个`);
    console.log();
    
    console.log('✨ 职位数据初始化完成！\n');
    
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
