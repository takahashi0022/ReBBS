import cron from 'node-cron';
import { generateAutoThreads } from '../services/auto-thread-generator';
import { cleanupOldNews } from '../services/news-processor';

let cronJob: cron.ScheduledTask | null = null;
let cleanupJob: cron.ScheduledTask | null = null;

/**
 * 自動スレッド生成のcronジョブを開始
 */
export function startAutoThreadCron(): void {
  const enabled = process.env.AUTO_THREAD_ENABLED === 'true';
  
  if (!enabled) {
    console.log('⏸️  Auto thread generation is disabled');
    return;
  }

  const intervalMinutes = parseInt(process.env.AUTO_THREAD_INTERVAL_MINUTES || '15', 10);

  // 既存のジョブを停止
  if (cronJob) {
    cronJob.stop();
  }

  // cronスケジュール: */15 * * * * = 15分ごと
  const schedule = `*/${intervalMinutes} * * * *`;
  
  cronJob = cron.schedule(schedule, async () => {
    try {
      await generateAutoThreads();
    } catch (error) {
      console.error('Auto thread cron error:', error);
    }
  });

  console.log(`🤖 Auto thread generation scheduled: every ${intervalMinutes} minutes`);

  // 古いニュースのクリーンアップ（1日1回、午前3時）
  cleanupJob = cron.schedule('0 3 * * *', async () => {
    try {
      await cleanupOldNews();
    } catch (error) {
      console.error('News cleanup error:', error);
    }
  });

  console.log('🧹 News cleanup scheduled: daily at 3:00 AM');
}

/**
 * cronジョブを停止
 */
export function stopAutoThreadCron(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('⏹️  Auto thread cron stopped');
  }
  
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
  }
}
