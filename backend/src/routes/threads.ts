import { Router } from 'express';
import { db } from '../db/database';
import { getAllLanguages } from '../services/prompts';

export const threadRouter = Router();

// 言語一覧取得
threadRouter.get('/languages', (req, res) => {
  const languages = getAllLanguages();
  res.json(languages);
});

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

// RSSから手動でスレッド作成（/:id より前に定義）- 多言語対応版
threadRouter.post('/fetch-rss', async (req, res) => {
  try {
    const { generateAutoThreads } = await import('../services/auto-thread-generator');
    
    // 自動スレッド生成ロジックを再利用（多言語対応）
    await generateAutoThreads();
    
    res.json({ 
      success: true, 
      message: '多言語スレッドを作成しました'
    });
  } catch (error: any) {
    console.error('Manual RSS thread generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// スレッド作成
threadRouter.post('/', (req, res) => {
  const { title, language = 'ja' } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO threads (title, language, post_count) VALUES (?, ?, ?)',
    [title, language, 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, title, language });
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
