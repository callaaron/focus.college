/**
 * 全面测试所有功能
 */

import "dotenv/config";
import mysql from "mysql2/promise";

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const results: TestResult[] = [];

function addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string) {
  results.push({ category, test, status, message });
}

async function testDatabaseConnection() {
  const category = "数据库连接";
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    addResult(category, "连接测试", "PASS", "数据库连接成功");
    
    // 测试字符集
    const [charsetVars] = await connection.execute("SHOW VARIABLES LIKE 'character_set%'");
    const dbCharset = (charsetVars as any).find((v: any) => v.Variable_name === 'character_set_database');
    if (dbCharset?.Value === 'utf8mb4') {
      addResult(category, "字符集检查", "PASS", "数据库使用utf8mb4字符集");
    } else {
      addResult(category, "字符集检查", "WARN", `数据库字符集: ${dbCharset?.Value}`);
    }
    
    await connection.end();
  } catch (error: any) {
    addResult(category, "连接测试", "FAIL", `连接失败: ${error.message}`);
  }
}

async function testCoreData() {
  const category = "核心数据";
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // 测试能力域
    const [domains] = await connection.execute("SELECT COUNT(*) as count FROM competencyDomains");
    const domainCount = (domains as any)[0].count;
    if (domainCount === 8) {
      addResult(category, "能力域数据", "PASS", `8个能力域已创建`);
    } else {
      addResult(category, "能力域数据", "FAIL", `期望8个，实际${domainCount}个`);
    }
    
    // 测试通用能力
    const [competencies] = await connection.execute("SELECT COUNT(*) as count FROM competencies WHERE isCore = 1");
    const compCount = (competencies as any)[0].count;
    if (compCount === 40) {
      addResult(category, "通用能力数据", "PASS", `40个通用能力已创建`);
    } else {
      addResult(category, "通用能力数据", "FAIL", `期望40个，实际${compCount}个`);
    }
    
    // 测试行业数据（检查编码）
    const [industries] = await connection.execute("SELECT id, name FROM industries LIMIT 3");
    const firstIndustry = (industries as any)[0];
    if (firstIndustry.name.includes('互联网') || firstIndustry.name.includes('软件')) {
      addResult(category, "行业数据编码", "PASS", `行业数据正确: ${firstIndustry.name}`);
    } else {
      addResult(category, "行业数据编码", "FAIL", `行业数据可能是乱码: ${firstIndustry.name}`);
    }
    
    const [industryCount] = await connection.execute("SELECT COUNT(*) as count FROM industries");
    const indCount = (industryCount as any)[0].count;
    if (indCount >= 21) {
      addResult(category, "行业数据", "PASS", `${indCount}个行业已创建`);
    } else {
      addResult(category, "行业数据", "WARN", `行业数量: ${indCount}`);
    }
    
    // 测试岗位数据
    const [positions] = await connection.execute("SELECT COUNT(*) as count FROM positions");
    const posCount = (positions as any)[0].count;
    if (posCount >= 12) {
      addResult(category, "岗位数据", "PASS", `${posCount}个岗位已创建`);
    } else {
      addResult(category, "岗位数据", "WARN", `岗位数量: ${posCount}`);
    }
    
    // 测试行业-能力关联
    const [indCompRels] = await connection.execute("SELECT COUNT(*) as count FROM industryCompetencies");
    const indCompCount = (indCompRels as any)[0].count;
    if (indCompCount >= 168) {
      addResult(category, "行业-能力关联", "PASS", `${indCompCount}条关联关系`);
    } else {
      addResult(category, "行业-能力关联", "WARN", `关联数量: ${indCompCount}`);
    }
    
    // 测试岗位-能力关联
    const [posCompRels] = await connection.execute("SELECT COUNT(*) as count FROM positionCompetencies");
    const posCompCount = (posCompRels as any)[0].count;
    if (posCompCount >= 144) {
      addResult(category, "岗位-能力关联", "PASS", `${posCompCount}条关联关系`);
    } else {
      addResult(category, "岗位-能力关联", "WARN", `关联数量: ${posCompCount}`);
    }
    
    await connection.end();
  } catch (error: any) {
    addResult(category, "数据检查", "FAIL", `检查失败: ${error.message}`);
  }
}

async function testUserData() {
  const category = "用户数据";
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // 测试用户数量
    const [users] = await connection.execute("SELECT COUNT(*) as count FROM users");
    const userCount = (users as any)[0].count;
    addResult(category, "用户数量", "PASS", `${userCount}个用户`);
    
    // 测试admin用户
    const [adminUsers] = await connection.execute("SELECT id, username, role FROM users WHERE role = 'admin'");
    const adminCount = (adminUsers as any).length;
    if (adminCount > 0) {
      const admin = (adminUsers as any)[0];
      addResult(category, "管理员账户", "PASS", `管理员账户存在: ${admin.username}`);
    } else {
      addResult(category, "管理员账户", "WARN", "未找到管理员账户");
    }
    
    // 测试demo账户
    const [demoUsers] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE isDemo = 1");
    const demoCount = (demoUsers as any)[0].count;
    if (demoCount >= 3) {
      addResult(category, "演示账户", "PASS", `${demoCount}个演示账户`);
    } else {
      addResult(category, "演示账户", "WARN", `演示账户数量: ${demoCount}`);
    }
    
    await connection.end();
  } catch (error: any) {
    addResult(category, "用户数据检查", "FAIL", `检查失败: ${error.message}`);
  }
}

async function testTableStructures() {
  const category = "表结构";
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const tables = [
      'users',
      'userProfiles',
      'competencyDomains',
      'competencies',
      'competencyScores',
      'industries',
      'positions',
      'industryCompetencies',
      'positionCompetencies',
      'assessmentSessions',
      'organizationAssessments',
      'companies',
      'companyMembers',
    ];
    
    let existingTables = 0;
    for (const table of tables) {
      try {
        await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
        existingTables++;
      } catch (error) {
        addResult(category, `表: ${table}`, "FAIL", "表不存在或无法访问");
      }
    }
    
    if (existingTables === tables.length) {
      addResult(category, "核心表结构", "PASS", `${existingTables}/${tables.length}个核心表存在`);
    } else {
      addResult(category, "核心表结构", "WARN", `${existingTables}/${tables.length}个表存在`);
    }
    
    await connection.end();
  } catch (error: any) {
    addResult(category, "表结构检查", "FAIL", `检查失败: ${error.message}`);
  }
}

function printResults() {
  console.log("\n" + "=".repeat(80));
  console.log("                           功能测试报告");
  console.log("=".repeat(80) + "\n");
  
  const categories = [...new Set(results.map(r => r.category))];
  
  let totalPass = 0;
  let totalFail = 0;
  let totalWarn = 0;
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const pass = categoryResults.filter(r => r.status === 'PASS').length;
    const fail = categoryResults.filter(r => r.status === 'FAIL').length;
    const warn = categoryResults.filter(r => r.status === 'WARN').length;
    
    totalPass += pass;
    totalFail += fail;
    totalWarn += warn;
    
    console.log(`\n📋 ${category}`);
    console.log("-".repeat(80));
    
    for (const result of categoryResults) {
      let icon = '';
      let color = '';
      
      switch (result.status) {
        case 'PASS':
          icon = '✅';
          color = '\x1b[32m'; // Green
          break;
        case 'FAIL':
          icon = '❌';
          color = '\x1b[31m'; // Red
          break;
        case 'WARN':
          icon = '⚠️';
          color = '\x1b[33m'; // Yellow
          break;
      }
      
      console.log(`  ${icon} ${color}${result.test}\x1b[0m: ${result.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("                              总结");
  console.log("=".repeat(80));
  console.log(`\n  ✅ 通过: ${totalPass}`);
  console.log(`  ⚠️  警告: ${totalWarn}`);
  console.log(`  ❌ 失败: ${totalFail}`);
  console.log(`  📊 总计: ${totalPass + totalFail + totalWarn}\n`);
  
  const passRate = ((totalPass / (totalPass + totalFail + totalWarn)) * 100).toFixed(1);
  console.log(`  🎯 通过率: ${passRate}%\n`);
  
  if (totalFail === 0) {
    console.log("  🎉 所有测试通过！系统运行正常。\n");
  } else {
    console.log(`  ⚠️  发现 ${totalFail} 个失败项，请检查上述错误。\n`);
  }
  
  console.log("=".repeat(80) + "\n");
}

async function runAllTests() {
  console.log("\n🔍 开始全面测试...\n");
  
  await testDatabaseConnection();
  await testCoreData();
  await testUserData();
  await testTableStructures();
  
  printResults();
  
  return results.filter(r => r.status === 'FAIL').length === 0;
}

runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 测试运行失败:", error);
    process.exit(1);
  });
