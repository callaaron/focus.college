import mysql from 'mysql2/promise';

async function diagnose() {
  console.log("🔍 诊断题库数据编码问题...\n");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    charset: 'utf8mb4'
  });

  try {
    // 检查题库数据
    const [rows] = await connection.query<any[]>(
      'SELECT * FROM assessmentQuestions LIMIT 10'
    );
    
    console.log("📊 题库数据样本 (前10条):");
    console.log("================================");
    
    for (const q of rows) {
      console.log(`\nID: ${q.id}`);
      console.log(`能力ID: ${q.competencyId}`);
      console.log(`题目: ${q.question}`);
      console.log(`选项1: ${q.option1}`);
      console.log(`选项2: ${q.option2}`);
      console.log(`类型: ${q.questionType}`);
      console.log(`难度: ${q.difficulty}`);
    }

    // 统计总数
    const [countResult] = await connection.query<any[]>(
      'SELECT COUNT(*) as total FROM assessmentQuestions'
    );
    
    console.log("\n\n📈 数据统计:");
    console.log("================================");
    console.log(`题库总数: ${countResult[0].total}`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ 诊断失败:", error);
    await connection.end();
    process.exit(1);
  }
}

diagnose();
