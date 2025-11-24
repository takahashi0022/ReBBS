import { db } from '../db/database';

interface UsageStats {
  daily_requests: number;
  monthly_requests: number;
  last_reset_date: string;
}

const LIMITS = {
  DAILY_MAX_REQUESTS: parseInt(process.env.DAILY_MAX_REQUESTS || '500'),
  MONTHLY_MAX_REQUESTS: parseInt(process.env.MONTHLY_MAX_REQUESTS || '10000'),
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10'),
};

const requestTimestamps: number[] = [];

export function initCostControl(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS usage_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        daily_requests INTEGER DEFAULT 0,
        monthly_requests INTEGER DEFAULT 0,
        last_reset_date TEXT DEFAULT (date('now')),
        last_reset_month TEXT DEFAULT (strftime('%Y-%m', 'now'))
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.run(`
        INSERT OR IGNORE INTO usage_stats (id, daily_requests, monthly_requests)
        VALUES (1, 0, 0)
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        console.log('💰 Cost control initialized');
        console.log(`   Daily limit: ${LIMITS.DAILY_MAX_REQUESTS} requests`);
        console.log(`   Monthly limit: ${LIMITS.MONTHLY_MAX_REQUESTS} requests`);
        console.log(`   Rate limit: ${LIMITS.MAX_REQUESTS_PER_MINUTE} req/min`);
        resolve();
      });
    });
  });
}

export async function checkAndIncrementUsage(): Promise<{ allowed: boolean; reason?: string }> {
  // レート制限チェック
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // 古いタイムスタンプを削除
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= LIMITS.MAX_REQUESTS_PER_MINUTE) {
    return { 
      allowed: false, 
      reason: `Rate limit exceeded: ${LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute` 
    };
  }

  return new Promise((resolve) => {
    db.get('SELECT * FROM usage_stats WHERE id = 1', [], (err, row: any) => {
      if (err || !row) {
        resolve({ allowed: false, reason: 'Database error' });
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().substring(0, 7);

      // 日次リセット
      if (row.last_reset_date !== today) {
        db.run(
          'UPDATE usage_stats SET daily_requests = 0, last_reset_date = ? WHERE id = 1',
          [today]
        );
        row.daily_requests = 0;
      }

      // 月次リセット
      if (row.last_reset_month !== thisMonth) {
        db.run(
          'UPDATE usage_stats SET monthly_requests = 0, last_reset_month = ? WHERE id = 1',
          [thisMonth]
        );
        row.monthly_requests = 0;
      }

      // 制限チェック
      if (row.daily_requests >= LIMITS.DAILY_MAX_REQUESTS) {
        resolve({ 
          allowed: false, 
          reason: `Daily limit reached: ${LIMITS.DAILY_MAX_REQUESTS} requests` 
        });
        return;
      }

      if (row.monthly_requests >= LIMITS.MONTHLY_MAX_REQUESTS) {
        resolve({ 
          allowed: false, 
          reason: `Monthly limit reached: ${LIMITS.MONTHLY_MAX_REQUESTS} requests` 
        });
        return;
      }

      // カウント増加
      db.run(
        'UPDATE usage_stats SET daily_requests = daily_requests + 1, monthly_requests = monthly_requests + 1 WHERE id = 1'
      );

      requestTimestamps.push(now);
      resolve({ allowed: true });
    });
  });
}

export function getUsageStats(): Promise<UsageStats & { limits: typeof LIMITS }> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM usage_stats WHERE id = 1', [], (err, row: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        daily_requests: row?.daily_requests || 0,
        monthly_requests: row?.monthly_requests || 0,
        last_reset_date: row?.last_reset_date || '',
        limits: LIMITS,
      });
    });
  });
}

export function estimateCost(requests: number): { usd: number; jpy: number } {
  const INPUT_TOKENS_PER_REQUEST = 300;
  const OUTPUT_TOKENS_PER_REQUEST = 50;
  const INPUT_COST_PER_1M = 0.25;
  const OUTPUT_COST_PER_1M = 1.25;
  const USD_TO_JPY = 150;

  const inputCost = (requests * INPUT_TOKENS_PER_REQUEST / 1000000) * INPUT_COST_PER_1M;
  const outputCost = (requests * OUTPUT_TOKENS_PER_REQUEST / 1000000) * OUTPUT_COST_PER_1M;
  const totalUsd = inputCost + outputCost;

  return {
    usd: Math.round(totalUsd * 10000) / 10000,
    jpy: Math.round(totalUsd * USD_TO_JPY * 100) / 100,
  };
}
