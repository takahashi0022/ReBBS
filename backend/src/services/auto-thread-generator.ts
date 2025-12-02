import { db } from '../db/database';
import { fetchInternationalNews, prioritizeNews } from './rss-fetcher';
import { filterRecentlyProcessedNews, markAsProcessed } from './news-processor';
import { selectRandomLanguages, translateTitle, type LanguageCode } from './prompts';
import { generateNanjPost } from './bedrock';
import { getRandomAuthorName } from '../data/nanjVocabulary';
import { v4 as uuidv4 } from 'uuid';

/**
 * 自動スレッド生成のメイン処理
 */
export async function generateAutoThreads(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] 🤖 Starting auto thread generation...`);

    // 1. ニュース取得
    const news = await fetchInternationalNews();
    if (news.length === 0) {
      console.log('No news articles found');
      return;
    }

    // 2. 優先度順にソート
    const prioritized = prioritizeNews(news);

    // 3. 過去1時間以内に処理済みのニュースを除外
    const unprocessed = await filterRecentlyProcessedNews(prioritized, 60);
    
    if (unprocessed.length === 0) {
      console.log('No new news to process');
      return;
    }

    // 4. 最も優先度の高い1記事を選択
    const article = unprocessed[0];
    console.log(`📰 Selected article: ${article.title}`);

    // 4.5. このURLで既にスレッドが作成されているかチェック
    const existingThread = await new Promise<any>((resolve) => {
      db.get(
        'SELECT id FROM threads WHERE source_url = ? LIMIT 1',
        [article.url],
        (err, row) => {
          if (err) console.error('Error checking existing thread:', err);
          resolve(row);
        }
      );
    });

    if (existingThread) {
      console.log(`⏭️  Skipping: Thread already exists for this URL`);
      // 次の記事を試す
      if (unprocessed.length > 1) {
        const nextArticle = unprocessed[1];
        console.log(`📰 Trying next article: ${nextArticle.title}`);
        
        const nextExisting = await new Promise<any>((resolve) => {
          db.get('SELECT id FROM threads WHERE source_url = ? LIMIT 1', [nextArticle.url], (err, row) => {
            resolve(row);
          });
        });
        
        if (nextExisting) {
          console.log('⏭️  Next article also exists, skipping this run');
          return;
        }
        
        // 次の記事で続行
        const languages: LanguageCode[] = ['ja', ...selectRandomLanguages(3)];
        const groupId = uuidv4();
        console.log(`🌍 Languages: ${languages.join(', ')}`);
        
        await Promise.all(
          languages.map(async (lang) => {
            try {
              await createAutoThread(nextArticle.title, nextArticle.url, lang, groupId);
            } catch (error) {
              console.error(`Failed to create thread for ${lang}:`, error);
            }
          })
        );
        
        await markAsProcessed(nextArticle.url, nextArticle.title);
        console.log(`✅ Auto thread generation completed for: ${nextArticle.title}`);
      } else {
        console.log('No more articles to process');
      }
      return;
    }

    // 5. 言語選択（日本語 + ランダム3言語）
    const languages: LanguageCode[] = ['ja', ...selectRandomLanguages(3)];
    const groupId = uuidv4();

    console.log(`🌍 Languages: ${languages.join(', ')}`);

    // 6. 並列でスレッド作成
    await Promise.all(
      languages.map(async (lang) => {
        try {
          await createAutoThread(article.title, article.url, lang, groupId);
        } catch (error) {
          console.error(`Failed to create thread for ${lang}:`, error);
        }
      })
    );

    // 7. 処理済みとしてマーク
    await markAsProcessed(article.url, article.title);

    console.log(`✅ Auto thread generation completed for: ${article.title}`);
  } catch (error) {
    console.error('Auto thread generation error:', error);
  }
}

/**
 * 単一言語の自動スレッドを作成
 */
async function createAutoThread(
  title: string,
  sourceUrl: string,
  language: LanguageCode,
  groupId: string
): Promise<void> {
  // タイトルを翻訳（簡易版）
  const translatedTitle = await translateTitle(title, language);

  // スレッド作成
  const threadId = await new Promise<number>((resolve, reject) => {
    db.run(
      `INSERT INTO threads (title, source_url, language, is_auto_generated, linked_thread_group_id, post_count) 
       VALUES (?, ?, ?, 1, ?, 0)`,
      [translatedTitle, sourceUrl, language, groupId],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });

  console.log(`  📝 Created thread [${language}]: ${translatedTitle} (ID: ${threadId})`);

  // 初期投稿を3-4件生成
  const postCount = Math.floor(Math.random() * 2) + 3; // 3 or 4
  const previousPosts: string[] = [];

  for (let i = 0; i < postCount; i++) {
    try {
      const content = await generateNanjPost(translatedTitle, previousPosts, sourceUrl, language);
      const authorName = getRandomAuthorName(language);

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

      previousPosts.push(content);

      // レート制限対策（投稿間隔を短縮）
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to generate post ${i + 1} for thread ${threadId}:`, error);
    }
  }

  // スレッドの投稿数を更新
  await new Promise<void>((resolve) => {
    db.run(
      'UPDATE threads SET post_count = ?, last_post_at = CURRENT_TIMESTAMP WHERE id = ?',
      [previousPosts.length, threadId],
      () => resolve()
    );
  });

  console.log(`  ✅ Generated ${previousPosts.length} posts for thread ${threadId}`);
}

// UUID生成用のパッケージがない場合の簡易実装
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
