import Parser from 'rss-parser';
import { db } from '../db/database';
import { generateNanjPost } from './bedrock';
import { getRandomAuthorName } from '../data/nanjVocabulary';

const parser = new Parser();
const CHECK_INTERVAL = 30 * 60 * 1000; // 30分ごと

// RSS_FEEDSを関数内で取得するように変更
function getRssFeeds(): string[] {
  return (process.env.RSS_FEEDS || '').split(',').filter(Boolean);
}

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
}

export function startAutoThreadCreation() {
  console.log('🧟 Auto thread creation started');
  
  const RSS_FEEDS = getRssFeeds();
  
  if (RSS_FEEDS.length > 0) {
    console.log(`📰 RSS feeds configured: ${RSS_FEEDS.length} feeds`);
    // 初回実行
    checkRssAndCreateThreads();
    
    // 定期実行（30分ごと）
    setInterval(checkRssAndCreateThreads, CHECK_INTERVAL);
  } else {
    console.log('⚠️  No RSS feeds configured');
  }

  // ランダムスレッド作成（5-15分ごと）
  const randomInterval = () => {
    const min = 5 * 60 * 1000; // 5分
    const max = 15 * 60 * 1000; // 15分
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const scheduleRandomThread = () => {
    setTimeout(() => {
      createRandomThread();
      scheduleRandomThread(); // 次のランダムスレッドをスケジュール
    }, randomInterval());
  };

  scheduleRandomThread();
  console.log('👻 Random thread creation scheduled');
}

async function checkRssAndCreateThreads() {
  console.log('📰 Checking RSS feeds...');
  
  const RSS_FEEDS = getRssFeeds();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // 全フィードから1週間以内の記事を収集
  const allItems: RssItem[] = [];
  
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      // 1週間以内の記事をフィルタリング
      const recentItems = feed.items.filter(item => {
        if (!item.pubDate) return true;
        const itemDate = new Date(item.pubDate);
        return itemDate >= oneWeekAgo;
      });
      
      allItems.push(...recentItems.slice(0, 20) as RssItem[]);
    } catch (error) {
      console.error(`RSS fetch error (${feedUrl}):`, error);
    }
  }
  
  if (allItems.length === 0) {
    console.log('⚠️  No recent news found');
    return;
  }
  
  // ランダムに1-2件選択
  const selectedCount = Math.min(Math.floor(Math.random() * 2) + 1, allItems.length);
  const shuffled = allItems.sort(() => 0.5 - Math.random());
  const selectedItems = shuffled.slice(0, selectedCount);
  
  for (const item of selectedItems) {
    if (item?.title) {
      await createThreadFromNews(item.title, item.link);
    }
  }
}

async function createThreadFromNews(title: string, sourceUrl?: string) {
  // 既存スレッドチェック
  db.get('SELECT id FROM threads WHERE title = ? LIMIT 1', [title], async (err, row) => {
    if (row) return; // 既に存在

    // 新規スレッド作成
    db.run(
      'INSERT INTO threads (title, source_url, post_count) VALUES (?, ?, ?)',
      [title, sourceUrl || '', 0],
      async function(err) {
        if (err) {
          console.error('Thread creation error:', err);
          return;
        }

        const threadId = this.lastID;
        console.log(`📝 New thread created: ${title}`);

        // AI投稿を3-5個自動生成
        const postCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < postCount; i++) {
          await createAiPost(threadId, title);
          await sleep(2000); // レート制限対策
        }
      }
    );
  });
}

async function createAiPost(threadId: number, topic: string) {
  try {
    const content = await generateNanjPost(topic);
    const authorName = getRandomAuthorName();

    db.run(
      'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
      [threadId, authorName, content]
    );

    db.run('UPDATE threads SET post_count = post_count + 1, last_post_at = CURRENT_TIMESTAMP WHERE id = ?', [threadId]);
  } catch (error) {
    console.error('AI post creation error:', error);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ランダムなトピックでスレッド作成
const randomTopics = [
  '最近見た怖い夢の話',
  '人生で一番後悔してること',
  '忘れられない思い出',
  '今の時代について思うこと',
  '昔は良かったと思うこと',
  '誰にも言えない秘密',
  '人生で一番怖かった体験',
  '死ぬ前にやりたいこと',
  '生まれ変わったら何になりたい',
  '過去に戻れるなら何をする',
  '今の若者について思うこと',
  '昔の流行で覚えてること',
  '人生で一番幸せだった瞬間',
  '後悔してる選択',
  '忘れられない人',
  '人生で学んだ大切なこと',
  '今の世の中で理解できないこと',
  '昔と今で変わったこと',
  '誰かに伝えたかった言葉',
  '人生でやり直したいこと'
];

async function createRandomThread() {
  const topic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  
  console.log(`👻 Creating random thread: ${topic}`);

  // 既存チェック
  db.get('SELECT id FROM threads WHERE title = ? LIMIT 1', [topic], async (err, row) => {
    if (row) return; // 既に存在

    // スレッド作成
    db.run(
      'INSERT INTO threads (title, post_count) VALUES (?, ?)',
      [topic, 0],
      async function(err) {
        if (err) {
          console.error('Random thread creation error:', err);
          return;
        }

        const threadId = this.lastID;
        console.log(`💀 Random thread created: ${topic} (ID: ${threadId})`);

        // 初期投稿を5-8件生成
        const postCount = Math.floor(Math.random() * 4) + 5;
        const posts: string[] = [];

        for (let i = 0; i < postCount; i++) {
          const content = await generateNanjPost(topic, posts);
          const authorName = getRandomAuthorName();

          await new Promise<void>((resolve, reject) => {
            db.run(
              'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
              [threadId, authorName, content],
              (err) => {
                if (err) reject(err);
                else {
                  posts.push(content);
                  resolve();
                }
              }
            );
          });

          await sleep(2000); // レート制限対策
        }

        db.run(
          'UPDATE threads SET post_count = ?, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
          [postCount, threadId]
        );

        console.log(`✅ Random thread completed with ${postCount} posts`);
      }
    );
  });
}
