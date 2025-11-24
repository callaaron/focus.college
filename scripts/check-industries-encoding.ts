import "dotenv/config";
import mysql from "mysql2/promise";

async function checkIndustries() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  // 检查字符集
  console.log("\n=== 数据库字符集设置 ===");
  const [charsetVars] = await connection.execute("SHOW VARIABLES LIKE 'character_set%'");
  console.log(charsetVars);
  
  // 查看行业表数据
  console.log("\n=== 行业表数据 ===");
  const [industries] = await connection.execute("SELECT id, name, code FROM industries LIMIT 5");
  console.log(industries);
  
  // 查看行业表字符集
  console.log("\n=== 行业表结构 ===");
  const [tableInfo] = await connection.execute("SHOW CREATE TABLE industries");
  console.log(tableInfo);
  
  await connection.end();
}

checkIndustries().catch(console.error);
