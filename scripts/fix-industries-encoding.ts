/**
 * Fix industries encoding issue by deleting and re-inserting with correct UTF-8 encoding
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const industriesData = [
  { name: '互联网/电商', code: 'internet_ecommerce', description: '互联网平台、电子商务、O2O等', keyCharacteristics: '用户增长、流量运营、平台建设' },
  { name: '软件/IT服务', code: 'software_it', description: '企业软件、SaaS、IT咨询服务等', keyCharacteristics: '技术研发、客户服务、项目交付' },
  { name: '人工智能', code: 'artificial_intelligence', description: '机器学习、深度学习、计算机视觉等', keyCharacteristics: '算法研发、数据处理、模型训练' },
  { name: '金融科技', code: 'fintech', description: '支付、借贷、保险科技、区块链等', keyCharacteristics: '风控合规、数据安全、金融创新' },
  { name: '企业服务', code: 'enterprise_service', description: '人力资源、营销、财务等企业服务', keyCharacteristics: 'B2B销售、客户成功、服务交付' },
  { name: '教育培训', code: 'education', description: '在线教育、职业培训、K12教育等', keyCharacteristics: '内容研发、师资管理、学习效果' },
  { name: '医疗健康', code: 'healthcare', description: '互联网医疗、医疗器械、健康管理等', keyCharacteristics: '医疗资质、数据安全、服务质量' },
  { name: '文娱传媒', code: 'media_entertainment', description: '内容平台、游戏、影视、短视频等', keyCharacteristics: '内容创作、用户运营、变现能力' },
  { name: '新零售', code: 'new_retail', description: '新零售、社区团购、生鲜电商等', keyCharacteristics: '供应链、履约能力、用户体验' },
  { name: '智能硬件', code: 'smart_hardware', description: '智能家居、可穿戴设备、IoT等', keyCharacteristics: '产品设计、供应链、软硬结合' },
  { name: '汽车交通', code: 'automotive', description: '新能源汽车、出行服务、智能驾驶等', keyCharacteristics: '技术创新、供应链、安全合规' },
  { name: '房产家居', code: 'real_estate', description: '房地产科技、家装、物业服务等', keyCharacteristics: '线下资源、资金管理、服务交付' },
  { name: '农业科技', code: 'agritech', description: '智慧农业、农产品电商、农业服务等', keyCharacteristics: '供应链、技术应用、农业资源' },
  { name: '先进制造', code: 'advanced_manufacturing', description: '智能制造、工业互联网、精密制造等', keyCharacteristics: '技术研发、生产管理、质量控制' },
  { name: '新能源', code: 'new_energy', description: '光伏、风电、储能、新能源汽车等', keyCharacteristics: '技术创新、政策把握、项目管理' },
  { name: '环保', code: 'environmental', description: '环保技术、节能减排、循环经济等', keyCharacteristics: '技术研发、政策合规、项目运营' },
  { name: '物流供应链', code: 'logistics', description: '物流科技、供应链管理、仓储等', keyCharacteristics: '网络覆盖、成本控制、效率优化' },
  { name: '旅游出行', code: 'travel_tourism', description: '在线旅游、酒店民宿、出行服务等', keyCharacteristics: '资源整合、用户体验、服务质量' },
  { name: '社交网络', code: 'social_network', description: '社交平台、社区、即时通讯等', keyCharacteristics: '用户增长、社区运营、内容生态' },
  { name: '本地生活', code: 'local_services', description: '外卖、到店、到家服务等', keyCharacteristics: '地推能力、履约效率、商家运营' },
  { name: '其他', code: 'other', description: '其他行业', keyCharacteristics: '根据具体行业特点' },
];

async function fixIndustriesEncoding() {
  console.log("🔧 开始修复行业数据编码问题...\n");

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    // 1. 删除现有数据
    console.log("🗑️  删除现有行业数据...");
    await connection.execute("DELETE FROM industries");
    console.log("✅ 已删除现有数据\n");

    // 2. 重新插入正确编码的数据
    console.log("📝 插入正确编码的行业数据...");
    for (const industry of industriesData) {
      await connection.execute(
        "INSERT INTO industries (name, code, description, keyCharacteristics) VALUES (?, ?, ?, ?)",
        [industry.name, industry.code, industry.description, industry.keyCharacteristics]
      );
      console.log(`  ✓ ${industry.name}`);
    }
    console.log("\n✅ 成功插入所有行业数据");

    // 3. 验证数据
    console.log("\n🔍 验证插入的数据...");
    const [rows] = await connection.execute("SELECT id, name, code FROM industries ORDER BY id LIMIT 5");
    console.log(rows);

    await connection.end();
    console.log("\n🎉 行业数据编码修复完成！");
  } catch (error) {
    console.error("\n❌ 修复过程中出错:", error);
    await connection.end();
    throw error;
  }
}

fixIndustriesEncoding()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
