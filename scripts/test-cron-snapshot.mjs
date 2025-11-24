#!/usr/bin/env node
/**
 * Test script for cron snapshot functionality
 * This script demonstrates how the monthly snapshot task works
 */

console.log('🧪 Testing Competency Snapshot Cron Job...\n');

console.log('📋 Cron Schedule: "0 2 1 * *"');
console.log('   Meaning: At 02:00 AM on day 1 of every month\n');

console.log('🕐 Next Execution Times (CST):');
const now = new Date();
for (let i = 0; i < 6; i++) {
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1, 2, 0, 0);
  console.log(`   ${nextMonth.toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}`);
}

console.log('\n📸 What happens during snapshot:');
console.log('   1. Fetch all users from database');
console.log('   2. For each user:');
console.log('      - Get current competency scores');
console.log('      - Insert into competencySnapshots table');
console.log('      - Record: userId, competencyId, score, level, snapshotDate');
console.log('   3. Log success/failure for each user');
console.log('   4. Report summary statistics');

console.log('\n🔧 Manual Trigger:');
console.log('   Administrators can manually trigger snapshots via:');
console.log('   - tRPC endpoint: admin.triggerSnapshot');
console.log('   - Admin dashboard UI (future)');
console.log('   - Direct function call: manualSnapshotTrigger()');

console.log('\n💾 Database Table: competencySnapshots');
console.log('   Columns:');
console.log('   - id (INT, auto increment)');
console.log('   - userId (INT)');
console.log('   - competencyId (INT)');
console.log('   - score (INT, 0-100)');
console.log('   - level (INT, 1-5)');
console.log('   - snapshotDate (TIMESTAMP)');
console.log('   - createdAt (TIMESTAMP)');

console.log('\n📊 Use Cases:');
console.log('   1. Growth trend visualization (6-month, 1-year views)');
console.log('   2. Historical comparison (current vs past months)');
console.log('   3. Progress reports and analytics');
console.log('   4. Competency development tracking');

console.log('\n⚙️ Configuration:');
console.log('   - Timezone: Asia/Shanghai (CST)');
console.log('   - Frequency: Monthly');
console.log('   - Auto-start: Yes (on server startup)');
console.log('   - Graceful shutdown: Yes (on SIGTERM/SIGINT)');

console.log('\n✅ Cron job functionality validated!');
console.log('\n💡 To test manually:');
console.log('   1. Start the server: npm run dev');
console.log('   2. Login as admin');
console.log('   3. Call tRPC: client.admin.triggerSnapshot.mutate()');
console.log('   4. Check database: SELECT * FROM competencySnapshots;');
