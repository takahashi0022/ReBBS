import { Router } from 'express';
import Parser from 'rss-parser';

export const rssRouter = Router();
const parser = new Parser();

// RSS最新記事取得
rssRouter.get('/latest', async (req, res) => {
  const feedUrl = req.query.url as string;
  
  if (!feedUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    res.json({
      title: feed.title,
      items: feed.items.slice(0, 10).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
