# 👥 Thread of the Dead - チーム開発ガイド

## 📋 目次

1. [初回セットアップ（管理者）](#初回セットアップ管理者)
2. [チームメンバーのセットアップ](#チームメンバーのセットアップ)
3. [日常的な開発フロー](#日常的な開発フロー)
4. [ブランチ戦略](#ブランチ戦略)
5. [コードレビュー](#コードレビュー)
6. [トラブルシューティング](#トラブルシューティング)

---

## 初回セットアップ（管理者）

### 📢 重要: GitHubを使用します

AWS CodeCommitは2024年7月25日に新規リポジトリの作成が停止され、2025年7月25日にサービス終了となります。
このプロジェクトでは**GitHub**を使用します。

詳細: [GITHUB_SETUP.md](./GITHUB_SETUP.md)

### 1. GitHubリポジトリの作成

#### GitHubでの作業

1. **GitHub**にログイン (https://github.com)
2. 右上の「+」→「**New repository**」をクリック
3. リポジトリ設定:
   - **Repository name**: `thread-of-the-dead`
   - **Description**: `Thread of the Dead - なんJ風AI掲示板アプリケーション`
   - **Visibility**: Private（推奨）または Public
   - **Initialize this repository**: チェックを入れない
4. 「**Create repository**」をクリック

#### リポジトリURLをメモ

作成後、以下の情報をメモ：
- **HTTPS URL**: `https://github.com/takahashi0022/thread-of-the-dead.git`
- **SSH URL**: `git@github.com:takahashi0022/thread-of-the-dead.git`

### 2. チームメンバーの追加

#### Privateリポジトリの場合

1. GitHubリポジトリページを開く
2. 「**Settings**」タブ
3. 左メニューの「**Collaborators**」
4. 「**Add people**」をクリック
5. メンバーのGitHubユーザー名またはメールアドレスを入力
6. 権限を選択:
   - **Write**: 読み書き可能（推奨）
   - **Admin**: 管理者権限
7. 「**Add [username] to this repository**」をクリック

### 3. 初回コミット

#### プロジェクトディレクトリで実行

```powershell
# プロジェクトルートに移動
cd C:\Users\Administrator\Desktop\Thread_of_the_Dead

# Gitリポジトリを初期化
git init

# .gitignoreを確認（既に存在）
type .gitignore

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Thread of the Dead - 死者が書き込む掲示板"

# GitHubをリモートとして追加
git remote add origin https://github.com/takahashi0022/thread-of-the-dead.git

# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

初回プッシュ時、認証情報を入力：
- **Username**: GitHubのユーザー名
- **Password**: Personal Access Token（パスワードではない）

### 4. ブランチ保護の設定（推奨）

GitHubで：
1. リポジトリページ → **Settings** → **Branches**
2. 「**Add branch protection rule**」をクリック
3. 設定:
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals**: 1
4. 「**Create**」をクリック

---

## チームメンバーのセットアップ

### 1. GitHub認証情報の設定

#### 方法A: Personal Access Token（推奨）

GitHubは2021年8月以降、パスワード認証を廃止しました。Personal Access Token（PAT）を使用します。

**トークンの生成:**

1. GitHub → 右上のアイコン → **Settings**
2. 左メニュー最下部の「**Developer settings**」
3. 「**Personal access tokens**」→「**Tokens (classic)**」
4. 「**Generate new token**」→「**Generate new token (classic)**」
5. トークン設定:
   - **Note**: `Thread of the Dead Development`
   - **Expiration**: 90 days（または任意）
   - **Select scopes**: ✅ `repo`（フルアクセス）
6. 「**Generate token**」をクリック
7. **トークンをコピーして安全に保存**（⚠️ 再表示不可）

**Git設定:**

```powershell
# Git認証情報を保存
git config --global credential.helper wincred

# ユーザー情報を設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

初回プッシュ時に：
- **Username**: GitHubのユーザー名
- **Password**: Personal Access Token

#### 方法B: SSH認証

**SSH鍵を生成:**

```powershell
# SSH鍵を生成
ssh-keygen -t ed25519 -C "your.email@example.com"

# 公開鍵を表示
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**GitHubに公開鍵を登録:**

1. GitHub → 右上のアイコン → **Settings**
2. 左メニューの「**SSH and GPG keys**」
3. 「**New SSH key**」をクリック
4. 設定:
   - **Title**: `Windows PC - Thread of the Dead`
   - **Key**: 公開鍵の内容を貼り付け
5. 「**Add SSH key**」をクリック

**SSH接続テスト:**

```powershell
ssh -T git@github.com
# 成功時: Hi username! You've successfully authenticated...
```

### 2. リポジトリをクローン

```powershell
# 作業ディレクトリに移動
cd C:\Users\YourName\Projects

# HTTPS でクローン（推奨）
git clone https://github.com/takahashi0022/thread-of-the-dead.git

# または SSH でクローン
git clone git@github.com:takahashi0022/thread-of-the-dead.git

# プロジェクトディレクトリに移動
cd thread-of-the-dead
```

### 3. 依存関係のインストール

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

### 4. 環境変数の設定

```powershell
# .envファイルを作成
copy backend\.env.example backend\.env

# 編集（チームリーダーから認証情報を取得）
notepad backend\.env
```

### 5. 動作確認

```powershell
# バックエンド起動
cd backend
npm run dev

# フロントエンド起動（別ターミナル）
cd frontend
npm run dev
```

---

## 日常的な開発フロー

### 1. 作業開始前

```powershell
# 最新のコードを取得
git checkout main
git pull origin main

# 新しいブランチを作成
git checkout -b feature/your-feature-name
```

### 2. 開発中

```powershell
# 変更をステージング
git add .

# コミット（わかりやすいメッセージで）
git commit -m "feat: Add new feature description"

# 定期的にプッシュ
git push origin feature/your-feature-name
```

### 3. 作業完了後

```powershell
# 最新のmainを取得してマージ
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main

# コンフリクトがあれば解決

# プッシュ
git push origin feature/your-feature-name
```

### 4. プルリクエストの作成

**GitHubで:**

1. GitHubリポジトリページを開く
2. 「**Pull requests**」タブ
3. 「**New pull request**」をクリック
4. ブランチを選択:
   - **base**: `main`
   - **compare**: `feature/your-feature-name`
5. 「**Create pull request**」をクリック
6. タイトルと説明を記入
7. レビュアーを指定（右サイドバー）
8. 「**Create pull request**」をクリック

### 5. コードレビュー後

承認されたら：

```powershell
# mainブランチに切り替え
git checkout main

# 最新を取得
git pull origin main

# 作業ブランチを削除
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## ブランチ戦略

### ブランチ命名規則

```
main                    # 本番環境
develop                 # 開発環境
feature/機能名          # 新機能開発
bugfix/バグ名           # バグ修正
hotfix/緊急修正名       # 緊急修正
```

### 例

```
feature/add-user-profile
feature/improve-ai-response
bugfix/fix-rss-parsing
hotfix/fix-bedrock-error
```

### ブランチの使い分け

| ブランチ | 用途 | マージ先 |
|---------|------|---------|
| `main` | 本番環境 | - |
| `develop` | 開発環境 | `main` |
| `feature/*` | 新機能開発 | `develop` |
| `bugfix/*` | バグ修正 | `develop` |
| `hotfix/*` | 緊急修正 | `main` + `develop` |

---

## コードレビュー

### レビュアーのチェックリスト

- [ ] コードが正しく動作するか
- [ ] コーディング規約に従っているか
- [ ] セキュリティ上の問題はないか
- [ ] パフォーマンスに問題はないか
- [ ] テストは追加されているか
- [ ] ドキュメントは更新されているか
- [ ] `.env.example` は更新されているか

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加
chore: ビルド・設定変更
```

**例:**

```
feat: Add RSS feed filtering by date
fix: Fix database connection error
docs: Update TEAM_DEVELOPMENT.md
refactor: Improve AI prompt for better responses
```

---

## トラブルシューティング

### 認証エラー

```
fatal: Authentication failed
```

**解決策:**

```powershell
# 認証情報を再設定
git config --global credential.helper wincred

# または、認証情報をクリア
git credential-manager clear
```

### コンフリクトの解決

```powershell
# コンフリクトが発生した場合
git status  # コンフリクトファイルを確認

# ファイルを編集してコンフリクトを解決
notepad path/to/conflicted/file

# 解決後
git add path/to/conflicted/file
git commit -m "Resolve merge conflict"
git push
```

### プッシュが拒否される

```
! [rejected] main -> main (fetch first)
```

**解決策:**

```powershell
# 最新を取得してマージ
git pull origin main

# コンフリクトがあれば解決

# 再度プッシュ
git push origin main
```

### .envファイルをコミットしてしまった

```powershell
# .envをGit履歴から削除
git rm --cached backend/.env

# .gitignoreに追加されているか確認
type .gitignore

# コミット
git commit -m "Remove .env from repository"
git push
```

---

## チーム開発のベストプラクティス

### 1. 定期的なコミュニケーション

- 毎日の進捗共有
- 週次のコードレビュー会
- 問題が発生したら即座に共有

### 2. コードの品質維持

- コミット前に必ずローカルでテスト
- 小さな単位でコミット
- わかりやすいコミットメッセージ

### 3. ドキュメントの更新

- 新機能を追加したらREADME.mdを更新
- 環境変数を追加したら.env.exampleを更新
- 重要な変更はCHANGELOG.mdに記録

### 4. セキュリティ

- `.env`ファイルは絶対にコミットしない
- AWS認証情報は個人で管理
- 機密情報はAWS Secrets Managerを使用

---

## クイックリファレンス

### よく使うコマンド

```powershell
# 最新を取得
git pull origin main

# ブランチ作成
git checkout -b feature/new-feature

# 変更をコミット
git add .
git commit -m "feat: Add new feature"

# プッシュ
git push origin feature/new-feature

# ブランチ一覧
git branch -a

# ブランチ切り替え
git checkout main

# ブランチ削除
git branch -d feature/old-feature

# 変更を一時保存
git stash

# 一時保存を復元
git stash pop

# コミット履歴
git log --oneline

# 変更差分
git diff
```

---

## サポート

問題が発生した場合：

1. このドキュメントのトラブルシューティングを確認
2. チームのSlack/Teamsチャンネルで質問
3. プロジェクトリーダーに連絡

**Happy Coding! 👻🧟💀**
