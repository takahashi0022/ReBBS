import { db } from '../db/database';
import type { NewsArticle } from './rss-fetcher';

/**
 * 最近処理されたニュースを除外
 */
export async function filterRecentlyProcessedNews(
  articles: NewsArticle[],
  withinMinutes: number = 60
): Promise<NewsArticle[]> {
  return new Promise((resolve) => {
    const cutoffTime = new Date(Date.now() - withinMinutes * 60 * 1000);
    const cutoffStr = cutoffTime.toISOString();

    db.all(
      'SELECT url FROM news_articles WHERE processed_at > ?',
      [cutoffStr],
      (err, rows: any[]) => {
        if (err) {
          console.error('Error filtering processed news:', err);
          resolve(articles);
          return;
        }

        const processedUrls = new Set(rows.map(r => r.url));
        const unprocessed = articles.filter(a => !processedUrls.has(a.url));
        resolve(unprocessed);
      }
    );
  });
}

/**
 * ニュースを処理済みとしてマーク
 */
export async function markAsProcessed(url: string, title: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR IGNORE INTO news_articles (title, url, processed_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [title, url],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * 古い処理済みニュースをクリーンアップ（7日以上前）
 */
export async function cleanupOldNews(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    db.run(
      'DELETE FROM news_articles WHERE processed_at < ?',
      [sevenDaysAgo],
      (err) => {
        if (err) {
          console.error('Error cleaning up old news:', err);
          reject(err);
        } else {
          console.log('✅ Old news cleaned up');
          resolve();
        }
      }
    );
  });
}
