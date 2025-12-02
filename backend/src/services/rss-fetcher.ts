import Parser from 'rss-parser';

export interface NewsArticle {
  title: string;
  url: string;
  publishedAt?: Date;
  category?: string;
}

// IT・科学・スポーツ・エンタメに特化したRSSフィード
const RSS_FEEDS = [
  // IT・テクノロジー
  'https://www.wired.com/feed/rss',
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  
  // 科学
  'https://www.sciencedaily.com/rss/all.xml',
  'https://www.space.com/feeds/all',
  
  // スポーツ
  'https://www.espn.com/espn/rss/news',
  'http://rss.cnn.com/rss/edition_sport.rss',
  
  // エンタメ
  'https://variety.com/feed/',
  'http://rss.cnn.com/rss/edition_entertainment.rss',
];

/**
 * 国際ニュースをRSSから取得
 */
export async function fetchInternationalNews(): Promise<NewsArticle[]> {
  const parser = new Parser({
    timeout: 10000,
  });

  const allArticles: NewsArticle[] = [];

  console.log(`📡 Fetching news from ${RSS_FEEDS.length} RSS feeds...`);

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`  Fetching: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      console.log(`  ✅ Got ${feed.items.length} items from ${feedUrl}`);
      
      for (const item of feed.items.slice(0, 20)) {
        if (!item.title || !item.link) continue;

        allArticles.push({
          title: item.title,
          url: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        });
      }
    } catch (error) {
      console.error(`  ❌ Failed to fetch RSS feed ${feedUrl}:`, error);
    }
  }

  console.log(`📰 Total articles fetched: ${allArticles.length}`);
  return allArticles;
}

/**
 * ニュースの優先度をスコアリング
 */
export function prioritizeNews(articles: NewsArticle[]): NewsArticle[] {
  const scored = articles.map(article => ({
    ...article,
    score: calculateNewsScore(article),
  }));

  // スコアが0以上のもののみを返す（センシティブなニュースを除外）
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...article }) => article);
}

/**
 * ニュースのスコアを計算
 */
function calculateNewsScore(article: NewsArticle): number {
  let score = 0;
  const titleLower = article.title.toLowerCase();

  // 高優先度キーワード（IT・科学・スポーツ・エンタメ）- ポジティブなもの
  const highPriorityKeywords = [
    // IT・テクノロジー
    'AI', 'artificial intelligence', 'tech', 'technology', 'software', 'hardware',
    'smartphone', 'app', 'startup', 'innovation', 'robot', 'drone', 'gadget',
    'launch', 'release', 'update', 'feature', 'design', 'breakthrough',
    'アプリ', 'スマホ', 'テクノロジー', 'ロボット', '新製品', '発売', 'リリース',
    
    // 科学（ポジティブな発見）
    'science', 'research', 'discovery', 'space', 'NASA', 'planet', 'astronomy',
    'biology', 'physics', 'chemistry', 'breakthrough', 'innovation', 'cure',
    'Mars', 'moon', 'galaxy', 'star', 'telescope', 'mission',
    '科学', '研究', '発見', '宇宙', '惑星', '火星', '月', '銀河', '望遠鏡',
    
    // スポーツ（試合・記録）
    'sports', 'game', 'championship', 'tournament', 'win', 'victory', 'record',
    'football', 'soccer', 'basketball', 'baseball', 'tennis', 'olympics',
    'goal', 'score', 'champion', 'medal', 'trophy',
    'スポーツ', '試合', '優勝', '記録', 'ゴール', 'メダル', 'トロフィー',
    
    // エンタメ（作品・イベント）
    'movie', 'film', 'music', 'album', 'concert', 'show', 'performance',
    'entertainment', 'celebrity', 'award', 'festival', 'anime', 'game',
    'premiere', 'trailer', 'release', 'debut', 'hit',
    '映画', '音楽', 'アニメ', 'ゲーム', 'コンサート', '公開', '初公開', 'ヒット',
  ];

  highPriorityKeywords.forEach(keyword => {
    if (titleLower.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });

  // センシティブ・危険なキーワードを含む場合はスコアを大幅に下げる（除外）
  const excludeKeywords = [
    // 政治・戦争
    'war', 'military', 'weapon', 'attack', 'bomb', 'terror', 'conflict',
    'election', 'president', 'minister', 'government', 'politics', 'political',
    'sanctions', 'treaty', 'crisis', 'protest', 'riot',
    '戦争', '軍事', '攻撃', '爆弾', 'テロ', '紛争',
    '選挙', '大統領', '首相', '政府', '政治',
    '制裁', '条約', '危機', 'デモ',
    
    // 犯罪・事件
    'murder', 'kill', 'death', 'dead', 'suicide', 'assault', 'rape', 'abuse',
    'crime', 'criminal', 'arrest', 'police', 'victim', 'shooting', 'stabbing',
    '殺人', '殺害', '死亡', '死去', '自殺', '自死', '暴行', '暴力', '虐待',
    '犯罪', '逮捕', '容疑', '被害', '事件', '刺殺', '銃撃',
    
    // 事故・災害
    'accident', 'crash', 'disaster', 'earthquake', 'tsunami', 'fire', 'explosion',
    '事故', '衝突', '墜落', '火災', '爆発', '地震', '津波', '災害',
    
    // その他センシティブ
    'scandal', 'controversy', 'lawsuit', 'fraud', 'corruption',
    'スキャンダル', '不祥事', '訴訟', '詐欺', '汚職', '疑惑',
  ];

  let hasExcludedContent = false;
  excludeKeywords.forEach(keyword => {
    if (titleLower.includes(keyword.toLowerCase())) {
      hasExcludedContent = true;
    }
  });

  // 除外キーワードが含まれる場合はスコアを-1000にして完全除外
  if (hasExcludedContent) {
    score -= 1000;
  }
  
  // スコアが0以下の場合は完全に除外
  if (score <= 0) {
    score = -1000;
  }

  // 新しいニュースを優先
  if (article.publishedAt) {
    const ageInHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
    if (ageInHours < 1) score += 15;
    else if (ageInHours < 6) score += 10;
    else if (ageInHours < 24) score += 5;
  }

  return score;
}
