#!/usr/bin/env node
/**
 * Seed assessment questions for competency evaluation
 * This script creates initial question bank for the system
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { assessmentQuestions, competencies } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

console.log('🌱 Seeding Assessment Questions...\n');

// Sample questions for different competencies
const sampleQuestions = [
  // 战略思维相关题目
  {
    competencyId: 1, // Assuming competency ID 1 is strategic thinking
    question: "当面对公司重大战略决策时，你通常如何处理？",
    questionType: "self_assessment",
    option1: "主要依赖上级指示，按照既定方针执行",
    option2: "会查阅行业资料，但决策主要基于经验",
    option3: "系统分析市场环境，结合数据做出判断",
    option4: "从多维度深入研究，制定详细的战略方案",
    option5: "能够前瞻性地识别机会，制定创新战略并推动执行",
    difficulty: "hard",
    targetLevel: 4,
  },
  {
    competencyId: 1,
    question: "在制定年度规划时，你会如何平衡短期目标和长期愿景？",
    questionType: "behavioral",
    option1: "主要关注当前季度的业绩目标",
    option2: "会考虑半年到一年的发展计划",
    option3: "制定1-3年的中期规划，并分阶段执行",
    option4: "建立3-5年战略蓝图，并定期回顾调整",
    option5: "构建长期愿景，同时确保每个短期目标都与之对齐",
    difficulty: "medium",
    targetLevel: 3,
  },
  
  // 团队管理相关题目
  {
    competencyId: 2, // Assuming competency ID 2 is team management
    question: "当团队成员之间发生冲突时，你通常如何处理？",
    questionType: "scenario",
    option1: "避免介入，让他们自行解决",
    option2: "简单调解，要求双方相互妥协",
    option3: "深入了解冲突原因，协调双方达成共识",
    option4: "建立冲突解决机制，从根源上预防和化解矛盾",
    option5: "将冲突转化为团队成长机会，建立更强的协作文化",
    difficulty: "medium",
    targetLevel: 3,
  },
  {
    competencyId: 2,
    question: "你如何评估团队成员的绩效？",
    questionType: "self_assessment",
    option1: "主要基于个人感觉和印象",
    option2: "参考KPI完成情况",
    option3: "结合KPI、工作态度和团队贡献",
    option4: "建立多维度评估体系，包括360度反馈",
    option5: "实施持续绩效管理，关注成长而非单次评估",
    difficulty: "easy",
    targetLevel: 2,
  },
  
  // 沟通表达相关题目
  {
    competencyId: 3, // Assuming competency ID 3 is communication
    question: "在向高层汇报项目时，你会如何准备？",
    questionType: "behavioral",
    option1: "口头简单介绍项目进展",
    option2: "准备PPT，列出关键数据",
    option3: "结构化呈现，突出重点和风险",
    option4: "针对听众需求定制内容，预判可能的问题",
    option5: "讲故事般呈现，既有数据支撑又能打动人心",
    difficulty: "medium",
    targetLevel: 4,
  },
  
  // 数据分析相关题目
  {
    competencyId: 4, // Assuming competency ID 4 is data analysis
    question: "当需要分析业务数据时，你的通常做法是？",
    questionType: "self_assessment",
    option1: "查看基础报表，了解大致趋势",
    option2: "使用Excel进行简单的数据统计",
    option3: "运用多种分析方法，识别关键驱动因素",
    option4: "建立分析模型，进行深度挖掘和预测",
    option5: "构建数据驱动的决策体系，持续优化业务",
    difficulty: "medium",
    targetLevel: 3,
  },
  
  // 问题解决相关题目
  {
    competencyId: 5, // Assuming competency ID 5 is problem solving
    question: "面对复杂问题时，你会采用什么方法？",
    questionType: "scenario",
    option1: "凭直觉和经验快速决策",
    option2: "列出可能的解决方案，选择最可行的",
    option3: "系统分析问题根源，制定针对性方案",
    option4: "运用结构化方法论（如5Why、鱼骨图等）",
    option5: "建立问题解决框架，能够应对各种复杂情况",
    difficulty: "hard",
    targetLevel: 4,
  },
  
  // 创新思维相关题目
  {
    competencyId: 6, // Assuming competency ID 6 is innovation
    question: "你如何在团队中推动创新？",
    questionType: "behavioral",
    option1: "偶尔尝试新想法，但不敢冒太大风险",
    option2: "鼓励团队提出想法，选择性尝试",
    option3: "建立创新机制，定期组织头脑风暴",
    option4: "营造创新文化，容错失败，快速迭代",
    option5: "建立创新管理体系，从想法到落地形成闭环",
    difficulty: "hard",
    targetLevel: 5,
  },
  
  // 执行力相关题目
  {
    competencyId: 7, // Assuming competency ID 7 is execution
    question: "你如何确保项目按时交付？",
    questionType: "self_assessment",
    option1: "主要靠个人努力加班完成",
    option2: "制定简单的时间计划",
    option3: "分解任务，设置里程碑，跟踪进度",
    option4: "运用项目管理工具，风险前置管理",
    option5: "建立敏捷交付体系，持续优化效率",
    difficulty: "medium",
    targetLevel: 3,
  },
  
  // 学习能力相关题目
  {
    competencyId: 8, // Assuming competency ID 8 is learning ability
    question: "你如何保持专业知识的更新？",
    questionType: "self_assessment",
    option1: "偶尔读读文章，被动接收信息",
    option2: "定期阅读行业资讯和书籍",
    option3: "主动学习新技能，参加培训和分享",
    option4: "建立系统的学习体系，输出学习成果",
    option5: "持续学习并应用，成为领域专家和传播者",
    difficulty: "easy",
    targetLevel: 3,
  },
  
  // 决策能力相关题目
  {
    competencyId: 9, // Assuming competency ID 9 is decision making
    question: "在信息不完整的情况下，你如何做出决策？",
    questionType: "scenario",
    option1: "等待更多信息，推迟决策",
    option2: "基于现有信息快速决定",
    option3: "评估风险，设置决策前提条件",
    option4: "运用决策框架，平衡速度和质量",
    option5: "建立快速决策机制，错了快速纠正",
    difficulty: "hard",
    targetLevel: 4,
  },
];

async function seedQuestions() {
  try {
    console.log('📋 Checking competencies table...');
    const comps = await db.select().from(competencies).limit(10);
    console.log(`Found ${comps.length} competencies in database\n`);
    
    if (comps.length === 0) {
      console.warn('⚠️  Warning: No competencies found. Questions will reference non-existent competencies.');
      console.warn('   Please seed competencies first before running this script.\n');
    }
    
    console.log('💾 Inserting sample questions...\n');
    
    for (let i = 0; i < sampleQuestions.length; i++) {
      const q = sampleQuestions[i];
      try {
        await db.insert(assessmentQuestions).values(q);
        console.log(`✓ Question ${i + 1}/${sampleQuestions.length}: ${q.question.substring(0, 40)}...`);
      } catch (error) {
        console.error(`✗ Failed to insert question ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully seeded ${sampleQuestions.length} questions!`);
    console.log('\n📊 Question Distribution:');
    console.log(`   - Self Assessment: ${sampleQuestions.filter(q => q.questionType === 'self_assessment').length}`);
    console.log(`   - Behavioral: ${sampleQuestions.filter(q => q.questionType === 'behavioral').length}`);
    console.log(`   - Scenario: ${sampleQuestions.filter(q => q.questionType === 'scenario').length}`);
    console.log(`\n📈 Difficulty Distribution:`);
    console.log(`   - Easy: ${sampleQuestions.filter(q => q.difficulty === 'easy').length}`);
    console.log(`   - Medium: ${sampleQuestions.filter(q => q.difficulty === 'medium').length}`);
    console.log(`   - Hard: ${sampleQuestions.filter(q => q.difficulty === 'hard').length}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Add more questions for each competency (target: 3-5 per competency)');
    console.log('   2. Review and adjust difficulty levels');
    console.log('   3. Test question flow in Assessment page');
    console.log('   4. Collect user feedback and iterate');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seedQuestions()
  .then(() => {
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
