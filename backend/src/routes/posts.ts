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

// ユーザー投稿（投稿後、AI反応を2-3件自動生成）
postRouter.post('/user/:threadId', async (req, res) => {
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

      const userPostId = this.lastID;

      db.run(
        'UPDATE threads SET post_count = post_count + 1, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
        [threadId]
      );

      // ユーザー投稿を返す
      res.json({ 
        id: userPostId, 
        thread_id: threadId, 
        author_name: finalAuthorName, 
        content: content.trim() 
      });

      // バックグラウンドでAI反応を2-3件生成（ユーザーを待たせない）
      setTimeout(async () => {
        try {
          // スレッド情報とコンテキスト取得（言語も取得）
          db.get('SELECT title, source_url, language FROM threads WHERE id = ?', [threadId], async (err, thread: any) => {
            if (err || !thread) return;

            db.all(
              'SELECT content FROM posts WHERE thread_id = ? ORDER BY created_at DESC LIMIT 10',
              [threadId],
              async (err, posts: any[]) => {
                if (err) return;

                const previousPosts = posts.map(p => p.content).reverse();
                const reactionCount = Math.floor(Math.random() * 2) + 2; // 2-3件
                const language = thread.language || 'ja';

                for (let i = 0; i < reactionCount; i++) {
                  const aiContent = await generateNanjPost(thread.title, previousPosts, thread.source_url, language);
                  const aiAuthorName = getRandomAuthorName(language);

                  await new Promise<void>((resolve) => {
                    db.run(
                      'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
                      [threadId, aiAuthorName, aiContent],
                      () => {
                        previousPosts.push(aiContent);
                        resolve();
                      }
                    );
                  });

                  db.run(
                    'UPDATE threads SET post_count = post_count + 1, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [threadId]
                  );

                  // レート制限対策
                  await new Promise(resolve => setTimeout(resolve, 1500));
                }
              }
            );
          });
        } catch (error) {
          console.error('AI reaction generation error:', error);
        }
      }, 500); // 0.5秒後に開始
    }
  );
});

// AI投稿生成（単発）
postRouter.post('/generate-single/:threadId', async (req, res) => {
  const { threadId } = req.params;
  
  try {
    // スレッド情報取得（言語も取得）
    db.get('SELECT title, source_url, language FROM threads WHERE id = ?', [threadId], async (err, thread: any) => {
      if (err || !thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // 過去の投稿取得
      db.all(
        'SELECT content FROM posts WHERE thread_id = ? ORDER BY created_at DESC LIMIT 10',
        [threadId],
        async (err, existingPosts: any[]) => {
          const previousPosts = existingPosts.map(p => p.content).reverse();
          const language = thread.language || 'ja';
          
          const content = await generateNanjPost(thread.title, previousPosts, thread.source_url, language);
          const authorName = getRandomAuthorName(language);
          
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

// AI投稿生成（会話形式で30往復 - 会話の応酬を強化）
postRouter.post('/generate/:threadId', async (req, res) => {
  const { threadId } = req.params;
  
  try {
    // スレッド情報取得（言語も取得）
    db.get('SELECT title, source_url, language FROM threads WHERE id = ?', [threadId], async (err, thread: any) => {
      if (err || !thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // 過去の投稿取得
      db.all(
        'SELECT content FROM posts WHERE thread_id = ? ORDER BY created_at DESC LIMIT 15',
        [threadId],
        async (err, existingPosts: any[]) => {
          const previousPosts = existingPosts.map(p => p.content).reverse();
          const newPosts = [];
          const language = thread.language || 'ja';
          
          // 30往復の会話を生成（会話の継続性を高める）
          const conversationCount = 30;
          
          for (let i = 0; i < conversationCount; i++) {
            const allPosts = [...previousPosts, ...newPosts];
            const content = await generateNanjPost(thread.title, allPosts, thread.source_url, language);
            const authorName = getRandomAuthorName(language);
            
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
