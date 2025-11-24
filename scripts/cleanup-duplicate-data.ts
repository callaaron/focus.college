/**
 * 清理重复的能力域和能力数据
 * 保留ID 1-8的能力域和ID 1-40的能力
 */

import "dotenv/config";
import mysql from "mysql2/promise";

async function cleanupDuplicateData() {
  console.log("🧹 开始清理重复数据...\n");

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    // 1. 检查当前数据
    console.log("📊 检查当前数据量...");
    const [domainCount] = await connection.execute("SELECT COUNT(*) as count FROM competencyDomains");
    const [compCount] = await connection.execute("SELECT COUNT(*) as count FROM competencies");
    console.log(`  能力域: ${(domainCount as any)[0].count} 个`);
    console.log(`  能力: ${(compCount as any)[0].count} 个\n`);

    // 2. 删除重复的能力域（保留ID 1-8）
    console.log("🗑️  删除重复的能力域（保留ID 1-8）...");
    await connection.execute("DELETE FROM competencyDomains WHERE id > 8");
    const [newDomainCount] = await connection.execute("SELECT COUNT(*) as count FROM competencyDomains");
    console.log(`  ✅ 删除完成，剩余 ${(newDomainCount as any)[0].count} 个\n`);

    // 3. 删除重复的能力（保留ID 1-40）
    console.log("🗑️  删除重复的能力（保留ID 1-40）...");
    await connection.execute("DELETE FROM competencies WHERE id > 40");
    const [newCompCount] = await connection.execute("SELECT COUNT(*) as count FROM competencies");
    console.log(`  ✅ 删除完成，剩余 ${(newCompCount as any)[0].count} 个\n`);

    // 4. 验证数据
    console.log("🔍 验证数据...");
    const [domains] = await connection.execute("SELECT id, name FROM competencyDomains ORDER BY id");
    console.log("  能力域:");
    (domains as any).forEach((d: any) => console.log(`    ${d.id}. ${d.name}`));
    
    const [compCountByDomain] = await connection.execute(`
      SELECT domainId, COUNT(*) as count 
      FROM competencies 
      GROUP BY domainId 
      ORDER BY domainId
    `);
    console.log("\n  每个域的能力数量:");
    (compCountByDomain as any).forEach((c: any) => {
      const domain = (domains as any).find((d: any) => d.id === c.domainId);
      console.log(`    ${domain.name}: ${c.count} 个`);
    });

    await connection.end();
    console.log("\n✅ 清理完成！\n");
  } catch (error) {
    console.error("\n❌ 清理失败:", error);
    await connection.end();
    throw error;
  }
}

cleanupDuplicateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
