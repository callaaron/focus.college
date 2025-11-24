import mysql from 'mysql2/promise';

async function checkSize() {
  console.log("📊 检查数据库大小...\n");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://webapp:webapp_password_2024@localhost:3306/competency_system',
    charset: 'utf8mb4'
  });

  try {
    // 获取数据库大小
    const [sizeResult] = await connection.query<any[]>(`
      SELECT 
        table_schema AS 'Database',
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)',
        ROUND(SUM(data_length) / 1024 / 1024, 2) AS 'Data (MB)',
        ROUND(SUM(index_length) / 1024 / 1024, 2) AS 'Index (MB)'
      FROM information_schema.TABLES 
      WHERE table_schema = 'competency_system'
      GROUP BY table_schema;
    `);

    console.log("🗄️  当前数据库总大小:");
    console.log("================================");
    if (sizeResult.length > 0) {
      console.log(`总大小: ${sizeResult[0]['Size (MB)']} MB`);
      console.log(`数据: ${sizeResult[0]['Data (MB)']} MB`);
      console.log(`索引: ${sizeResult[0]['Index (MB)']} MB`);
    }

    // 获取每个表的大小
    const [tables] = await connection.query<any[]>(`
      SELECT 
        table_name AS 'Table',
        ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)',
        table_rows AS 'Rows'
      FROM information_schema.TABLES 
      WHERE table_schema = 'competency_system'
      ORDER BY (data_length + index_length) DESC;
    `);

    console.log("\n\n📋 各表大小详情:");
    console.log("================================");
    console.log("表名\t\t\t大小(MB)\t行数");
    console.log("--------------------------------");
    for (const table of tables) {
      const tableName = table['Table'].padEnd(25);
      const size = String(table['Size (MB)']).padEnd(8);
      const rows = table['Rows'];
      console.log(`${tableName}\t${size}\t${rows}`);
    }

    // 统计记录数
    console.log("\n\n📈 数据统计:");
    console.log("================================");
    
    const tables_to_check = [
      'users',
      'userProfiles',
      'competencyDomains',
      'competencies',
      'industries',
      'positions',
      'assessmentQuestions',
      'assessmentSessions',
      'userAnswers',
      'companies',
      'companyMembers'
    ];

    for (const tableName of tables_to_check) {
      try {
        const [countResult] = await connection.query<any[]>(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`${tableName.padEnd(25)}: ${countResult[0].count} 条记录`);
      } catch (err) {
        console.log(`${tableName.padEnd(25)}: 表不存在或无法访问`);
      }
    }

    await connection.end();
    
    console.log("\n\n💡 存储空间分析:");
    console.log("================================");
    const currentSize = sizeResult.length > 0 ? parseFloat(sizeResult[0]['Size (MB)']) : 0;
    
    console.log(`当前使用: ${currentSize} MB`);
    console.log(`Neon 免费: 512 MB`);
    console.log(`剩余空间: ${(512 - currentSize).toFixed(2)} MB`);
    console.log(`使用率: ${((currentSize / 512) * 100).toFixed(2)}%`);
    
    // 预估增长
    const estimates = [
      { users: 100, size: 1 },
      { users: 1000, size: 10 },
      { users: 10000, size: 50 },
      { users: 50000, size: 200 }
    ];
    
    console.log("\n\n📊 预估增长空间:");
    console.log("================================");
    for (const est of estimates) {
      const totalSize = currentSize + est.size;
      const fits = totalSize <= 512 ? '✅' : '❌';
      console.log(`${est.users} 用户: ~${totalSize.toFixed(1)} MB ${fits}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ 检查失败:", error);
    await connection.end();
    process.exit(1);
  }
}

checkSize();
