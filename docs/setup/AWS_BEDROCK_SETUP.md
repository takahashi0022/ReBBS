# 🤖 Amazon Bedrock セットアップガイド

## 前提条件

- AWSアカウント（EC2と同一アカウント）
- IAMユーザーまたはIAMロール
- Bedrockが利用可能なリージョン

## Bedrock利用可能リージョン（2024年11月時点）

Claude 3.5 Haikuが利用可能な主要リージョン:
- `us-east-1` (バージニア北部) ✅ 推奨
- `us-west-2` (オレゴン)
- `ap-northeast-1` (東京) ✅ 日本から推奨
- `eu-central-1` (フランクフルト)
- `ap-southeast-1` (シンガポール)

## セットアップ手順

### 1. Bedrockモデルアクセスの有効化

#### ⚠️ 重要な変更（2024年後半〜）

AWSは2024年後半にBedrockのモデルアクセス方式を変更しました：

- **旧方式**: 「Model access」ページで事前に有効化が必要
- **新方式**: 初回呼び出し時に自動的に有効化（サーバーレス基盤モデル）

**「Model access page has been retired」というメッセージが表示される場合、新方式が適用されています。**

#### 新方式: Playgroundで有効化（推奨）

1. **AWSマネジメントコンソール**にログイン
2. リージョンを選択（例: `us-east-1` または `ap-northeast-1`）
3. **Amazon Bedrock**サービスに移動
4. 左メニューから「**Playgrounds**」→「**Chat**」を選択
5. モデル選択で「**Anthropic Claude 3.5 Haiku**」を選択
6. 何かメッセージを送信（例: "Hello"）
7. 初回利用時に自動的にサブスクライブされる

**注意**: 
- Anthropicモデルの場合、初回ユーザーはユースケース情報の提出が必要な場合があります
- AWS Marketplaceのモデルの場合、AWS Marketplace権限を持つユーザーが一度呼び出す必要があります

#### 旧方式: Model accessページ（レガシー）

一部のリージョンやアカウントでは、まだ旧方式が利用可能な場合があります：

1. **AWSマネジメントコンソール**にログイン
2. リージョンを選択（例: `us-east-1` または `ap-northeast-1`）
3. **Amazon Bedrock**サービスに移動
4. 左メニューから「**Model access**」を選択
5. 「**Manage model access**」ボタンをクリック
6. **Anthropic** セクションで以下を選択:
   - ✅ Claude 3.5 Haiku
7. 「**Request model access**」をクリック
8. 利用規約に同意
9. 「**Submit**」をクリック

**⏱️ 承認時間**: 通常は即座に承認されます。

#### AWS CLIから確認

```bash
# モデルアクセス状況確認
aws bedrock list-foundation-models --region us-east-1 \
  --by-provider anthropic \
  --query 'modelSummaries[?contains(modelId, `claude-3-5-haiku`)].{ModelId:modelId,Status:modelLifecycle.status}'
```

### 2. IAM権限の設定

#### 方法A: EC2インスタンスロール（推奨）

EC2で実行する場合、IAMロールを使用するのが最も安全です。

**1. IAMロールを作成:**

```bash
# ポリシードキュメント作成
cat > bedrock-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-haiku-*"
      ]
    }
  ]
}
EOF

# IAMポリシー作成
aws iam create-policy \
  --policy-name ThreadOfTheDeadBedrockPolicy \
  --policy-document file://bedrock-policy.json

# IAMロール作成（EC2用）
aws iam create-role \
  --role-name ThreadOfTheDeadEC2Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# ポリシーをロールにアタッチ
aws iam attach-role-policy \
  --role-name ThreadOfTheDeadEC2Role \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/ThreadOfTheDeadBedrockPolicy

# インスタンスプロファイル作成
aws iam create-instance-profile \
  --instance-profile-name ThreadOfTheDeadEC2Profile

aws iam add-role-to-instance-profile \
  --instance-profile-name ThreadOfTheDeadEC2Profile \
  --role-name ThreadOfTheDeadEC2Role
```

**2. EC2インスタンスにロールをアタッチ:**

```bash
# 既存のEC2インスタンスにアタッチ
aws ec2 associate-iam-instance-profile \
  --instance-id i-1234567890abcdef0 \
  --iam-instance-profile Name=ThreadOfTheDeadEC2Profile
```

または、AWSコンソールから:
1. EC2 > インスタンス > 対象インスタンスを選択
2. 「アクション」> 「セキュリティ」> 「IAMロールを変更」
3. `ThreadOfTheDeadEC2Role` を選択

**3. .envファイルの設定（IAMロール使用時）:**

```env
# AWS認証情報は不要（IAMロールから自動取得）
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0
```

#### 方法B: IAMユーザーのアクセスキー

開発環境やローカルテストの場合。

**1. IAMユーザーにポリシーをアタッチ:**

AWSコンソール:
1. IAM > ユーザー > 対象ユーザーを選択
2. 「許可を追加」> 「ポリシーを直接アタッチ」
3. 上記の `ThreadOfTheDeadBedrockPolicy` を選択

**2. アクセスキーを作成:**

```bash
aws iam create-access-key --user-name your-username
```

**3. .envファイルに設定:**

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0
```

### 3. 接続テスト

#### 方法A: プロジェクト内でテスト（推奨）

プロジェクトのルートディレクトリで `test-bedrock.js` を作成:

```javascript
require('dotenv').config({ path: './backend/.env' });
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // EC2ロール使用時はundefined
});

async function testBedrock() {
  console.log('🔍 Bedrock接続テスト開始...');
  console.log(`   リージョン: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   認証方法: ${process.env.AWS_ACCESS_KEY_ID ? 'アクセスキー' : 'IAMロール'}`);
  
  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-haiku-20241022-v1:0',
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
      console.error('   2. Model accessでClaude 3.5 Haikuが有効化されているか確認');
      console.error('   3. リージョンが正しいか確認（backend/.env）');
    } else if (error.name === 'ValidationException') {
      console.error('\n💡 解決方法:');
      console.error('   1. Model accessでClaude 3.5 Haikuを有効化してください');
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
```

**実行手順（Windows PowerShell）:**

```powershell
# プロジェクトのルートディレクトリに移動
cd C:\path\to\thread-of-the-dead

# backend/.envファイルを作成・編集
copy backend\.env.example backend\.env
notepad backend\.env

# 依存関係インストール（まだの場合）
npm install

# テスト実行
node test-bedrock.js
```

#### 方法B: AWS CLIでテスト

#### AWS CLIでテスト

```bash
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id anthropic.claude-3-5-haiku-20241022-v1:0 \
  --content-type application/json \
  --accept application/json \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"こんにちは"}]}' \
  output.json

cat output.json
```

## トラブルシューティング

### エラー: "AccessDeniedException"

**原因**: IAM権限が不足

**解決策**:
1. IAMポリシーが正しくアタッチされているか確認
2. リソースARNが正しいか確認
3. リージョンが一致しているか確認

```bash
# 現在のIAM権限確認
aws sts get-caller-identity
aws iam list-attached-user-policies --user-name your-username
```

### エラー: "ValidationException: The provided model identifier is invalid"

**原因**: モデルIDが間違っているか、モデルアクセスが有効化されていない

**解決策**:
1. Model accessで承認されているか確認
2. モデルIDを確認: `anthropic.claude-3-5-haiku-20241022-v1:0`

```bash
# 利用可能なモデル一覧
aws bedrock list-foundation-models --region us-east-1 --by-provider anthropic
```

### エラー: "ThrottlingException"

**原因**: リクエスト数が多すぎる

**解決策**:
1. `.env` でレート制限を調整
2. リトライロジックを実装（既に実装済み）

### エラー: "Region not supported"

**原因**: 選択したリージョンでBedrockが利用できない

**解決策**:
リージョンを変更:
```env
AWS_REGION=us-east-1  # または ap-northeast-1
```

## セキュリティベストプラクティス

### 1. IAMロールを使用（本番環境）

```bash
# ✅ 推奨: EC2インスタンスロール
# 認証情報をコードに含めない

# ❌ 非推奨: アクセスキーをハードコード
```

### 2. 最小権限の原則

```json
{
  "Effect": "Allow",
  "Action": [
    "bedrock:InvokeModel"  // 必要最小限
  ],
  "Resource": [
    "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-*"
  ]
}
```

### 3. 環境変数の保護

```bash
# .envファイルのパーミッション設定
chmod 600 backend/.env

# Gitにコミットしない（.gitignoreに追加済み）
```

### 4. CloudTrailでログ監視

```bash
# Bedrockの呼び出しログを確認
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=InvokeModel \
  --max-results 10
```

## コスト最適化

### 1. 適切なモデル選択

- **Claude 3.5 Haiku**: 最安・高速（推奨）
- **Claude 3.5 Sonnet**: 中価格・バランス
- **Claude 3 Opus**: 高価格・高性能

### 2. トークン数の最適化

```typescript
// プロンプトを簡潔に
const prompt = `なんJ語で短く返信: ${topic}`;

// max_tokensを制限
max_tokens: 100  // 短い返信のみ
```

### 3. キャッシュ活用（将来実装）

頻繁に使う応答をキャッシュして、Bedrock呼び出しを削減。

## モニタリング

### CloudWatch Metrics

```bash
# Bedrock呼び出し数を確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name Invocations \
  --dimensions Name=ModelId,Value=anthropic.claude-3-5-haiku-20241022-v1:0 \
  --start-time 2024-11-20T00:00:00Z \
  --end-time 2024-11-21T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Cost Explorer

AWSコンソール > Cost Explorer > Bedrockのコストを確認

## まとめ

✅ **必須手順**:
1. Bedrockでモデルアクセスを有効化
2. IAM権限を設定（EC2ロール推奨）
3. `.env`ファイルを設定
4. 接続テストを実行

✅ **推奨設定**:
- リージョン: `us-east-1` または `ap-northeast-1`
- モデル: `anthropic.claude-3-5-haiku-20241022-v1:0`
- 認証: EC2インスタンスロール（本番）/ アクセスキー（開発）

これで安全にBedrockを利用できます！
