require('dotenv').config({ path: './backend/.env' });
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // EC2ロール使用時はundefined
});

async function testBedrock() {
  console.log('🔍 Bedrock接続テスト開始...');
  console.log(`   リージョン: ${process.env.AWS_REGION || 'ap-northeast-1'}`);
  console.log(`   認証方法: ${process.env.AWS_ACCESS_KEY_ID ? 'アクセスキー' : 'IAMロール'}`);
  
  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'こんにちは！なんJ語で挨拶してください。',
          },
        ],
      }),
    });

    console.log('📡 Bedrockにリクエスト送信中...');
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('\n✅ Bedrock接続成功！\n');
    console.log('【AI応答】');
    console.log(responseBody.content[0].text);
    console.log('\n✨ セットアップ完了です！アプリケーションを起動できます。');
  } catch (error) {
    console.error('\n❌ Bedrock接続エラー\n');
    console.error('エラー詳細:', error.message);
    
    if (error.name === 'AccessDeniedException') {
      console.error('\n💡 解決方法:');
      console.error('   1. IAM権限を確認してください');
      console.error('   2. Model accessでClaude 3 Haikuが有効化されているか確認');
      console.error('   3. リージョンが正しいか確認（backend/.env）');
    } else if (error.name === 'ValidationException') {
      console.error('\n💡 解決方法:');
      console.error('   1. Model accessでClaude 3 Haikuを有効化してください');
      console.error('   2. モデルIDが正しいか確認');
    } else if (error.code === 'CredentialsError') {
      console.error('\n💡 解決方法:');
      console.error('   1. backend/.envファイルを確認');
      console.error('   2. AWS_ACCESS_KEY_IDとAWS_SECRET_ACCESS_KEYが正しいか確認');
      console.error('   3. または、EC2インスタンスロールを使用してください');
    }
    
    process.exit(1);
  }
}

testBedrock();
