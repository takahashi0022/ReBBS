import { Router } from 'express';
import { getUsageStats, estimateCost } from '../services/costControl';

export const statsRouter = Router();

// 使用状況取得
statsRouter.get('/usage', async (req, res) => {
  try {
    const stats = await getUsageStats();
    const dailyCost = estimateCost(stats.daily_requests);
    const monthlyCost = estimateCost(stats.monthly_requests);

    res.json({
      daily: {
        requests: stats.daily_requests,
        limit: stats.limits.DAILY_MAX_REQUESTS,
        percentage: Math.round((stats.daily_requests / stats.limits.DAILY_MAX_REQUESTS) * 100),
        cost: dailyCost,
      },
      monthly: {
        requests: stats.monthly_requests,
        limit: stats.limits.MONTHLY_MAX_REQUESTS,
        percentage: Math.round((stats.monthly_requests / stats.limits.MONTHLY_MAX_REQUESTS) * 100),
        cost: monthlyCost,
      },
      rateLimit: {
        perMinute: stats.limits.MAX_REQUESTS_PER_MINUTE,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
