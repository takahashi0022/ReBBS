import { Router } from 'express';
import { db } from '../db/database';

export const threadRouter = Router();

// スレッド一覧取得
threadRouter.get('/', (req, res) => {
  db.all(
    'SELECT * FROM threads ORDER BY last_post_at DESC LIMIT 50',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// RSSから手動でスレッド作成（/:id より前に定義）
threadRouter.post('/fetch-rss', async (req, res) => {
  try {
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser();
    const { generateNanjPost } = await import('../services/bedrock');
    const { getRandomAuthorName } = await import('../data/nanjVocabulary');
    
    const RSS_FEEDS = (process.env.RSS_FEEDS || '').split(',').filter(Boolean);
    
    if (RSS_FEEDS.length === 0) {
      return res.status(400).json({ error: 'RSS feeds not configured' });
    }

    const createdThreads = [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 全フィードから1週間以内の記事を収集
    const allItems: Array<{ title: string; link?: string; pubDate?: string }> = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        
        // 1週間以内の記事をフィルタリング
        const recentItems = feed.items.filter(item => {
          if (!item.pubDate) return true; // 日付がない場合は含める
          const itemDate = new Date(item.pubDate);
          return itemDate >= oneWeekAgo;
        });

        allItems.push(...recentItems.slice(0, 20)); // 各フィードから最大20件
      } catch (error) {
        console.error('RSS feed error:', error);
      }
    }

    if (allItems.length === 0) {
      return res.json({ 
        success: false, 
        created: 0,
        message: '1週間以内のニュースが見つかりませんでした',
        threads: [] 
      });
    }

    // ランダムに3-5件選択
    const selectedCount = Math.min(Math.floor(Math.random() * 3) + 3, allItems.length);
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, selectedCount);

    for (const item of selectedItems) {
      if (!item?.title) continue;

      try {
        // 既存チェック
        const existing = await new Promise((resolve) => {
          db.get('SELECT id FROM threads WHERE title = ? LIMIT 1', [item.title], (err, row) => {
            resolve(row);
          });
        });

        if (!existing) {
          // スレッド作成
          const threadId = await new Promise<number>((resolve, reject) => {
            db.run(
              'INSERT INTO threads (title, source_url, post_count) VALUES (?, ?, ?)',
              [item.title, item.link || '', 0],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });

          // 初期投稿を3-5件生成
          const postCount = Math.floor(Math.random() * 3) + 3;
          for (let i = 0; i < postCount; i++) {
            const content = await generateNanjPost(item.title, [], item.link);
            const authorName = getRandomAuthorName();

            await new Promise<void>((resolve, reject) => {
              db.run(
                'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
                [threadId, authorName, content],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          db.run('UPDATE threads SET post_count = ?, last_post_at = CURRENT_TIMESTAMP WHERE id = ?', [postCount, threadId]);
          createdThreads.push({ id: threadId, title: item.title });
          
          console.log(`📰 RSS thread created: ${item.title}`);
        }
      } catch (error) {
        console.error('Thread creation error:', error);
      }
    }

    res.json({ 
      success: true, 
      created: createdThreads.length,
      threads: createdThreads 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// スレッド作成
threadRouter.post('/', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO threads (title, post_count) VALUES (?, ?)',
    [title, 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, title });
    }
  );
});

// スレッド詳細取得（最後に定義）
threadRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM threads WHERE id = ?', [id], (err, thread) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json(thread);
  });
});
