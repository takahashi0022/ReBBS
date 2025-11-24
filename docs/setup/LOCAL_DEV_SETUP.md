# ローカル開発環境セットアップ（Windows 11）

このガイドは、Windows 11の物理PCで開発し、EC2で実行する環境のセットアップ手順です。

## 環境構成

```
┌─────────────────────────┐
│  Windows 11 PC          │
│  (開発環境)              │
│  - Git                  │
│  - Node.js              │
│  - VS Code              │
│  - CodeCommit接続       │
└──────────┬──────────────┘
           │ git push/pull
           ↓
┌─────────────────────────┐
│  AWS CodeCommit         │
│  (リポジトリ)            │
└──────────┬──────────────┘
           │ git pull
           ↓
┌─────────────────────────┐
│  EC2 (実行環境)          │
│  - Node.js              │
│  - PM2                  │
│  - アプリ実行            │
└─────────────────────────┘
```

## 1. Windows 11 PC のセットアップ

### 1.1 Git のインストール

**ダウンロード:**
https://git-scm.com/download/win

**インストール手順:**
1. インストーラーを実行
2. デフォルト設定でOK（推奨）
3. インストール完了後、PowerShellで確認:

```powershell
git --version
# 出力例: git version 2.43.0.windows.1
```

**Git初期設定:**

```powershell
# ユーザー名とメールアドレスを設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 認証情報を保存（CodeCommit用）
git config --global credential.helper wincred

# 改行コードの設定（Windows環境）
git config --global core.autocrlf true

# 設定確認
git config --list
```

### 1.2 Node.js のインストール

**ダウンロード:**
https://nodejs.org/ (LTS版を推奨)

**インストール確認:**

```powershell
node --version
# 出力例: v20.10.0

npm --version
# 出力例: 10.2.3
```

### 1.3 VS Code のインストール（推奨）

**ダウンロード:**
https://code.visualstudio.com/

**推奨拡張機能:**
- GitLens
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

## 2. AWS IAM 認証情報の設定

### 2.1 IAMユーザーの作成（管理者が実施）

**AWSコンソール:**
1. IAM → ユーザー → ユーザーを追加
2. ユーザー名: `dev-your-name`
3. アクセスの種類: 「プログラムによるアクセス」にチェック
4. 次へ: アクセス許可

**必要なポリシー:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codecommit:GitPull",
        "codecommit:GitPush",
        "codecommit:CreateBranch",
        "codecommit:GetBranch",
        "codecommit:ListBranches",
        "codecommit:GetRepository",
        "codecommit:GetCommit",
        "codecommit:CreatePullRequest",
        "codecommit:GetPullRequest"
      ],
      "Resource": "arn:aws:codecommit:ap-northeast-1:*:thread-of-the-dead"
    }
  ]
}
```

### 2.2 CodeCommit用のGit認証情報を生成

**重要:** CodeCommitへのGit接続には、通常のIAMアクセスキーではなく、専用のGit認証情報が必要です。

**手順:**
1. IAMコンソール → ユーザー → 自分のユーザー
2. 「セキュリティ認証情報」タブ
3. 「AWS CodeCommit の HTTPS Git 認証情報」セクション
4. 「認証情報を生成」をクリック
5. **ユーザー名とパスワードをダウンロード・保存**（⚠️ 再表示不可）

**保存例（メモ帳に保存）:**
```
CodeCommit Git認証情報
ユーザー名: dev-user-at-123456789012
パスワード: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCD
```

### 2.3 認証情報のテスト

```powershell
# テスト用にリポジトリ情報を取得
git ls-remote https://git-codecommit.ap-northeast-1.amazonaws.com/v1/repos/thread-of-the-dead

# 初回実行時、ユーザー名とパスワードを入力
# ユーザー名: dev-user-at-123456789012
# パスワード: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCD

# 成功すると、ブランチ情報が表示される
```

## 3. プロジェクトのクローン

### 3.1 作業ディレクトリの作成

```powershell
# 作業ディレクトリに移動（例）
cd C:\Users\YourName\Projects

# または、デスクトップに作成
cd $env:USERPROFILE\Desktop
```

### 3.2 リポジトリをクローン

```powershell
# CodeCommitからクローン
git clone https://git-codecommit.ap-northeast-1.amazonaws.com/v1/repos/thread-of-the-dead

# プロジェクトディレクトリに移動
cd thread-of-the-dead
```

### 3.3 依存関係のインストール

```powershell
# ルートディレクトリで
npm install

# バックエンド
cd backend
npm install

# フロントエンド
cd ..\frontend
npm install

# ルートに戻る
cd ..
```

### 3.4 環境変数の設定

```powershell
# .envファイルを作成
copy backend\.env.example backend\.env

# .envファイルを編集
notepad backend\.env
```

**backend/.env の設定例（ローカル開発用）:**

```env
PORT=3001
AWS_REGION=ap-northeast-1

# ローカル開発時はIAMアクセスキーを使用
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

RSS_FEEDS=https://news.yahoo.co.jp/rss/topics/top-picks.xml

DAILY_MAX_REQUESTS=500
MONTHLY_MAX_REQUESTS=10000
MAX_REQUESTS_PER_MINUTE=10
```

**注意:** 
- ローカル開発時は、Bedrock接続用のIAMアクセスキーが必要です
- EC2では、IAMロールを使用するため、アクセスキーは不要です

## 4. ローカルでの開発・テスト

### 4.1 アプリケーションの起動

```powershell
# バックエンドを起動（ターミナル1）
cd backend
npm run dev

# フロントエンドを起動（ターミナル2）
cd frontend
npm run dev
```

**アクセス:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 4.2 開発フロー

```powershell
# 1. 最新コードを取得
git checkout develop
git pull origin develop

# 2. 新しいブランチを作成
git checkout -b feature/your-feature

# 3. コードを編集・テスト

# 4. 変更をコミット
git add .
git commit -m "feat: Add new feature"

# 5. CodeCommitにプッシュ
git push origin feature/your-feature

# 6. AWSコンソールでプルリクエストを作成
```

## 5. EC2へのデプロイ

### 5.1 EC2でコードを更新

```bash
# EC2にSSH接続
ssh -i your-key.pem ec2-user@your-ec2-ip

# プロジェクトディレクトリに移動
cd /path/to/thread-of-the-dead

# 最新コードをプル
git pull origin main

# 依存関係を更新（必要に応じて）
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# ビルド
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# アプリケーションを再起動
pm2 restart all
```

### 5.2 自動デプロイスクリプト（オプション）

**deploy.sh を作成:**

```bash
#!/bin/bash
cd /path/to/thread-of-the-dead
git pull origin main
npm install
cd backend && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart all
echo "Deployment completed!"
```

**実行:**

```bash
chmod +x deploy.sh
./deploy.sh
```

## 6. よくある質問

### Q1: CodeCommitの認証情報とBedrock用のIAMアクセスキーは別物？

**A:** はい、別物です。

- **CodeCommit Git認証情報**: Gitでpush/pullするための認証情報
  - IAMコンソールの「AWS CodeCommit の HTTPS Git 認証情報」で生成
  - 形式: `dev-user-at-123456789012` / `長いパスワード`

- **IAM アクセスキー**: AWS APIを呼び出すための認証情報（Bedrock接続用）
  - IAMコンソールの「アクセスキー」で生成
  - 形式: `AKIAIOSFODNN7EXAMPLE` / `wJalrXUtnFEMI/K7MDENG...`

### Q2: ローカルPCでBedrockを使うには？

**A:** ローカルPCでBedrockを使用する場合、以下が必要です：

1. IAMユーザーにBedrockの権限を付与
2. IAMアクセスキーを生成
3. `backend/.env`にアクセスキーを設定

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Q3: EC2とローカルPCで.envファイルは同じ？

**A:** いいえ、異なります。

**ローカルPC（backend/.env）:**
```env
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**EC2（backend/.env）:**
```env
AWS_REGION=ap-northeast-1
# AWS_ACCESS_KEY_ID=（IAMロール使用時は不要）
# AWS_SECRET_ACCESS_KEY=（IAMロール使用時は不要）
```

EC2ではIAMロールを使用するため、アクセスキーは不要です。

### Q4: Gitの認証情報が保存されない

**A:** 以下を実行してください：

```powershell
# 認証情報を保存
git config --global credential.helper wincred

# 再度git操作を実行（ユーザー名とパスワードを入力）
git pull origin main
```

### Q5: ローカルで開発したコードをEC2に反映する手順は？

**A:** 以下の流れです：

```
ローカルPC → CodeCommit → EC2

1. ローカルPCで開発
   git commit -m "feat: Add feature"
   git push origin feature/your-feature

2. プルリクエストを作成・マージ（AWSコンソール）

3. EC2で最新コードをプル
   git pull origin main
   npm run build
   pm2 restart all
```

## 7. トラブルシューティング

### 認証エラー: "fatal: Authentication failed"

```powershell
# 認証情報をクリア
git config --global --unset credential.helper
git config --global credential.helper wincred

# 再度git操作（正しい認証情報を入力）
git pull origin main
```

### ポート競合エラー

```powershell
# ポート3000, 3001を使用しているプロセスを確認
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# プロセスを終了（PIDを確認後）
taskkill /PID <PID> /F
```

### npm installエラー

```powershell
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

## 8. セキュリティのベストプラクティス

### ✅ やるべきこと

- Git認証情報を安全に保管
- IAMアクセスキーを.envファイルに保存（.gitignoreで除外）
- 定期的にアクセスキーをローテーション
- 不要になったアクセスキーは削除

### ❌ やってはいけないこと

- .envファイルをGitにコミット
- 認証情報をコードに直接記述
- 認証情報をSlack/メールで共有
- 複数人で同じIAMアクセスキーを共有

## 9. 参考リンク

- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Git運用ルール
- [TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md) - チーム開発ガイド
- [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) - Bedrockセットアップ

---

**Happy Coding! 🚀**
