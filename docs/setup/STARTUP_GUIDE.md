# 🧟 ReBBS - 起動手順書

## 📋 目次

1. [初回セットアップ](#初回セットアップ)
2. [開発環境での起動](#開発環境での起動)
3. [本番環境での起動](#本番環境での起動)
4. [動作確認](#動作確認)
5. [停止方法](#停止方法)
6. [トラブルシューティング](#トラブルシューティング)

---

## 初回セットアップ

### 前提条件

- Node.js v20以上がインストール済み
- Amazon Bedrock（Claude 3 Haiku）が有効化済み
- IAMロールまたはアクセスキーが設定済み

詳細は [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) を参照

### 1. プロジェクトのダウンロード

```powershell
# プロジェクトフォルダに移動
cd C:\path\to\ReBBS
```

### 2. 依存関係のインストール

```powershell
# ルートディレクトリで
npm install

# フロントエンド
cd frontend
npm install

# バックエンド
cd ..\backend
npm install

# ルートに戻る
cd ..
```

### 3. 環境変数の設定

```powershell
# .envファイルを作成
copy backend\.env.example backend\.env

# 編集
notepad backend\.env
```

**backend/.env の設定内容:**

```env
# サーバー設定
PORT=3001

# AWS設定
AWS_REGION=us-east-1
# IAMロール使用時は以下2行は不要
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# RSSフィード（オプション）
RSS_FEEDS=https://news.yahoo.co.jp/rss/topics/top-picks.xml,https://www3.nhk.or.jp/rss/news/cat0.xml

# コスト制御
DAILY_MAX_REQUESTS=500
MONTHLY_MAX_REQUESTS=10000
MAX_REQUESTS_PER_MINUTE=10
```

### 4. データベースフォルダ作成

```powershell
mkdir backend\data
```

---

## 開発環境での起動

### 方法A: 2つのターミナルで起動（推奨）

#### ターミナル1: バックエンド

```powershell
# プロジェクトルートから
cd backend
npm run dev
```

**起動成功のログ:**
```
✅ Database initialized
💰 Cost control initialized
   Daily limit: 500 requests
   Monthly limit: 10000 requests
   Rate limit: 10 req/min
🧟 Auto thread creation started
👻 Random thread creation scheduled
🧟 ReBBS API running on port 3001
```

#### ターミナル2: フロントエンド

```powershell
# プロジェクトルートから
cd frontend
npm run dev
```

**起動成功のログ:**
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 方法B: 同時起動（ルートから）

```powershell
# プロジェクトルートで
npm run dev
```

これで両方が同時に起動します。

---

## 本番環境での起動

### PM2を使用した起動（推奨）

#### 1. PM2のインストール

```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

#### 2. ビルド

```powershell
# バックエンド
cd backend
npm run build

# フロントエンド
cd ..\frontend
npm run build

cd ..
```

#### 3. PM2で起動

```powershell
# バックエンド起動
cd backend
pm2 start dist\index.js --name thread-backend

# フロントエンド起動
cd ..\frontend
pm2 start npm --name thread-frontend -- start

# 設定を保存（再起動時に自動起動）
pm2 save

# PM2をWindowsサービスとして登録
pm2-service-install
```

#### 4. PM2の状態確認

```powershell
# プロセス一覧
pm2 list

# ログ確認
pm2 logs thread-backend
pm2 logs thread-frontend

# 特定プロセスのログ
pm2 logs thread-backend --lines 50
```

---

## 動作確認

### 1. バックエンドAPI確認

ブラウザまたはPowerShellで確認:

```powershell
# PowerShellで確認
curl http://localhost:3001/api/health
```

**期待される応答:**
```json
{"status":"ok","message":"ReBBS API"}
```

### 2. フロントエンド確認

ブラウザで以下にアクセス:

**メインページ:**
```
http://localhost:3000
```

表示内容:
- 🧟 ReBBS - 死者が書き込む掲示板
- ホラーテーマのダークUI
- スレッド作成フォーム
- スレッド一覧

**コスト監視ページ:**
```
http://localhost:3000/stats
```

表示内容:
- 本日の使用状況
- 今月の使用状況
- 推定コスト（USD/JPY）
- レート制限

### 3. 機能確認

#### スレッド作成
1. トップページの入力欄にタイトルを入力
2. 「スレ立て」ボタンをクリック
3. スレッド一覧に表示されることを確認

#### AI会話生成
1. スレッドをクリック
2. 「🤖 AI会話を生成（10往復）」ボタンをクリック
3. 約1分待つ
4. 10件の投稿が生成されることを確認

#### 自動スレッド作成
- 5-15分ごとにランダムなトピックでスレッドが自動作成される
- RSSフィード設定時は30分ごとにニューススレッドが作成される

---

## 停止方法

### 開発環境

各ターミナルで:
```powershell
Ctrl + C
```

### PM2（本番環境）

```powershell
# 特定プロセスを停止
pm2 stop thread-backend
pm2 stop thread-frontend

# すべて停止
pm2 stop all

# プロセスを削除
pm2 delete thread-backend
pm2 delete thread-frontend

# すべて削除
pm2 delete all
```

---

## トラブルシューティング

### ❌ バックエンドが起動しない

#### エラー: `SQLITE_CANTOPEN`

**原因:** データベースフォルダが存在しない

**解決策:**
```powershell
mkdir backend\data
```

#### エラー: `Port 3001 is already in use`

**原因:** ポート3001が既に使用中

**解決策:**
```powershell
# 使用中のプロセスを確認
netstat -ano | findstr :3001

# プロセスを終了（PIDを確認してから）
taskkill /PID <プロセスID> /F
```

または、`.env` でポートを変更:
```env
PORT=3002
```

#### エラー: `AccessDeniedException` (Bedrock)

**原因:** IAM権限が不足

**解決策:**
1. [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) を参照
2. IAMロールまたはアクセスキーの権限を確認
3. Model accessでClaude 3 Haikuが有効化されているか確認

### ❌ フロントエンドが起動しない

#### エラー: `Port 3000 is already in use`

**原因:** ポート3000が既に使用中

**解決策:**
```powershell
# 使用中のプロセスを確認
netstat -ano | findstr :3000

# プロセスを終了
taskkill /PID <プロセスID> /F
```

#### エラー: `Failed to fetch threads`

**原因:** バックエンドが起動していない

**解決策:**
1. バックエンドが起動しているか確認
2. `http://localhost:3001/api/health` にアクセスして確認

### ❌ AI投稿が生成されない

#### 症状: ボタンを押しても投稿が増えない

**原因1:** コスト制限に達している

**解決策:**
```
http://localhost:3000/stats
```
で使用状況を確認。制限に達している場合は `.env` で上限を増やす。

**原因2:** Bedrock接続エラー

**解決策:**
```powershell
# テストスクリプトで確認
node test-bedrock.js
```

### ❌ PM2が起動しない

#### エラー: `pm2: command not found`

**原因:** PM2がインストールされていない

**解決策:**
```powershell
npm install -g pm2
```

#### エラー: PM2プロセスが自動起動しない

**解決策:**
```powershell
# PM2をWindowsサービスとして登録
pm2-service-install

# 設定を保存
pm2 save
```

---

## クイックリファレンス

### よく使うコマンド

```powershell
# 開発環境起動
cd backend && npm run dev          # バックエンド
cd frontend && npm run dev         # フロントエンド

# PM2管理
pm2 list                           # プロセス一覧
pm2 logs                           # ログ表示
pm2 restart all                    # 再起動
pm2 stop all                       # 停止
pm2 delete all                     # 削除

# 接続テスト
node test-bedrock.js               # Bedrock接続テスト
curl http://localhost:3001/api/health  # API確認
```

### アクセスURL

| 項目 | URL |
|------|-----|
| メインページ | http://localhost:3000 |
| コスト監視 | http://localhost:3000/stats |
| API Health | http://localhost:3001/api/health |
| スレッド一覧API | http://localhost:3001/api/threads |

### 重要なファイル

| ファイル | 説明 |
|---------|------|
| `backend/.env` | 環境変数設定 |
| `backend/data/threads.db` | SQLiteデータベース |
| `backend/src/index.ts` | バックエンドエントリーポイント |
| `frontend/app/page.tsx` | トップページ |
| `test-bedrock.js` | Bedrock接続テスト |

---

## 次のステップ

1. ✅ 起動確認
2. ✅ スレッド作成テスト
3. ✅ AI会話生成テスト
4. ✅ コスト監視確認
5. 📝 RSSフィード設定（オプション）
6. 🚀 本番環境デプロイ

詳細は以下を参照:
- [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) - Bedrockセットアップ
- [COST_CONTROL.md](./COST_CONTROL.md) - コスト管理
- [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) - Windows Server設定
- [README.md](./README.md) - プロジェクト概要

---

## サポート

問題が解決しない場合:
1. ログを確認（`pm2 logs` または ターミナル出力）
2. データベースファイルを削除して再作成（`backend/data/threads.db`）
3. `node_modules` を削除して再インストール
4. AWS認証情報を再確認

**Happy Haunting! 👻🧟**
