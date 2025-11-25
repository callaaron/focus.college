import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users, userProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

console.log("\n🌱 开始填充演示账户数据...\n");

// 演示账户数据
const demoAccounts = [
  {
    username: "demo_pm",
    email: "demo_pm@focus.college",
    password: "demo123",
    role: "user" as const,
    isDemo: true,
    demoRole: "pm",
    profile: {
      fullName: "张伟 (产品经理)",
      industry: "互联网",
      industryId: 1, // 互联网/科技
      currentRole: "高级产品经理",
      positionId: 5, // 产品经理
      managementLevel: "middle" as const,
      companySize: "medium" as const,
      companyStage: "series_b" as const,
      yearsOfManagement: 3,
      directReports: 5,
      teamSize: 8,
      profileCompleted: true,
    }
  },
  {
    username: "demo_cto",
    email: "demo_cto@focus.college",
    password: "demo123",
    role: "user" as const,
    isDemo: true,
    demoRole: "cto",
    profile: {
      fullName: "李明 (技术总监)",
      industry: "人工智能",
      industryId: 2, // AI/机器学习
      currentRole: "首席技术官",
      positionId: 2, // CTO
      managementLevel: "executive" as const,
      companySize: "large" as const,
      companyStage: "series_c" as const,
      yearsOfManagement: 8,
      directReports: 15,
      teamSize: 120,
      profileCompleted: true,
    }
  },
  {
    username: "demo_ceo",
    email: "demo_ceo@focus.college",
    password: "demo123",
    role: "user" as const,
    isDemo: true,
    demoRole: "ceo",
    profile: {
      fullName: "王芳 (首席执行官)",
      industry: "金融科技",
      industryId: 3, // 金融科技
      currentRole: "首席执行官",
      positionId: 1, // CEO
      managementLevel: "executive" as const,
      companySize: "large" as const,
      companyStage: "pre_ipo" as const,
      yearsOfManagement: 12,
      directReports: 8,
      teamSize: 500,
      profileCompleted: true,
    }
  }
];

async function seedDemoData() {
  for (const account of demoAccounts) {
    console.log(`📝 处理账户: ${account.username}`);
    
    // 检查用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, account.username))
      .limit(1);
    
    let userId: number;
    
    if (existingUser.length > 0) {
      console.log(`  ✓ 用户已存在，ID: ${existingUser[0].id}`);
      userId = existingUser[0].id;
      
      // 更新用户信息
      await db
        .update(users)
        .set({
          email: account.email,
          role: account.role,
          isDemo: account.isDemo,
          demoRole: account.demoRole,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      console.log(`  ✓ 用户信息已更新`);
    } else {
      // 创建新用户
      const passwordHash = await bcrypt.hash(account.password, 10);
      
      const result = await db
        .insert(users)
        .values({
          username: account.username,
          email: account.email,
          passwordHash,
          role: account.role,
          isDemo: account.isDemo,
          demoRole: account.demoRole,
          loginMethod: "local",
          name: account.profile.fullName,
        });
      
      userId = Number(result.lastInsertRowid);
      console.log(`  ✓ 用户已创建，ID: ${userId}`);
    }
    
    // 检查profile是否存在
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    
    if (existingProfile.length > 0) {
      // 更新profile
      await db
        .update(userProfiles)
        .set({
          ...account.profile,
          userId,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
      
      console.log(`  ✓ 用户资料已更新`);
    } else {
      // 创建profile
      await db
        .insert(userProfiles)
        .values({
          ...account.profile,
          userId,
        });
      
      console.log(`  ✓ 用户资料已创建`);
    }
    
    console.log(`  ✅ ${account.username} 完成\n`);
  }
}

// 执行填充
seedDemoData()
  .then(() => {
    console.log("✅ 所有演示账户数据填充完成！\n");
    console.log("📋 账户信息:");
    console.log("  - demo_pm / demo123 (产品经理)");
    console.log("  - demo_cto / demo123 (技术总监)");  
    console.log("  - demo_ceo / demo123 (首席执行官)\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 填充失败:", error);
    process.exit(1);
  });
