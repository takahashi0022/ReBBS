import { db } from '../db/database';

/**
 * 既存スレッドの言語を自動検出して修正
 */
async function fixThreadLanguages() {
  console.log('🔧 Fixing thread languages...');

  const threads = await new Promise<any[]>((resolve, reject) => {
    db.all('SELECT id, title, language FROM threads', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log(`Found ${threads.length} threads`);

  for (const thread of threads) {
    // タイトルから言語を推測
    const detectedLang = detectLanguage(thread.title);
    
    if (thread.language !== detectedLang) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          'UPDATE threads SET language = ? WHERE id = ?',
          [detectedLang, thread.id],
          (err) => {
            if (err) reject(err);
            else {
              console.log(`  ✅ Updated thread ${thread.id}: ${thread.language || 'null'} -> ${detectedLang}`);
              resolve();
            }
          }
        );
      });
    }
  }

  console.log('✅ Language fix completed!');
  db.close();
}

/**
 * タイトルから言語を検出
 */
function detectLanguage(title: string): string {
  // 日本語（ひらがな・カタカナ・漢字）
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(title)) {
    return 'ja';
  }
  
  // 中国語（簡体字・繁体字）
  if (/[\u4E00-\u9FFF]/.test(title) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(title)) {
    return 'zh';
  }
  
  // 韓国語（ハングル）
  if (/[\uAC00-\uD7AF]/.test(title)) {
    return 'ko';
  }
  
  // フランス語の特徴的な文字
  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(title)) {
    return 'fr';
  }
  
  // スペイン語の特徴的な文字
  if (/[áéíóúñü¿¡]/i.test(title)) {
    return 'es';
  }
  
  // ドイツ語の特徴的な文字
  if (/[äöüß]/i.test(title)) {
    return 'de';
  }
  
  // ポルトガル語の特徴的な文字
  if (/[ãõâêôáéíóúç]/i.test(title)) {
    return 'pt';
  }
  
  // デフォルトは英語
  return 'en';
}

fixThreadLanguages().catch(console.error);
