import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users, userProfiles, assessmentSessions, assessmentResponses } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

const db = drizzle(new Database("data.db"));

console.log("\n📊 检查演示账户数据...\n");

// 查询演示用户
const demoUsers = await db
  .select()
  .from(users)
  .where(sql`${users.username} LIKE 'demo%' OR ${users.username} = 'admin'`);

console.log("👥 演示用户:");
demoUsers.forEach(user => {
  console.log(`  - ${user.username} (${user.email}) - Role: ${user.role}`);
});

console.log("\n");

// 查询用户资料
for (const user of demoUsers) {
  console.log(`📝 ${user.username} 的资料:`);
  
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);
  
  if (profile.length > 0) {
    const p = profile[0];
    console.log(`  ✅ 姓名: ${p.fullName || '未填写'}`);
    console.log(`  ✅ 行业ID: ${p.industryId || '未填写'}`);
    console.log(`  ✅ 职位ID: ${p.positionId || '未填写'}`);
    console.log(`  ✅ 工作年限: ${p.yearsOfExperience || '未填写'}`);
    console.log(`  ✅ 当前职级: ${p.currentLevel || '未填写'}`);
    console.log(`  ✅ 学历: ${p.education || '未填写'}`);
  } else {
    console.log(`  ❌ 没有资料数据`);
  }
  
  // 查询评估会话
  const sessions = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.userId, user.id));
  
  console.log(`  📊 评估会话: ${sessions.length} 个`);
  
  if (sessions.length > 0) {
    for (const session of sessions) {
      const responses = await db
        .select()
        .from(assessmentResponses)
        .where(eq(assessmentResponses.sessionId, session.id));
      
      console.log(`    - 会话 #${session.id}: ${session.status} (${responses.length}/${session.totalQuestions} 答题)`);
    }
  }
  
  console.log("");
}

process.exit(0);
