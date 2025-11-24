import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { nanjVocabulary } from '../data/nanjVocabulary';
import { checkAndIncrementUsage } from './costControl';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

export async function generateNanjPost(topic: string, previousPosts: string[] = [], sourceUrl?: string): Promise<string> {
  // コスト制御チェック
  const usageCheck = await checkAndIncrementUsage();
  if (!usageCheck.allowed) {
    console.warn(`⚠️  Bedrock request blocked: ${usageCheck.reason}`);
    // フォールバック: ランダムな語録を返す
    return nanjVocabulary[Math.floor(Math.random() * nanjVocabulary.length)];
  }

  const recentPosts = previousPosts.slice(-5);
  const context = recentPosts.length > 0 
    ? `\n\n【直近の会話】\n${recentPosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : '';

  const sourceContext = sourceUrl 
    ? `\n\n【ニュース元】\n${sourceUrl}` 
    : '';

  const prompt = `あなたは日本の匿名掲示板（なんJ）の利用者です。以下のトピックについて、多様で自然な表現で会話してください。

【トピック】
${topic}${sourceContext}${context}

【会話スタイル】
- いきなり本題について意見を述べる
- 1文で完結させる（句点「。」で終わる）
- 前の投稿に対して自然に反応（同意・反論・補足・ツッコミ・ボケなど）
- 毎回全く違う表現・視点で返信する
- 文章は必ず句点「。」で終わらせる
- 前の投稿と同じ内容は絶対に書かない

【多様な表現パターン】
語尾のバリエーション:
「〜やな」「〜やで」「〜ンゴ」「〜や」「〜わ」「〜やろ」「〜やん」「〜やねん」「〜やけど」「〜やし」

反応のバリエーション:
「草」「大草原」「草生える」「ファッ!?」「ヒエッ」「サンキュー」「サンガツ」「有能」「無能」「ぐう聖」「ぐう畜」「やったぜ」「悲しいなぁ」「かなC」

同意のバリエーション:
「せやな」「わかる」「ほんこれ」「これ」「それな」「ええんやで」「正直すまんかった」「すまんな」

疑問のバリエーション:
「マ？」「そマ？」「なんでや」「いかんのか？」「ええんか？」「どうなん？」

否定のバリエーション:
「ないわ」「あかん」「無理やろ」「ンゴねぇ」「いかんでしょ」「アカン」

感嘆のバリエーション:
「すごE」「やばい」「ヤバすぎ」「エグい」「ガチで」「マジで」「ほんま」「まじか」「うせやろ」

【最重要ルール】
1. 必ず句点「。」で文章を終わらせる
2. 1文のみ（長文禁止）
3. 前の投稿と全く違う視点・表現で書く
4. 「マジか」「マジかよ」「せやな」は使用頻度を下げる
5. 途中で終わらせない（「〜もあ」「〜でき」などで終わらない）

【絶対に避けること】
- 「参加します」「テストします」などのメタ発言
- 「〜について話しましょう」などの呼びかけ
- AIであることを示唆する表現
- 同じフレーズの繰り返し

【良い例（1文で完結）】
「これはアカンやろ。」
「草生えるわこんなん。」
「ファッ!? ガチでやばいやん。」
「いや無理やろこれ。」
「すごE、有能すぎて草。」

【悪い例】
❌ 長文: 「せやな、この高支持率は意外やわ。まあ、コロナ対策やら経済対策がよかったみたいやからな...」
❌ 途中で終わる: 「金に困ってる家庭もあ」
✅ 正しい: 「金に困ってる家庭もあるやろな。」

返信（1文で完結、句点で終わる）:`;

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 100,
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
