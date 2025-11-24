# 👥 Thread of the Dead - チーム参加手順

このドキュメントは、新しくプロジェクトに参加するメンバー向けのオンボーディングガイドです。

---

## 📋 概要

- **プロジェクト名**: Thread of the Dead
- **リポジトリ**: https://github.com/takahashi0022/thread-of-the-dead
- **リポジトリタイプ**: Private（プライベート）
- **開発環境**: ローカルPC（Windows 11推奨）
- **実行環境**: AWS EC2

---

## 🚀 参加手順（5ステップ）

### ステップ1: GitHubアカウントの準備

#### 1-1. GitHubアカウント作成（未作成の場合）
https://github.com/signup

#### 1-2. GitHubユーザー名を共有
作成後、あなたの**GitHubユーザー名**をプロジェクトリーダーに連絡してください。

例: `tanaka-taro`

→ リポジトリへのアクセス権限を付与します。

#### 1-3. 招待メールを承認
GitHubから招待メールが届くので、**Accept invitation**をクリックしてください。

---

### ステップ2: 開発ツールのインストール

#### 2-1. Git
```powershell
# Windows 10/11の場合
winget install Git.Git

# または、公式サイトからダウンロード
# https://git-scm.com/download/win
```

**確認:**
```powershell
git --version
# 出力例: git version 2.43.0.windows.1
```

#### 2-2. Node.js（v18以上）
https://nodejs.org/ からLTS版をダウンロード・インストール

**確認:**
```powershell
node --version
# 出力例: v20.10.0

npm --version
# 出力例: 10.2.3
```

#### 2-3. VS Code（推奨）
https://code.visualstudio.com/

**推奨拡張機能:**
- GitLens
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

---

### ステップ3: GitHub認証設定

#### 3-1. Personal Access Token（PAT）の生成

1. GitHub → 右上のアイコン → **Settings**
2. 左メニュー最下部 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)**
5. 設定:
   - **Note**: `Thread of the Dead Development`
   - **Expiration**: 90 days（または任意）
   - **Select scopes**: ✅ `repo`（フルアクセス）
6. **Generate token** をクリック
7. **トークンをコピーして安全に保存**（⚠️ 再表示不可）

**保存例:**
```
GitHub Personal Access Token
Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
有効期限: 2025年2月24日
```

#### 3-2. Git設定

```powershell
# ユーザー名を設定
git config --global user.name "Your Name"

# メールアドレスを設定（GitHubに登録しているメール）
git config --global user.email "your.email@example.com"

# 認証情報を保存（Windows）
git config --global credential.helper wincred
```

---

### ステップ4: リポジトリのクローン

#### 4-1. 作業ディレクトリに移動

```powershell
# 例: Projectsフォルダ
cd C:\Users\YourName\Projects

# または、デスクトップ
cd $env:USERPROFILE\Desktop
```

#### 4-2. リポジトリをクローン

```powershell
git clone https://github.com/takahashi0022/thread-of-the-dead.git
```

**初回クローン時、認証情報を入力:**
- **Username**: あなたのGitHubユーザー名
- **Password**: Personal Access Token（ステップ3-1で生成したもの）

#### 4-3. プロジェクトディレクトリに移動

```powershell
cd thread-of-the-dead
```

---

### ステップ5: プロジェクトのセットアップ

#### 5-1. 依存関係のインストール

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

**所要時間**: 約3分

#### 5-2. 環境変数の設定

```powershell
# .envファイルを作成
copy backend\.env.example backend\.env

# .envファイルを編集
notepad backend\.env
```

**backend/.env の設定内容:**

```env
PORT=3001
AWS_REGION=ap-northeast-1

# ローカル開発時はAWS認証情報は不要
# （BedrockテストはEC2で実施）
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=

BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

RSS_FEEDS=https://news.yahoo.co.jp/rss/topics/top-picks.xml

DAILY_MAX_REQUESTS=500
MONTHLY_MAX_REQUESTS=10000
MAX_REQUESTS_PER_MINUTE=10
```

**重要**: 
- ✅ ローカル開発ではBedrockを使用しません
- ✅ AWS認証情報は不要です
- ✅ BedrockテストはEC2環境で実施します

#### 5-3. 動作確認

```powershell
# バックエンド起動（ターミナル1）
cd backend
npm run dev

# フロントエンド起動（ターミナル2）
cd frontend
npm run dev
```

**アクセス:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

**確認ポイント:**
- ✅ スレッド一覧が表示される
- ✅ エラーが出ていない
- ⚠️ AI投稿生成はローカルでは動作しません（フォールバックの語録が表示されます）

---

## 📚 必読ドキュメント

セットアップ完了後、以下を読んでください：

### 1. プロジェクト概要
- **[README.md](../../README.md)** - プロジェクト全体の概要

### 2. セットアップ
- **[QUICKSTART.md](../../QUICKSTART.md)** - 10分でセットアップ
- [docs/setup/FIRST_TIME_SETUP_CHECKLIST.md](../setup/FIRST_TIME_SETUP_CHECKLIST.md) - チェックリスト

### 3. 開発ルール（必読）
- **[docs/development/GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Git運用ルール
- **[docs/development/TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md)** - チーム開発ガイド

### 4. 技術情報
- [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md) - プロジェクト構成
- [docs/setup/AWS_BEDROCK_SETUP.md](../setup/AWS_BEDROCK_SETUP.md) - Bedrockセットアップ

---

## 🔄 日常的な開発フロー

### 作業開始前

```powershell
# 最新コードを取得
git checkout main
git pull origin main

# 新しいブランチを作成
git checkout -b feature/your-feature-name
```

### 開発中

```powershell
# 変更をステージング
git add .

# コミット（わかりやすいメッセージで）
git commit -m "feat: Add new feature description"

# プッシュ
git push origin feature/your-feature-name
```

### プルリクエストの作成

1. https://github.com/takahashi0022/thread-of-the-dead を開く
2. **Pull requests** タブ
3. **New pull request** をクリック
4. ブランチを選択:
   - **base**: `main`
   - **compare**: `feature/your-feature-name`
5. タイトルと説明を記入
6. レビュアーを指定
7. **Create pull request** をクリック

### レビュー承認後

```powershell
# mainブランチに戻る
git checkout main

# 最新を取得
git pull origin main

# 作業ブランチを削除
git branch -d feature/your-feature-name
```

---

## 📝 コミットメッセージ規約

```
<type>: <subject>

例:
feat: ユーザープロフィール機能を追加
fix: 投稿時のタイムスタンプ表示を修正
docs: READMEにセットアップ手順を追加
refactor: bedrock.tsのエラーハンドリングを改善
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: ビルド・設定

---

## 🚨 トラブルシューティング

### Git認証エラー

```powershell
# 認証情報をクリア
git config --global --unset credential.helper
git config --global credential.helper wincred

# 再度クローンまたはプル（Personal Access Tokenを入力）
git pull origin main
```

### npm install エラー

```powershell
# キャッシュをクリア
npm cache clean --force

# 再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

### ポート競合エラー

```powershell
# ポートを使用しているプロセスを確認
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# プロセスを終了（PIDを確認後）
taskkill /PID <PID> /F
```

### Personal Access Tokenを忘れた

1. GitHub → Settings → Developer settings → Personal access tokens
2. 古いトークンを削除
3. 新しいトークンを生成
4. 再度認証

---

## ✅ セットアップ完了チェックリスト

- [ ] GitHubアカウント作成完了
- [ ] リポジトリへの招待を承認
- [ ] Git、Node.js、VS Codeをインストール
- [ ] Personal Access Token生成完了
- [ ] リポジトリのクローン完了
- [ ] 依存関係のインストール完了
- [ ] 環境変数の設定完了
- [ ] アプリケーション起動成功（http://localhost:3000）
- [ ] 必読ドキュメントを読了
- [ ] Git運用ルールを理解

---

## 🆘 サポート・質問

わからないことがあれば、いつでも質問してください！

**連絡先:**
- プロジェクトリーダー: [名前]
- メール: [メールアドレス]
- Slack/Teams: [チャンネル名]

**質問する前に:**
1. このドキュメントのトラブルシューティングを確認
2. [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md)で関連ドキュメントを探す
3. [docs/development/TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md)を参照

---

## 🎉 ようこそ！

Thread of the Deadプロジェクトへようこそ！

チーム全員で協力して、素晴らしいアプリケーションを作りましょう！

**Happy Coding! 🧟💀👻**
