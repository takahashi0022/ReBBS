import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { nanjVocabulary } from '../data/nanjVocabulary';
import { checkAndIncrementUsage } from './costControl';
import { getPromptForLanguage, type LanguageCode } from './prompts';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

// 会話パターンの種類
type ConversationPattern = 
  | 'source_debate'      // ソース論争
  | 'status_auction'     // ステータスオークション
  | 'self_deprecation'   // 自虐・傷の舐め合い
  | 'flip_flop'          // 手のひら返し
  | 'label_battle'       // レッテル貼り合戦
  | 'it_despair'         // IT業界の絶望
  | 'news_cynicism'      // ニュースへの冷笑
  | 'normal';            // 通常会話

// 会話パターンを判定
function detectConversationPattern(topic: string, previousPosts: string[]): ConversationPattern {
  const topicLower = topic.toLowerCase();
  const recentText = previousPosts.slice(-3).join(' ');
  
  // ソース論争パターン
  if (recentText.includes('ソース') || recentText.includes('根拠') || recentText.includes('証拠')) {
    return 'source_debate';
  }
  
  // ステータスオークション
  if (recentText.match(/年収|学歴|大学|勝ち組|負け組/)) {
    return 'status_auction';
  }
  
  // 手のひら返し（スポーツ・評価系）
  if (topicLower.match(/選手|試合|勝利|敗北/) || recentText.match(/アンチ|信者/)) {
    return 'flip_flop';
  }
  
  // IT業界の絶望
  if (topicLower.match(/仕様変更|納期|デスマ|pm|プログラ|システム|バグ/) || recentText.match(/仕様|納期|残業/)) {
    return 'it_despair';
  }
  
  // ニュース冷笑
  if (topicLower.match(/政府|増税|政治|大臣|上級/) || recentText.match(/上級|終わり|オワコン/)) {
    return 'news_cynicism';
  }
  
  // 自虐パターン
  if (recentText.match(/クリスマス|バレンタイン|彼女|彼氏|独身|結婚/) || topicLower.match(/恋愛|結婚/)) {
    return 'self_deprecation';
  }
  
  return 'normal';
}

// パターン別のプロンプト生成
function generatePatternPrompt(pattern: ConversationPattern, topic: string, recentPosts: string[]): string {
  const lastPost = recentPosts[recentPosts.length - 1] || '';
  
  switch (pattern) {
    case 'source_debate':
      return `【ソース論争モード】
直前の投稿: "${lastPost}"

以下のいずれかの反応をせよ（短く1文で）：
- 「ソースは？」「証拠出せ」と要求する
- 「ググれ」「情弱乙」と煽る
- 「顔真っ赤で草」「効いてて草」と精神的優位を取る
- 「結局ソースなしかよ」と呆れる
- 学歴や経歴でマウントを取る

絶対に1文のみ、20-40文字程度、句点で終わる：`;

    case 'status_auction':
      return `【ステータスオークションモード】
直前の投稿: "${lastPost}"

以下のいずれかの反応をせよ（短く1文で）：
- より高い年収・学歴を主張する（盛ってOK）
- 「低すぎワロタ」「底辺やん」と煽る
- 「証拠うｐ」と要求する
- 「妄想年収バトル会場はここですか？」と冷める
- 具体的な数字や大学名を出してマウント

絶対に1文のみ、20-40文字程度、句点で終わる：`;

    case 'self_deprecation':
      return `【自虐・傷の舐め合いモード】
直前の投稿: "${lastPost}"

以下のいずれかの反応をせよ（短く1文で）：
- 「知ってた」「お前らｗｗｗ」と共感
- より不幸な状況を語る（不幸自慢）
- 「来世で会おうぜ」「もう終わりだよ」と諦める
- 「ストロングゼロで気絶する」など具体的な自虐
- 謎の連帯感と安心感を示す

絶対に1文のみ、20-40文字程度、句点で終わる：`;

    case 'flip_flop':
      return `【手のひら返しモード】
直前の投稿: "${lastPost}"

以下のいずれかの反応をせよ（短く1文で）：
- 急に評価を180度変える
- 「ファッ!?」「マジかよ」と驚く
- 「アンチ息してる～？」と煽る
- 「一生ついていきます」と掌返し
- 「土下座の準備しとけよ」と過去の発言を掘り返す

絶対に1文のみ、20-40文字程度、句点で終わる：`;

    case 'it_despair':
      return `【IT業界の絶望モード】
直前の投稿: "${lastPost}"

以下のいずれかの反応をせよ（短く1文で）：
- 「死亡確認」「逃げろ」と警告
- 「仕様書＝ソースコード」など自虐
- 「PM「簡単な修正だから」」とテンプレ
- 「やめろその話は俺に効く」と共感
- 「飛ぶ（バックレ）」を称賛する

絶対に1文のみ、20-40文字程度、句点で終わる：`;

    case 'news_cynicism':
      return `【ニュース冷笑モード】
直前の投稿: "${lastPost}"

以下のいずれかの反応をせよ（短く1文で）：
- 「はいはい上級上級」と皮肉
- 「もう終わりだよこの国」と絶望
- 「ありがとう自民党！」と皮肉
- 「美しい国ですよ」と冷笑
- 「勲章は？」「プリウスミサイル」などのネタ

絶対に1文のみ、20-40文字程度、句点で終わる：`;

    default:
      return `【通常会話モード】
直前の投稿: "${lastPost}"

前の投稿に対して自然に反応せよ：
- 同意・反論・補足・ツッコミ・ボケなど
- 全く違う視点や表現で
- 絶対に1文のみ、20-40文字程度
- 句点で終わる

返信：`;
  }
}

export async function generateNanjPost(topic: string, previousPosts: string[] = [], sourceUrl?: string, language: LanguageCode = 'ja'): Promise<string> {
  // コスト制御チェック
  const usageCheck = await checkAndIncrementUsage();
  if (!usageCheck.allowed) {
    console.warn(`⚠️  Bedrock request blocked: ${usageCheck.reason}`);
    // フォールバック: ランダムな語録を返す
    return nanjVocabulary[Math.floor(Math.random() * nanjVocabulary.length)];
  }

  const recentPosts = previousPosts.slice(-8);
  
  // 言語別のベースプロンプトを取得
  const basePrompt = getPromptForLanguage(language);
  
  const context = recentPosts.length > 0 
    ? `\n\n【Recent Conversation / 直近の会話】\n${recentPosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : '';

  const sourceContext = sourceUrl 
    ? `\n\n【News Source / ニュース元】\n${sourceUrl}` 
    : '';

  // 言語別の強調メッセージ
  const languageReminder = {
    ja: '日本語で返信してください。',
    en: 'Reply in English only.',
    zh: '请用中文回复。',
    ko: '한국어로만 답변하세요.',
    es: 'Responde solo en español.',
    fr: 'Réponds uniquement en français.',
    de: 'Antworte nur auf Deutsch.',
    pt: 'Responda apenas em português.',
  }[language] || 'Reply in your designated language only.';

  // 日本語の場合は既存のパターン検出を使用
  let patternPrompt = '';
  if (language === 'ja') {
    const pattern = detectConversationPattern(topic, recentPosts);
    patternPrompt = generatePatternPrompt(pattern, topic, recentPosts);
  } else {
    // 他言語の場合はシンプルな指示
    const lastPost = recentPosts[recentPosts.length - 1] || '';
    patternPrompt = lastPost 
      ? `Previous post: "${lastPost}"\n\nReact to this post naturally in your language style. ${languageReminder}`
      : `Discuss this topic naturally in your language style. ${languageReminder}`;
  }

  const prompt = `${basePrompt}

【Topic / トピック】
${topic}${sourceContext}${context}

${patternPrompt}

IMPORTANT: ${languageReminder}

Your response:`;

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 200,
        temperature: 1.0,
        top_p: 0.95,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Bedrock API error:', error);
    return nanjVocabulary[Math.floor(Math.random() * nanjVocabulary.length)];
  }
}
