# 🚀 クイックスタートガイド

プロジェクトフォルダを入手した後、最初にやることをステップバイステップで説明します。

## ⏱️ 所要時間: 約10分

---

## 📋 前提条件

以下がインストール済みであることを確認：

- ✅ **Node.js** (v18以上) - [ダウンロード](https://nodejs.org/)
- ✅ **Git** - [ダウンロード](https://git-scm.com/) または `winget install Git.Git`
- ✅ **GitHubアカウント** - [作成](https://github.com/signup)
- ✅ **AWS認証情報** (Bedrock用のIAMアクセスキー)

確認方法：
```powershell
node --version    # v18.0.0 以上
npm --version     # 9.0.0 以上
git --version     # 2.0.0 以上
```

### Gitのインストール（未インストールの場合）

```powershell
# winget（Windows 10/11）
winget install Git.Git

# または、公式サイトからダウンロード
# https://git-scm.com/download/win
```

---

## 🎯 初回セットアップ（7ステップ）

### ステップ0: GitHubからクローン

```powershell
# 作業ディレクトリに移動
cd C:\Users\YourName\Projects

# リポジトリをクローン
git clone https://github.com/takahashi0022/rebbs.git

# プロジェクトディレクトリに移動
cd rebbs
```

初回クローン時、認証情報を入力：
- **Username**: GitHubのユーザー名
- **Password**: Personal Access Token（[GitHub Settings](https://github.com/settings/tokens)で生成）

**Personal Access Tokenの生成方法:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Scopes: ✅ `repo`
4. トークンをコピーして保存

**所要時間**: 約2分

---

### ステップ1: 依存関係のインストール

```powershell
# プロジェクトルートで実行
npm install

# バックエンドの依存関係
cd backend
npm install

# フロントエンドの依存関係
cd ..\frontend
npm install

# ルートに戻る
cd ..
```

**所要時間**: 約3分

**何をしている？**
- プロジェクトに必要なライブラリ（Express, Next.js, AWS SDKなど）をダウンロード
- `node_modules/` フォルダが作成される

---

### ステップ2: 環境変数ファイルの作成

```powershell
# .envファイルを作成
copy backend\.env.example backend\.env
```

**所要時間**: 10秒

**何をしている？**
- 環境変数のテンプレートをコピー
- 次のステップで編集する

---

### ステップ3: 環境変数の設定

```powershell
# .envファイルを開く
notepad backend\.env
```

以下を設定：

```env
PORT=3001
AWS_REGION=ap-northeast-1

# ローカル開発時はIAMアクセスキーを設定
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0

RSS_FEEDS=https://news.yahoo.co.jp/rss/topics/top-picks.xml

DAILY_MAX_REQUESTS=500
MONTHLY_MAX_REQUESTS=10000
MAX_REQUESTS_PER_MINUTE=10
```

**重要**: 
- `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` を実際の値に置き換える
- チームリーダーから認証情報を取得してください

**所要時間**: 約1分

---

### ステップ4: Bedrock接続テスト

```powershell
# Bedrockに接続できるか確認
node scripts\test-bedrock.js
```

**成功時の出力例**:
```
🔍 Bedrock接続テスト開始...
   リージョン: ap-northeast-1
   認証方法: アクセスキー
📡 Bedrockにリクエスト送信中...

✅ Bedrock接続成功！

【AI応答】
よろしくニキーwww

✨ セットアップ完了です！アプリケーションを起動できます。
```

**エラーが出た場合**:
- AWS認証情報が正しいか確認
- Bedrockのモデルアクセスが有効化されているか確認
- [docs/setup/AWS_BEDROCK_SETUP.md](./docs/setup/AWS_BEDROCK_SETUP.md) を参照

**所要時間**: 約30秒

---

### ステップ5: アプリケーションの起動

#### 方法A: START.bat を使う（簡単）

```powershell
# ダブルクリック、または
START.bat
```

#### 方法B: 手動で起動（推奨：開発時）

```powershell
# ターミナル1: バックエンド
cd backend
npm run dev

# ターミナル2: フロントエンド（別のターミナルで）
cd frontend
npm run dev
```

**アクセス**:
- 🌐 **フロントエンド**: http://localhost:3000
- 🔌 **バックエンドAPI**: http://localhost:3001

**所要時間**: 約1分

---

## ✅ セットアップ完了チェックリスト

- [ ] `npm install` を3回実行（ルート、backend、frontend）
- [ ] `backend/.env` ファイルを作成・編集
- [ ] `node scripts\test-bedrock.js` が成功
- [ ] アプリケーションが起動
- [ ] http://localhost:3000 にアクセスできる

---

## 🎓 次のステップ

### 開発を始める前に読むべきドキュメント

1. **[docs/development/GIT_WORKFLOW.md](./docs/development/GIT_WORKFLOW.md)** - Git運用ルール（必読）
2. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - プロジェクト構成
3. **[docs/development/TEAM_DEVELOPMENT.md](./docs/development/TEAM_DEVELOPMENT.md)** - チーム開発ガイド

### 開発フロー

```bash
# 1. 最新コードを取得
git checkout develop
git pull origin develop

# 2. 新しいブランチを作成
git checkout -b feature/your-feature

# 3. コードを編集・テスト

# 4. コミット
git add .
git commit -m "feat: Add new feature"

# 5. プッシュ
git push origin feature/your-feature

# 6. プルリクエストを作成（AWSコンソール）
```

---

## 🚨 よくあるトラブルと解決方法

### 1. `npm install` でエラーが出る

**エラー例**:
```
npm ERR! code ENOENT
```

**解決方法**:
```powershell
# Node.jsのバージョンを確認
node --version

# v18以上でない場合は、Node.jsを更新
# https://nodejs.org/
```

---

### 2. Bedrock接続テストが失敗する

**エラー例**:
```
❌ Bedrock接続エラー
AccessDeniedException
```

**解決方法**:
1. `backend/.env` のAWS認証情報を確認
2. IAMユーザーにBedrock権限があるか確認
3. Bedrockのモデルアクセスが有効化されているか確認
4. [docs/setup/AWS_BEDROCK_SETUP.md](./docs/setup/AWS_BEDROCK_SETUP.md) を参照

---

### 3. ポート3000または3001が使用中

**エラー例**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方法**:
```powershell
# ポートを使用しているプロセスを確認
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# プロセスを終了（PIDを確認後）
taskkill /PID <PID> /F
```

---

### 4. フロントエンドが起動しない

**エラー例**:
```
Module not found: Can't resolve 'next'
```

**解決方法**:
```powershell
# frontendフォルダで再インストール
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

### 5. バックエンドAPIに接続できない

**確認事項**:
1. バックエンドが起動しているか確認
2. http://localhost:3001/api/threads にアクセスしてみる
3. ブラウザのコンソールでエラーを確認

---

## 📚 詳細ドキュメント

より詳しい情報は以下を参照：

| ドキュメント | 内容 |
|------------|------|
| [README.md](./README.md) | プロジェクト概要 |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | フォルダ構成 |
| [docs/setup/STARTUP_GUIDE.md](./docs/setup/STARTUP_GUIDE.md) | 詳細な起動手順 |
| [docs/setup/LOCAL_DEV_SETUP.md](./docs/setup/LOCAL_DEV_SETUP.md) | ローカル開発環境セットアップ |
| [docs/development/GIT_WORKFLOW.md](./docs/development/GIT_WORKFLOW.md) | Git運用ルール |

---

## 🆘 サポート

問題が解決しない場合：

1. このドキュメントのトラブルシューティングを確認
2. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) で関連ドキュメントを探す
3. チームのSlack/Teamsチャンネルで質問
4. プロジェクトリーダーに連絡

---

## 🎉 セットアップ完了！

おめでとうございます！これで開発を始められます。

**次にやること**:
1. http://localhost:3000 でアプリを確認
2. [docs/development/GIT_WORKFLOW.md](./docs/development/GIT_WORKFLOW.md) を読む
3. 最初のタスクに取り掛かる

**Happy Coding! 🧟💀👻**
