'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './stats.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface UsageStats {
  daily: {
    requests: number;
    limit: number;
    percentage: number;
    cost: { usd: number; jpy: number };
  };
  monthly: {
    requests: number;
    limit: number;
    percentage: number;
    cost: { usd: number; jpy: number };
  };
  rateLimit: {
    perMinute: number;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/usage`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>読み込み中...</div>;
  }

  if (!stats) {
    return <div className={styles.container}>データを取得できませんでした</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/">← トップに戻る</Link>
      </div>

      <h1 className={styles.title}>💰 使用状況 & コスト</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>📅 本日の使用状況</h2>
          <div className={styles.statValue}>
            {stats.daily.requests} / {stats.daily.limit}
            <span className={styles.unit}>リクエスト</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${Math.min(stats.daily.percentage, 100)}%`,
                backgroundColor: stats.daily.percentage > 80 ? '#e74c3c' : '#3498db'
              }}
            />
          </div>
          <div className={styles.percentage}>{stats.daily.percentage}%</div>
          <div className={styles.cost}>
            <div>💵 ${stats.daily.cost.usd.toFixed(4)}</div>
            <div>💴 ¥{stats.daily.cost.jpy.toFixed(2)}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <h2>📆 今月の使用状況</h2>
          <div className={styles.statValue}>
            {stats.monthly.requests} / {stats.monthly.limit}
            <span className={styles.unit}>リクエスト</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${Math.min(stats.monthly.percentage, 100)}%`,
                backgroundColor: stats.monthly.percentage > 80 ? '#e74c3c' : '#2ecc71'
              }}
            />
          </div>
          <div className={styles.percentage}>{stats.monthly.percentage}%</div>
          <div className={styles.cost}>
            <div>💵 ${stats.monthly.cost.usd.toFixed(4)}</div>
            <div>💴 ¥{stats.monthly.cost.jpy.toFixed(2)}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <h2>⚡ レート制限</h2>
          <div className={styles.statValue}>
            {stats.rateLimit.perMinute}
            <span className={styles.unit}>req/分</span>
          </div>
          <p className={styles.description}>
            1分間に{stats.rateLimit.perMinute}回までリクエスト可能
          </p>
        </div>
      </div>

      <div className={styles.info}>
        <h3>💡 コスト制御について</h3>
        <ul>
          <li>制限に達すると、AIの代わりにランダムななんJ語録が返されます</li>
          <li>日次制限は毎日0時にリセットされます</li>
          <li>月次制限は毎月1日にリセットされます</li>
          <li>設定は <code>backend/.env</code> で変更できます</li>
        </ul>
      </div>
    </div>
  );
}
