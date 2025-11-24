import { Router } from 'express';
import { db } from '../db/database';
import { generateNanjPost } from '../services/bedrock';
import { getRandomAuthorName } from '../data/nanjVocabulary';

export const postRouter = Router();

// スレッドの投稿一覧取得
postRouter.get('/thread/:threadId', (req, res) => {
  const { threadId } = req.params;
  
  db.all(
    'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC',
    [threadId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ユーザー投稿
postRouter.post('/user/:threadId', (req, res) => {
  const { threadId } = req.params;
  const { content, authorName } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const finalAuthorName = authorName && authorName.trim() ? authorName.trim() : '風吹けば名無し';

  db.run(
    'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
    [threadId, finalAuthorName, content.trim()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run(
        'UPDATE threads SET post_count = post_count + 1, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
        [threadId]
      );

      res.json({ 
        id: this.lastID, 
        thread_id: threadId, 
        author_name: finalAuthorName, 
        content: content.trim() 
      });
    }
  );
});

// AI投稿生成（単発）
postRouter.post('/generate-single/:threadId', async (req, res) => {
  const { threadId } = req.params;
  
  try {
    // スレッド情報取得
    db.get('SELECT title, source_url FROM threads WHERE id = ?', [threadId], async (err, thread: any) => {
      if (err || !thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // 過去の投稿取得
      db.all(
        'SELECT content FROM posts WHERE thread_id = ? ORDER BY created_at DESC LIMIT 10',
        [threadId],
        async (err, existingPosts: any[]) => {
          const previousPosts = existingPosts.map(p => p.content).reverse();
          
          const content = await generateNanjPost(thread.title, previousPosts, thread.source_url);
          const authorName = getRandomAuthorName();
          
          // 投稿保存
          db.run(
            'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
            [threadId, authorName, content],
            function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              db.run(
                'UPDATE threads SET post_count = post_count + 1, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
                [threadId]
              );

              res.json({ id: this.lastID, thread_id: threadId, author_name: authorName, content });
            }
          );
        }
      );
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI投稿生成（会話形式で10往復）
postRouter.post('/generate/:threadId', async (req, res) => {
  const { threadId } = req.params;
  
  try {
    // スレッド情報取得
    db.get('SELECT title, source_url FROM threads WHERE id = ?', [threadId], async (err, thread: any) => {
      if (err || !thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // 過去の投稿取得
      db.all(
        'SELECT content FROM posts WHERE thread_id = ? ORDER BY created_at DESC LIMIT 10',
        [threadId],
        async (err, existingPosts: any[]) => {
          const previousPosts = existingPosts.map(p => p.content).reverse();
          const newPosts = [];
          
          // 10往復の会話を生成
          const conversationCount = 10;
          
          for (let i = 0; i < conversationCount; i++) {
            const allPosts = [...previousPosts, ...newPosts];
            const content = await generateNanjPost(thread.title, allPosts, thread.source_url);
            const authorName = getRandomAuthorName();
            
            // 投稿保存
            await new Promise<void>((resolve, reject) => {
              db.run(
                'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
                [threadId, authorName, content],
                function(err) {
                  if (err) reject(err);
                  else {
                    newPosts.push(content);
                    resolve();
                  }
                }
              );
            });
            
            // レート制限対策（少し待機）
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // スレッドの投稿数を更新
          db.run(
            'UPDATE threads SET post_count = post_count + ?, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
            [conversationCount, threadId]
          );

          res.json({ 
            success: true, 
            generated: conversationCount,
            message: `${conversationCount}件の投稿を生成しました` 
          });
        }
      );
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
