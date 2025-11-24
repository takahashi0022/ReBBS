# IAMポリシー設定ガイド

Thread of the Deadプロジェクトで必要なIAMポリシーのテンプレート集です。

## 目次

1. [開発者用ポリシー](#開発者用ポリシー)
2. [EC2用IAMロール](#ec2用iamロール)
3. [管理者用ポリシー](#管理者用ポリシー)

---

## 開発者用ポリシー

ローカルPCで開発するメンバー向けのポリシーです。

### 1. CodeCommit アクセスポリシー

**ポリシー名:** `ThreadOfTheDead-CodeCommit-Developer`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CodeCommitAccess",
      "Effect": "Allow",
      "Action": [
        "codecommit:GitPull",
        "codecommit:GitPush",
        "codecommit:CreateBranch",
        "codecommit:DeleteBranch",
        "codecommit:GetBranch",
        "codecommit:ListBranches",
        "codecommit:GetRepository",
        "codecommit:GetCommit",
        "codecommit:GetDifferences",
        "codecommit:GetReferences",
        "codecommit:CreatePullRequest",
        "codecommit:GetPullRequest",
        "codecommit:UpdatePullRequest",
        "codecommit:ListPullRequests",
        "codecommit:GetCommentsForPullRequest",
        "codecommit:PostCommentForPullRequest"
      ],
      "Resource": "arn:aws:codecommit:ap-northeast-1:*:thread-of-the-dead"
    }
  ]
}
```

### 2. Bedrock アクセスポリシー（ローカル開発用）

**ポリシー名:** `ThreadOfTheDead-Bedrock-Developer`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeModel",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    },
    {
      "Sid": "BedrockListModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. 開発者用統合ポリシー

上記2つを統合したポリシーです。

**ポリシー名:** `ThreadOfTheDead-Developer-Full`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CodeCommitAccess",
      "Effect": "Allow",
      "Action": [
        "codecommit:GitPull",
        "codecommit:GitPush",
        "codecommit:CreateBranch",
        "codecommit:DeleteBranch",
        "codecommit:GetBranch",
        "codecommit:ListBranches",
        "codecommit:GetRepository",
        "codecommit:GetCommit",
        "codecommit:GetDifferences",
        "codecommit:GetReferences",
        "codecommit:CreatePullRequest",
        "codecommit:GetPullRequest",
        "codecommit:UpdatePullRequest",
        "codecommit:ListPullRequests",
        "codecommit:GetCommentsForPullRequest",
        "codecommit:PostCommentForPullRequest"
      ],
      "Resource": "arn:aws:codecommit:ap-northeast-1:*:thread-of-the-dead"
    },
    {
      "Sid": "BedrockInvokeModel",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    },
    {
      "Sid": "BedrockListModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## EC2用IAMロール

EC2インスタンスにアタッチするIAMロールです。

### 1. EC2用ロールの作成

**ロール名:** `ThreadOfTheDead-EC2-Role`

**信頼関係:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 2. EC2用ポリシー

**ポリシー名:** `ThreadOfTheDead-EC2-Policy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeModel",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    },
    {
      "Sid": "CodeCommitReadOnly",
      "Effect": "Allow",
      "Action": [
        "codecommit:GitPull",
        "codecommit:GetBranch",
        "codecommit:GetRepository",
        "codecommit:GetCommit"
      ],
      "Resource": "arn:aws:codecommit:ap-northeast-1:*:thread-of-the-dead"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-northeast-1:*:log-group:/aws/ec2/thread-of-the-dead:*"
    }
  ]
}
```

### 3. EC2にロールをアタッチ

**AWSコンソール:**
1. EC2 → インスタンス → 対象のインスタンスを選択
2. アクション → セキュリティ → IAMロールを変更
3. `ThreadOfTheDead-EC2-Role` を選択
4. 「IAMロールの更新」をクリック

**AWS CLI:**

```bash
aws ec2 associate-iam-instance-profile \
  --instance-id i-1234567890abcdef0 \
  --iam-instance-profile Name=ThreadOfTheDead-EC2-Role
```

---

## 管理者用ポリシー

プロジェクト管理者向けのフルアクセスポリシーです。

**ポリシー名:** `ThreadOfTheDead-Admin-Full`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CodeCommitFullAccess",
      "Effect": "Allow",
      "Action": "codecommit:*",
      "Resource": "arn:aws:codecommit:ap-northeast-1:*:thread-of-the-dead"
    },
    {
      "Sid": "BedrockFullAccess",
      "Effect": "Allow",
      "Action": "bedrock:*",
      "Resource": "*"
    },
    {
      "Sid": "IAMManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateUser",
        "iam:DeleteUser",
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:AttachUserPolicy",
        "iam:DetachUserPolicy",
        "iam:ListUsers",
        "iam:GetUser",
        "iam:ListAccessKeys"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EC2Management",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:AssociateIamInstanceProfile",
        "ec2:ReplaceIamInstanceProfileAssociation"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## セットアップ手順

### 1. 開発者用IAMユーザーの作成

```bash
# 1. IAMユーザーを作成
aws iam create-user --user-name dev-tanaka

# 2. ポリシーをアタッチ
aws iam attach-user-policy \
  --user-name dev-tanaka \
  --policy-arn arn:aws:iam::123456789012:policy/ThreadOfTheDead-Developer-Full

# 3. CodeCommit用のGit認証情報を生成（AWSコンソールで実施）
# IAM → ユーザー → dev-tanaka → セキュリティ認証情報 → AWS CodeCommit の HTTPS Git 認証情報

# 4. Bedrock用のアクセスキーを生成
aws iam create-access-key --user-name dev-tanaka
```

### 2. EC2用IAMロールの作成

```bash
# 1. 信頼ポリシーを作成
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. ロールを作成
aws iam create-role \
  --role-name ThreadOfTheDead-EC2-Role \
  --assume-role-policy-document file://trust-policy.json

# 3. ポリシーをアタッチ
aws iam attach-role-policy \
  --role-name ThreadOfTheDead-EC2-Role \
  --policy-arn arn:aws:iam::123456789012:policy/ThreadOfTheDead-EC2-Policy

# 4. インスタンスプロファイルを作成
aws iam create-instance-profile \
  --instance-profile-name ThreadOfTheDead-EC2-Role

# 5. ロールをインスタンスプロファイルに追加
aws iam add-role-to-instance-profile \
  --instance-profile-name ThreadOfTheDead-EC2-Role \
  --role-name ThreadOfTheDead-EC2-Role

# 6. EC2にアタッチ
aws ec2 associate-iam-instance-profile \
  --instance-id i-1234567890abcdef0 \
  --iam-instance-profile Name=ThreadOfTheDead-EC2-Role
```

---

## 権限の確認

### CodeCommit権限の確認

```bash
# リポジトリ一覧を取得
aws codecommit list-repositories

# 特定のリポジトリ情報を取得
aws codecommit get-repository --repository-name thread-of-the-dead
```

### Bedrock権限の確認

```bash
# 利用可能なモデル一覧
aws bedrock list-foundation-models --region ap-northeast-1

# 特定のモデル情報
aws bedrock get-foundation-model \
  --model-identifier anthropic.claude-3-haiku-20240307-v1:0 \
  --region ap-northeast-1
```

---

## セキュリティのベストプラクティス

### ✅ 推奨事項

1. **最小権限の原則**
   - 必要最小限の権限のみを付与
   - リソースARNを具体的に指定

2. **アクセスキーのローテーション**
   - 90日ごとにアクセスキーを更新
   - 古いキーは無効化・削除

3. **MFA（多要素認証）の有効化**
   - 管理者アカウントは必須
   - 開発者アカウントも推奨

4. **IAMロールの活用**
   - EC2ではIAMロールを使用（アクセスキー不要）
   - Lambda、ECSなども同様

5. **監査ログの確認**
   - CloudTrailでAPI呼び出しを記録
   - 定期的に不審なアクセスをチェック

### ❌ 避けるべきこと

1. ワイルドカード（*）の多用
2. フルアクセスポリシーの安易な付与
3. アクセスキーのコードへの埋め込み
4. 複数人での認証情報の共有
5. 不要になった認証情報の放置

---

## トラブルシューティング

### 権限エラー: "AccessDeniedException"

```bash
# 現在の認証情報を確認
aws sts get-caller-identity

# ポリシーシミュレーターで権限をテスト
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:user/dev-tanaka \
  --action-names bedrock:InvokeModel \
  --resource-arns arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0
```

### EC2でIAMロールが認識されない

```bash
# EC2インスタンス内で確認
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# ロール名が表示されればOK
# 表示されない場合は、IAMロールが正しくアタッチされていない
```

---

## 参考リンク

- [AWS IAM ベストプラクティス](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Bedrock IAM権限](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)
- [AWS CodeCommit IAM権限](https://docs.aws.amazon.com/codecommit/latest/userguide/auth-and-access-control.html)
