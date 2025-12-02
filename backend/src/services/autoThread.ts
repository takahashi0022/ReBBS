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

        // AI投稿を5-8個自動生成（ニュース系は初動を増やす）
        const postCount = Math.floor(Math.random() * 4) + 5;
        const posts: string[] = [];
        
        for (let i = 0; i < postCount; i++) {
          await createAiPost(threadId, title, sourceUrl, posts);
          await sleep(2000); // レート制限対策
        }
      }
    );
  });
}

async function createAiPost(threadId: number, topic: string, sourceUrl?: string, posts?: string[]) {
  try {
    const content = await generateNanjPost(topic, posts || [], sourceUrl);
    const authorName = getRandomAuthorName();

    db.run(
      'INSERT INTO posts (thread_id, author_name, content) VALUES (?, ?, ?)',
      [threadId, authorName, content]
    );

    db.run('UPDATE threads SET post_count = post_count + 1, last_post_at = CURRENT_TIMESTAMP WHERE id = ?', [threadId]);
    
    // postsが渡されていれば追加（会話の継続性のため）
    if (posts) {
      posts.push(content);
    }
  } catch (error) {
    console.error('AI post creation error:', error);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ランダムなトピックでスレッド作成（多様なジャンル）
const randomTopics = [
  // オカルト・怖い話系
  '最近見た怖い夢の話',
  '人生で一番怖かった体験',
  '誰にも言えない秘密',
  '夜中に聞こえた謎の音',
  '実家の蔵から変なもの出てきたんだが',
  
  // 人生・後悔系
  '人生で一番後悔してること',
  '後悔してる選択',
  '人生でやり直したいこと',
  '過去に戻れるなら何をする',
  '忘れられない人',
  
  // 思い出・ノスタルジー系
  '忘れられない思い出',
  '昔の流行で覚えてること',
  '人生で一番幸せだった瞬間',
  '昔は良かったと思うこと',
  '昔と今で変わったこと',
  
  // 社会・時事系
  '今の時代について思うこと',
  '今の若者について思うこと',
  '今の世の中で理解できないこと',
  '日本の未来どうなると思う',
  '最近の物価高ヤバすぎやろ',
  
  // IT・仕事系
  '金曜夕方に仕様変更きたんだが',
  '新人が昼休憩から戻ってこない件',
  'デスマーチ中のやつ集合',
  'PMの無茶振りで打線組んだ',
  '残業100時間超えたことあるやつおる？',
  
  // 恋愛・独身系
  'クリスマスの予定が白紙なやつ',
  '彼女いない歴＝年齢のやつ',
  '結婚できる気がしないんだが',
  '告白して振られた思い出',
  
  // 自己啓発・意識高い系（皮肉）
  '成功者の共通点見つけたわ',
  '年収1000万超えてるやつの特徴',
  '勝ち組と負け組の違いって何？',
  
  // スポーツ・エンタメ系
  '今年のプロ野球どこが優勝する？',
  '最近のアニメで面白いやつ',
  '昔のゲームの思い出語ろうや',
  
  // 哲学・人生観系
  '死ぬ前にやりたいこと',
  '生まれ変わったら何になりたい',
  '人生で学んだ大切なこと',
  '誰かに伝えたかった言葉',
  '幸せって何だと思う？'
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

        // 初期投稿を8-12件生成（会話の応酬を増やす）
        const postCount = Math.floor(Math.random() * 5) + 8;
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
