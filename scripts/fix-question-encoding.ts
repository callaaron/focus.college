import mysql from 'mysql2/promise';

async function fixQuestions() {
  console.log("🔧 修复题库数据编码问题...\n");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://webapp:webapp_password_2024@localhost:3306/competency_system',
    charset: 'utf8mb4'
  });

  try {
    // 步骤1: 删除旧的乱码数据
    console.log("🗑️  删除旧的题库数据...");
    await connection.execute('DELETE FROM assessmentQuestions');
    console.log("✅ 删除完成\n");

    // 步骤2: 插入新的正确编码数据
    console.log("📝 插入新的题库数据（UTF-8编码）...\n");
    
    const questionData = [
      // 能力1: 沟通表达 (通用能力)
      {
        competencyId: 1,
        question: '在团队会议中，我能够清晰地表达自己的观点和想法',
        questionType: 'self_assessment',
        option1: '从不如此',
        option2: '偶尔如此',
        option3: '有时如此',
        option4: '经常如此',
        option5: '总是如此',
        difficulty: 'easy',
        targetLevel: 3
      },
      {
        competencyId: 1,
        question: '当需要向非技术人员解释技术概念时，我能够使用通俗易懂的语言',
        questionType: 'self_assessment',
        option1: '完全做不到',
        option2: '基本做不到',
        option3: '勉强能做到',
        option4: '比较容易做到',
        option5: '非常容易做到',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 1,
        question: '在冲突情况下，我能够保持冷静并寻求双赢的解决方案',
        questionType: 'behavioral',
        option1: '从未如此',
        option2: '很少如此',
        option3: '偶尔如此',
        option4: '经常如此',
        option5: '总是如此',
        difficulty: 'hard',
        targetLevel: 4
      },
      
      // 能力2: 团队协作
      {
        competencyId: 2,
        question: '我能够主动帮助团队成员解决工作中遇到的问题',
        questionType: 'self_assessment',
        option1: '从不主动',
        option2: '很少主动',
        option3: '有时主动',
        option4: '经常主动',
        option5: '总是主动',
        difficulty: 'easy',
        targetLevel: 4
      },
      {
        competencyId: 2,
        question: '在跨部门合作项目中，我能够有效地协调各方资源和需求',
        questionType: 'scenario',
        option1: '完全无法协调',
        option2: '勉强能协调',
        option3: '基本能协调',
        option4: '很好地协调',
        option5: '完美地协调',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 2,
        question: '面对团队成员的不同意见时，我能够倾听并整合各方观点',
        questionType: 'behavioral',
        option1: '从不倾听',
        option2: '很少倾听',
        option3: '有时倾听',
        option4: '经常倾听',
        option5: '总是倾听并整合',
        difficulty: 'medium',
        targetLevel: 5
      },
      
      // 能力3: 问题解决
      {
        competencyId: 3,
        question: '当遇到复杂问题时，我能够系统地分析并找出根本原因',
        questionType: 'self_assessment',
        option1: '完全做不到',
        option2: '勉强能做到',
        option3: '基本能做到',
        option4: '很好地做到',
        option5: '非常出色地做到',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 3,
        question: '我能够在压力下快速做出合理的决策',
        questionType: 'behavioral',
        option1: '从不能',
        option2: '很少能',
        option3: '有时能',
        option4: '经常能',
        option5: '总是能',
        difficulty: 'hard',
        targetLevel: 5
      },
      {
        competencyId: 3,
        question: '面对突发状况，我能够灵活调整计划并找到替代方案',
        questionType: 'scenario',
        option1: '完全无法调整',
        option2: '勉强能调整',
        option3: '基本能调整',
        option4: '很好地调整',
        option5: '完美地调整',
        difficulty: 'hard',
        targetLevel: 4
      },
      
      // 能力4: 学习能力
      {
        competencyId: 4,
        question: '我能够快速掌握新的工具、技术或知识',
        questionType: 'self_assessment',
        option1: '非常慢',
        option2: '比较慢',
        option3: '一般速度',
        option4: '比较快',
        option5: '非常快',
        difficulty: 'easy',
        targetLevel: 4
      },
      {
        competencyId: 4,
        question: '我会主动寻找学习机会，不断提升自己的专业能力',
        questionType: 'behavioral',
        option1: '从不主动',
        option2: '很少主动',
        option3: '有时主动',
        option4: '经常主动',
        option5: '持续主动',
        difficulty: 'easy',
        targetLevel: 5
      },
      {
        competencyId: 4,
        question: '面对失败或挫折，我能够从中吸取经验教训并改进',
        questionType: 'behavioral',
        option1: '从不反思',
        option2: '很少反思',
        option3: '有时反思',
        option4: '经常反思',
        option5: '总是深度反思',
        difficulty: 'medium',
        targetLevel: 5
      },
      
      // 能力5: 时间管理
      {
        competencyId: 5,
        question: '我能够合理安排工作优先级，确保重要任务按时完成',
        questionType: 'self_assessment',
        option1: '从不能',
        option2: '很少能',
        option3: '有时能',
        option4: '经常能',
        option5: '总是能',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 5,
        question: '在多任务并行的情况下，我能够有效地分配时间和精力',
        questionType: 'scenario',
        option1: '完全无法分配',
        option2: '勉强能分配',
        option3: '基本能分配',
        option4: '很好地分配',
        option5: '完美地分配',
        difficulty: 'hard',
        targetLevel: 4
      },
      {
        competencyId: 5,
        question: '我能够准确估算任务所需时间，并制定切实可行的计划',
        questionType: 'self_assessment',
        option1: '从不准确',
        option2: '很少准确',
        option3: '有时准确',
        option4: '经常准确',
        option5: '总是准确',
        difficulty: 'medium',
        targetLevel: 4
      },
      
      // 能力6: 需求分析 (产品创新领域)
      {
        competencyId: 6,
        question: '我能够通过用户访谈深入挖掘用户的真实需求',
        questionType: 'self_assessment',
        option1: '完全做不到',
        option2: '勉强能做到',
        option3: '基本能做到',
        option4: '很好地做到',
        option5: '非常出色地做到',
        difficulty: 'medium',
        targetLevel: 5
      },
      {
        competencyId: 6,
        question: '我能够从用户反馈中识别出产品改进的关键机会点',
        questionType: 'behavioral',
        option1: '从不能识别',
        option2: '很少能识别',
        option3: '有时能识别',
        option4: '经常能识别',
        option5: '总是能准确识别',
        difficulty: 'hard',
        targetLevel: 5
      },
      {
        competencyId: 6,
        question: '在定义产品需求时，我能够平衡用户需求和商业目标',
        questionType: 'scenario',
        option1: '完全无法平衡',
        option2: '勉强能平衡',
        option3: '基本能平衡',
        option4: '很好地平衡',
        option5: '完美地平衡',
        difficulty: 'hard',
        targetLevel: 5
      },
      
      // 能力7: 产品设计
      {
        competencyId: 7,
        question: '我能够设计出用户体验良好的产品功能和交互流程',
        questionType: 'self_assessment',
        option1: '完全做不到',
        option2: '勉强能做到',
        option3: '基本能做到',
        option4: '很好地做到',
        option5: '非常出色地做到',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 7,
        question: '我能够通过原型设计快速验证产品想法的可行性',
        questionType: 'behavioral',
        option1: '从不使用原型',
        option2: '很少使用',
        option3: '有时使用',
        option4: '经常使用',
        option5: '总是快速验证',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 7,
        question: '在产品设计中，我能够考虑不同用户场景和边界情况',
        questionType: 'scenario',
        option1: '从不考虑',
        option2: '很少考虑',
        option3: '有时考虑',
        option4: '经常考虑',
        option5: '总是全面考虑',
        difficulty: 'hard',
        targetLevel: 5
      },
      
      // 能力8: 数据分析
      {
        competencyId: 8,
        question: '我能够通过数据分析发现产品使用中的关键问题',
        questionType: 'self_assessment',
        option1: '完全做不到',
        option2: '勉强能做到',
        option3: '基本能做到',
        option4: '很好地做到',
        option5: '非常出色地做到',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 8,
        question: '我能够建立有效的指标体系来衡量产品表现',
        questionType: 'knowledge',
        option1: '完全不了解',
        option2: '了解一点',
        option3: '基本了解',
        option4: '比较精通',
        option5: '非常精通',
        difficulty: 'hard',
        targetLevel: 4
      },
      {
        competencyId: 8,
        question: '我能够基于数据洞察提出产品优化建议',
        questionType: 'behavioral',
        option1: '从不提出',
        option2: '很少提出',
        option3: '有时提出',
        option4: '经常提出',
        option5: '总是提出有价值的建议',
        difficulty: 'hard',
        targetLevel: 5
      },
      
      // 能力9: 用户研究
      {
        competencyId: 9,
        question: '我能够设计并执行有效的用户调研方案',
        questionType: 'self_assessment',
        option1: '完全做不到',
        option2: '勉强能做到',
        option3: '基本能做到',
        option4: '很好地做到',
        option5: '非常出色地做到',
        difficulty: 'medium',
        targetLevel: 4
      },
      {
        competencyId: 9,
        question: '我能够从用户行为数据中提取有价值的洞察',
        questionType: 'behavioral',
        option1: '从不能提取',
        option2: '很少能提取',
        option3: '有时能提取',
        option4: '经常能提取',
        option5: '总是能提取深刻洞察',
        difficulty: 'hard',
        targetLevel: 5
      },
      {
        competencyId: 9,
        question: '我能够建立用户画像并用于指导产品决策',
        questionType: 'scenario',
        option1: '完全不会',
        option2: '勉强能建立',
        option3: '基本能建立',
        option4: '很好地建立和应用',
        option5: '完美地建立和应用',
        difficulty: 'hard',
        targetLevel: 4
      },
      
      // 能力10: 创新思维
      {
        competencyId: 10,
        question: '我能够从不同角度思考问题，提出创新的解决方案',
        questionType: 'self_assessment',
        option1: '从不如此',
        option2: '很少如此',
        option3: '有时如此',
        option4: '经常如此',
        option5: '总是如此',
        difficulty: 'medium',
        targetLevel: 5
      },
      {
        competencyId: 10,
        question: '面对行业现状，我能够挑战传统做法并探索新的可能性',
        questionType: 'behavioral',
        option1: '从不挑战',
        option2: '很少挑战',
        option3: '有时挑战',
        option4: '经常挑战',
        option5: '总是积极探索',
        difficulty: 'hard',
        targetLevel: 5
      },
      {
        competencyId: 10,
        question: '我能够将不同领域的知识融合，创造出新的价值',
        questionType: 'scenario',
        option1: '完全做不到',
        option2: '勉强能做到',
        option3: '基本能做到',
        option4: '很好地做到',
        option5: '非常出色地做到',
        difficulty: 'hard',
        targetLevel: 5
      }
    ];

    // 使用参数化查询插入数据
    const insertQuery = `
      INSERT INTO assessmentQuestions (
        competencyId, question, questionType,
        option1, option2, option3, option4, option5,
        score1, score2, score3, score4, score5,
        difficulty, targetLevel, isActive, sortOrder
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 20, 40, 60, 80, 100, ?, ?, true, ?)
    `;

    let insertCount = 0;
    for (let i = 0; i < questionData.length; i++) {
      const q = questionData[i];
      await connection.execute(insertQuery, [
        q.competencyId,
        q.question,
        q.questionType,
        q.option1,
        q.option2,
        q.option3,
        q.option4,
        q.option5,
        q.difficulty,
        q.targetLevel,
        i + 1 // sortOrder
      ]);
      insertCount++;
      console.log(`✅ 插入题目 ${insertCount}/${questionData.length}: ${q.question.substring(0, 30)}...`);
    }

    console.log(`\n🎉 成功插入 ${insertCount} 条题库数据！`);

    // 验证插入的数据
    console.log("\n🔍 验证插入的数据...");
    const [verifyRows] = await connection.query<any[]>(
      'SELECT id, question, option1, competencyId FROM assessmentQuestions LIMIT 5'
    );
    
    console.log("\n前5条数据预览:");
    for (const row of verifyRows) {
      console.log(`ID ${row.id} (能力${row.competencyId}): ${row.question}`);
      console.log(`  选项1: ${row.option1}`);
    }

    await connection.end();
    console.log("\n✅ 修复完成！");
    process.exit(0);
  } catch (error) {
    console.error("❌ 修复失败:", error);
    await connection.end();
    process.exit(1);
  }
}

fixQuestions();
