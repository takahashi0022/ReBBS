# Windows Server セットアップガイド

## 前提条件

### 0. Amazon Bedrock セットアップ

**⚠️ 重要**: まず [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) を参照して、Bedrockを有効化してください。

- EC2と同一のAWSアカウントが必要
- Claude 3 Haikuのモデルアクセスを有効化
- IAMロールまたはアクセスキーを設定

### 1. Node.js インストール

公式サイトからLTS版をダウンロード:
https://nodejs.org/

または、PowerShellで:
```powershell
winget install OpenJS.NodeJS.LTS
```

確認:
```powershell
node --version
npm --version
```

### 2. Git インストール（オプション）

```powershell
winget install Git.Git
```

## プロジェクトセットアップ

### 1. 依存関係のインストール

```powershell
# ルートディレクトリで
npm install

# フロントエンド
cd frontend
npm install

# バックエンド
cd ..\backend
npm install
cd ..
```

### 2. 環境変数の設定

```powershell
# .envファイルをコピー
copy backend\.env.example backend\.env

# メモ帳で編集
notepad backend\.env
```

以下を設定:
```
PORT=3001
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
RSS_FEEDS=https://news.yahoo.co.jp/rss/topics/top-picks.xml,https://www3.nhk.or.jp/rss/news/cat0.xml
```

### 3. ビルド

```powershell
# バックエンド
cd backend
npm run build

# フロントエンド
cd ..\frontend
npm run build
cd ..
```

## 開発環境での起動

### PowerShellで2つのターミナルを開く

**ターミナル1 - バックエンド:**
```powershell
cd backend
npm run dev
```

**ターミナル2 - フロントエンド:**
```powershell
cd frontend
npm run dev
```

アクセス:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 本番環境デプロイ (Windows Server)

### 方法1: PM2を使用（推奨）

```powershell
# PM2インストール
npm install -g pm2
npm install -g pm2-windows-service

# PM2をWindowsサービスとして登録
pm2-service-install

# アプリケーション起動
cd backend
pm2 start dist\index.js --name thread-backend

cd ..\frontend
pm2 start npm --name thread-frontend -- start

# 保存して自動起動設定
pm2 save
```

### 方法2: Windowsサービスとして登録

**node-windows** を使用:

```powershell
npm install -g node-windows
```

`windows-service.js` を作成:
```javascript
const Service = require('node-windows').Service;

// バックエンドサービス
const backendSvc = new Service({
  name: 'Thread of the Dead Backend',
  description: 'Thread of the Dead API Server',
  script: 'C:\\path\\to\\backend\\dist\\index.js'
});

backendSvc.on('install', () => {
  backendSvc.start();
});

backendSvc.install();
```

実行:
```powershell
node windows-service.js
```

### 方法3: IISでリバースプロキシ

1. IISをインストール
2. URL Rewrite と Application Request Routing をインストール
3. リバースプロキシ設定でNode.jsアプリにプロキシ

## ファイアウォール設定

```powershell
# ポート3000と3001を開放
New-NetFirewallRule -DisplayName "Thread Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Thread Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## トラブルシューティング

### ポートが使用中の場合

```powershell
# ポート使用状況確認
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# プロセス終了
taskkill /PID <プロセスID> /F
```

### SQLiteエラーの場合

```powershell
# backend/data フォルダを作成
mkdir backend\data
```

### AWS認証エラーの場合

環境変数で設定する方法:
```powershell
$env:AWS_ACCESS_KEY_ID="your_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret"
$env:AWS_REGION="us-east-1"
```

または、AWS CLIで設定:
```powershell
aws configure
```

## 自動起動設定

### タスクスケジューラで起動

1. タスクスケジューラを開く
2. 「基本タスクの作成」
3. トリガー: システム起動時
4. 操作: プログラムの開始
5. プログラム: `C:\Program Files\nodejs\node.exe`
6. 引数: `dist\index.js`
7. 開始: `C:\path\to\backend`

## パフォーマンス最適化

### Node.jsのメモリ制限を増やす

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
```

### クラスターモードで起動

`backend/src/cluster.ts` を作成して複数プロセスで実行可能です。

## セキュリティ

### HTTPSを有効化

Let's Encrypt + win-acme を使用:
```powershell
# win-acmeダウンロード
# https://www.win-acme.com/
```

または、IISでSSL証明書を設定してリバースプロキシ経由でアクセス。

## ログ管理

ログファイルの場所:
- PM2: `C:\Users\<user>\.pm2\logs\`
- カスタムログ: `backend\logs\` (要実装)

```powershell
# PM2ログ確認
pm2 logs thread-backend
pm2 logs thread-frontend
```

## バックアップ

```powershell
# データベースバックアップ
copy backend\data\threads.db backend\data\threads.db.backup

# 定期バックアップ（タスクスケジューラで実行）
$date = Get-Date -Format "yyyyMMdd_HHmmss"
copy backend\data\threads.db "backup\threads_$date.db"
```
