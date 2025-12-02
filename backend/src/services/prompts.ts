import fs from 'fs';
import path from 'path';
import languageConfig from '../data/language-config.json';

export interface LanguageConfig {
  name: string;
  tier: number;
  icon: string;
  description: string;
}

export type LanguageCode = 'ja' | 'en' | 'zh' | 'ko' | 'es' | 'fr' | 'de' | 'pt';

const promptCache: Map<LanguageCode, string> = new Map();

/**
 * 言語設定を取得
 */
export function getLanguageConfig(lang: LanguageCode): LanguageConfig | null {
  return (languageConfig as Record<string, LanguageConfig>)[lang] || null;
}

/**
 * 全言語設定を取得
 */
export function getAllLanguages(): Record<string, LanguageConfig> {
  return languageConfig as Record<string, LanguageConfig>;
}

/**
 * 言語別プロンプトを読み込み
 */
export function getPromptForLanguage(lang: LanguageCode): string {
  // キャッシュチェック
  if (promptCache.has(lang)) {
    return promptCache.get(lang)!;
  }

  // プロンプトファイルのマッピング
  const promptFiles: Record<LanguageCode, string> = {
    ja: 'ja-nanj.txt',
    en: 'en-4chan.txt',
    zh: 'zh-casual.txt',
    ko: 'ko-casual.txt',
    es: 'es-casual.txt',
    fr: 'fr-casual.txt',
    de: 'de-casual.txt',
    pt: 'pt-casual.txt',
  };

  const fileName = promptFiles[lang];
  if (!fileName) {
    // デフォルトは日本語
    return getPromptForLanguage('ja');
  }

  try {
    const promptPath = path.join(__dirname, '../data/prompts', fileName);
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    promptCache.set(lang, prompt);
    return prompt;
  } catch (error) {
    console.error(`Failed to load prompt for ${lang}:`, error);
    // フォールバック
    if (lang !== 'ja') {
      return getPromptForLanguage('ja');
    }
    return '';
  }
}

/**
 * ランダムに言語を選択（日本語以外）
 */
export function selectRandomLanguages(count: number): LanguageCode[] {
  const allLangs: LanguageCode[] = ['en', 'zh', 'ko', 'es', 'fr', 'de', 'pt'];
  const shuffled = allLangs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * ニュースタイトルを翻訳（簡易版）
 */
export async function translateTitle(title: string, targetLang: LanguageCode): Promise<string> {
  // 実際の翻訳はBedrockで行うが、ここでは簡易的に元のタイトルを返す
  // 必要に応じてBedrockの翻訳APIを使用
  if (targetLang === 'ja') {
    return title;
  }
  
  // 簡易的な翻訳プレフィックス
  const prefixes: Record<LanguageCode, string> = {
    ja: '',
    en: '[EN] ',
    zh: '[中文] ',
    ko: '[한국어] ',
    es: '[ES] ',
    fr: '[FR] ',
    de: '[DE] ',
    pt: '[PT] ',
  };
  
  return `${prefixes[targetLang]}${title}`;
}
