/**
 * Cron Jobs for scheduled tasks
 * 
 * This module sets up automated tasks that run at specific intervals:
 * - Capability snapshots: Monthly on 1st at 2:00 AM
 * - Achievement checks: Daily at 3:00 AM (future)
 * - Analytics updates: Daily at 4:00 AM (future)
 */

import cron from 'node-cron';
import { getDb, createCapabilitySnapshot, getAllUsersWithStats } from './db';

/**
 * Monthly Capability Snapshot Task
 * Runs on the 1st of every month at 2:00 AM
 * 
 * This task creates snapshots of all users' competency scores for historical tracking
 */
export function startCapabilitySnapshotTask() {
  // Cron expression: "0 2 1 * *" = At 02:00 on day-of-month 1
  const task = cron.schedule('0 2 1 * *', async () => {
    console.log(`\n📸 [Cron] Starting monthly capability snapshot task at ${new Date().toISOString()}`);
    
    try {
      const db = await getDb();
      if (!db) {
        console.error('[Cron] Database not available, skipping snapshot task');
        return;
      }
      
      // Get all users
      const users = await getAllUsersWithStats();
      console.log(`[Cron] Found ${users.length} users to snapshot`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Create snapshots for each user
      for (const user of users) {
        try {
          const snapshotCount = await createCapabilitySnapshot(user.id);
          console.log(`[Cron] ✓ User ${user.id} (${user.name}): ${snapshotCount} competencies snapshotted`);
          successCount++;
        } catch (error) {
          console.error(`[Cron] ✗ Failed to snapshot user ${user.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`\n[Cron] Snapshot task completed:`);
      console.log(`  ✓ Success: ${successCount} users`);
      console.log(`  ✗ Errors: ${errorCount} users`);
      console.log(`  Total: ${users.length} users\n`);
      
    } catch (error) {
      console.error('[Cron] Snapshot task failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai" // Use China timezone
  });
  
  console.log('✅ [Cron] Capability snapshot task scheduled (1st of every month at 2:00 AM CST)');
  return task;
}

/**
 * Manual snapshot trigger (for testing)
 * Usage: Call this function to immediately create snapshots for all users
 */
export async function manualSnapshotTrigger() {
  console.log(`\n📸 [Manual] Starting manual capability snapshot at ${new Date().toISOString()}`);
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Manual] Database not available');
      return { success: false, message: 'Database not available' };
    }
    
    const users = await getAllUsersWithStats();
    console.log(`[Manual] Found ${users.length} users to snapshot`);
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const user of users) {
      try {
        const snapshotCount = await createCapabilitySnapshot(user.id);
        console.log(`[Manual] ✓ User ${user.id} (${user.name}): ${snapshotCount} competencies snapshotted`);
        successCount++;
        results.push({
          userId: user.id,
          userName: user.name,
          snapshotCount,
          success: true
        });
      } catch (error) {
        console.error(`[Manual] ✗ Failed to snapshot user ${user.id}:`, error);
        errorCount++;
        results.push({
          userId: user.id,
          userName: user.name,
          error: String(error),
          success: false
        });
      }
    }
    
    console.log(`\n[Manual] Snapshot completed:`);
    console.log(`  ✓ Success: ${successCount} users`);
    console.log(`  ✗ Errors: ${errorCount} users\n`);
    
    return {
      success: true,
      totalUsers: users.length,
      successCount,
      errorCount,
      results
    };
    
  } catch (error) {
    console.error('[Manual] Snapshot failed:', error);
    return {
      success: false,
      message: String(error)
    };
  }
}

/**
 * Future: Daily Achievement Check Task
 * Runs daily at 3:00 AM
 * Check and unlock new achievements for all users
 */
export function startAchievementCheckTask() {
  // Placeholder for future implementation
  // const task = cron.schedule('0 3 * * *', async () => { ... });
  console.log('ℹ️  [Cron] Achievement check task not yet implemented');
}

/**
 * Future: Daily Analytics Update Task
 * Runs daily at 4:00 AM
 * Update analytics and statistics
 */
export function startAnalyticsUpdateTask() {
  // Placeholder for future implementation
  // const task = cron.schedule('0 4 * * *', async () => { ... });
  console.log('ℹ️  [Cron] Analytics update task not yet implemented');
}

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  console.log('\n⏰ [Cron] Initializing scheduled tasks...');
  
  // Start capability snapshot task
  startCapabilitySnapshotTask();
  
  // Future tasks
  startAchievementCheckTask();
  startAnalyticsUpdateTask();
  
  console.log('✅ [Cron] All scheduled tasks initialized\n');
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs() {
  console.log('⏸️  [Cron] Stopping all scheduled tasks...');
  // Tasks will be stopped when process exits
}
