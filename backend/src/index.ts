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
  res.json({ status: 'ok', message: 'Thread of the Dead API' });
});

// Initialize
async function initialize() {
  await initDatabase();
  await initCostControl();
  startAutoThreadCreation();
  
  app.listen(PORT, () => {
    console.log(`🧟 Thread of the Dead API running on port ${PORT}`);
  });
}

initialize().catch(console.error);
