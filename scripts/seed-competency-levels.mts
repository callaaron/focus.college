/**
 * L1-L5 行为锚定标准迁移脚本
 * 将 shared/competencyData.ts 中的 35 能力的 L1-L5 描述，
 * 通过语义映射，迁移到 DB 的 40 能力的 levelStandards 字段。
 *
 * 运行方式:
 * node --experimental-strip-types scripts/seed-competency-levels.mts
 */
import { competencyDatabase } from '../shared/competencyData.ts';
import mysql from 'mysql2/promise';

// DB 40 能力名 → competencyData.ts 35 能力名的语义映射
const mapping: Record<string, string> = {
  // 战略领导力域
  '商业模式设计': '商业模式创新',
  '战略规划': '战略规划与执行',
  '市场分析': '市场洞察与分析',
  '竞争策略': '市场洞察与分析',
  '商业洞察': '市场洞察与分析',
  // 产品创新域
  '需求分析': '数据驱动决策',
  '产品设计': '敏捷迭代',
  '产品迭代': '敏捷迭代',
  '用户体验': '同理心',
  '创新思维': '商业模式创新',
  // 市场营销域
  '品牌建设': '沟通与影响力',
  '营销策划': '沟通与影响力',
  '渠道拓展': '资源配置优化',
  '数据分析': '数据驱动决策',
  '用户增长': '市场洞察与分析',
  // 团队管理域
  '人才招聘': '人才招聘与选拔',
  '团队激励': '激励与认可',
  '绩效管理': '绩效管理',
  '组织文化': '文化塑造',
  '冲突处理': '冲突解决',
  // 运营管理域
  '流程优化': '流程优化',
  '项目管理': '项目管理',
  '质量管控': '质量管理',
  '风险控制': '风险识别与应对',
  '成本管理': '成本控制',
  // 财务能力域
  '财务规划': '目标管理与分解',
  '资本运作': '资源配置优化',
  '成本管控': '成本控制',
  '投资判断': '决策力',
  '合规管理': '风险识别与应对',
  // 资源整合域
  '人脉拓展': '跨部门协作',
  '资源整合': '资源配置优化',
  '合作谈判': '沟通与影响力',
  '供应链管理': '供应链协调',
  '政企关系': '跨部门协作',
  // 创业心态域
  '抗压能力': '压力应对',
  '决策魄力': '决策力',
  '自我迭代': '成长型思维',
  '领导魅力': '沟通与影响力',
  '社会责任': '长期主义',
};

async function main() {
  const conn = await mysql.createConnection({
    socketPath: '/Users/panda/mysql/mysql.sock',
    user: 'webapp',
    password: 'webapp_password_2024',
    database: 'competency_system',
  });

  console.log(`📋 找到 ${competencyDatabase.length} 个源能力`);
  console.log(`🎯 需要迁移 ${Object.keys(mapping).length} 个目标能力\n`);

  let success = 0;
  let skipped = 0;

  for (const [dbCompName, sourceCompName] of Object.entries(mapping)) {
    const source = competencyDatabase.find(c => c.name === sourceCompName);
    if (!source) {
      console.log(`⚠️  未找到源能力: ${sourceCompName} (目标: ${dbCompName})`);
      skipped++;
      continue;
    }

    const levelStandards = JSON.stringify(source.levels);

    const [result] = await conn.execute(
      'UPDATE competencies SET levelStandards = ? WHERE name = ?',
      [levelStandards, dbCompName]
    );

    const affected = (result as any).affectedRows;
    if (affected > 0) {
      console.log(`✅ ${dbCompName.padEnd(8)} ← ${sourceCompName}`);
      success++;
    } else {
      console.log(`❌ 未找到 DB 能力: ${dbCompName}`);
      skipped++;
    }
  }

  // 验证
  const [rows] = await conn.execute(
    'SELECT COUNT(*) as count FROM competencies WHERE levelStandards IS NOT NULL'
  );
  const count = (rows as any)[0].count;

  console.log(`\n📊 迁移完成: ${success} 成功, ${skipped} 跳过`);
  console.log(`📈 DB 中 ${count}/40 个能力已拥有 L1-L5 行为锚定标准`);

  await conn.end();
}

main().catch(err => {
  console.error('❌ 迁移失败:', err);
  process.exit(1);
});
