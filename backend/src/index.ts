import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { threadRouter } from './routes/threads';
import { postRouter } from './routes/posts';
import { rssRouter } from './routes/rss';
import { statsRouter } from './routes/stats';
import { initDatabase } from './db/database';
import { startAutoThreadCreation } from './services/autoThread';
import { initCostControl } from './services/costControl';
import { startAutoThreadCron } from './jobs/auto-thread-cron';

// .envファイルのパスを明示的に指定
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/threads', threadRouter);
app.use('/api/posts', postRouter);
app.use('/api/rss', rssRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReBBS API' });
});

// Initialize
async function initialize() {
  await initDatabase();
  await initCostControl();
  startAutoThreadCreation();
  startAutoThreadCron(); // 新しい多言語自動スレッド生成
  
  app.listen(PORT, () => {
    console.log(`🎃 ReBBS API running on port ${PORT}`);
    
    // 起動後30秒後に初回実行（動作確認用）
    setTimeout(async () => {
      console.log('🚀 Running initial auto thread generation...');
      const { generateAutoThreads } = await import('./services/auto-thread-generator');
      await generateAutoThreads();
    }, 30000);
  });
}

initialize().catch(console.error);
