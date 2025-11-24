# 🐙 GitHub セットアップガイド

## 📢 重要なお知らせ

AWS CodeCommitは2024年7月25日に新規リポジトリの作成が停止され、既存リポジトリも2025年7月25日にサービス終了となります。
このプロジェクトではGitHubを使用します。

参考: [AWS CodeCommitからの移行ガイド](https://aws.amazon.com/jp/blogs/news/how-to-migrate-your-aws-codecommit-repository-to-another-git-provider/)

---

## 1. GitHubリポジトリの作成

### 管理者向け: 新規リポジトリ作成

1. **GitHub**にログイン (https://github.com)
2. 右上の「+」→「New repository」をクリック
3. リポジトリ設定:
   - **Repository name**: `thread-of-the-dead`
   - **Description**: `Thread of the Dead - なんJ風AI掲示板アプリケーション`
   - **Visibility**: Private（推奨）または Public
   - **Initialize this repository**: チェックを入れない（既存プロジェクトをプッシュするため）
4. 「**Create repository**」をクリック

### リポジトリURLをメモ

作成後、以下の情報をメモ：
- **HTTPS URL**: `https://github.com/takahashi0022/thread-of-the-dead.git`
- **SSH URL**: `git@github.com:takahashi0022/thread-of-the-dead.git`

---

## 2. Git認証情報の設定

### 方法A: Personal Access Token（推奨）

GitHubは2021年8月以降、パスワード認証を廃止しました。Personal Access Token（PAT）を使用します。

#### トークンの生成

1. GitHub → 右上のアイコン → **Settings**
2. 左メニュー最下部の「**Developer settings**」
3. 「**Personal access tokens**」→「**Tokens (classic)**」
4. 「**Generate new token**」→「**Generate new token (classic)**」
5. トークン設定:
   - **Note**: `Thread of the Dead Development`
   - **Expiration**: 90 days（または任意）
   - **Select scopes**: 
     - ✅ `repo`（フルアクセス）
     - ✅ `workflow`（GitHub Actions用、オプション）
6. 「**Generate token**」をクリック
7. **トークンをコピーして安全に保存**（⚠️ 再表示不可）

#### Windowsでの認証情報保存

```powershell
# Git認証情報を保存
git config --global credential.helper wincred

# ユーザー情報を設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

初回プッシュ時に：
- **Username**: GitHubのユーザー名
- **Password**: Personal Access Token（パスワードではない）

---

### 方法B: SSH認証

#### SSH鍵の生成

```powershell
# SSH鍵を生成
ssh-keygen -t ed25519 -C "your.email@example.com"

# または、古いシステムの場合
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 公開鍵を表示
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

#### GitHubに公開鍵を登録

1. GitHub → 右上のアイコン → **Settings**
2. 左メニューの「**SSH and GPG keys**」
3. 「**New SSH key**」をクリック
4. 設定:
   - **Title**: `Windows PC - Thread of the Dead`
   - **Key**: 公開鍵の内容を貼り付け
5. 「**Add SSH key**」をクリック

#### SSH接続テスト

```powershell
ssh -T git@github.com
# 成功時: Hi username! You've successfully authenticated...
```

---

## 3. 既存プロジェクトをGitHubにプッシュ

### 初回セットアップ

```powershell
# プロジェクトディレクトリに移動
cd Thread_of_the_Dead

# Gitリポジトリを初期化（まだの場合）
git init

# GitHubをリモートリポジトリとして追加
git remote add origin https://github.com/takahashi0022/thread-of-the-dead.git

# または SSH の場合
# git remote add origin git@github.com:takahashi0022/thread-of-the-dead.git

# .gitignoreの確認
type .gitignore

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Thread of the Dead application"

# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

初回プッシュ時、認証情報を入力：
- **Username**: GitHubのユーザー名
- **Password**: Personal Access Token

---

## 4. チームメンバーの追加

### リポジトリへのアクセス権限付与

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

#### Organizationの場合

1. Organization設定 → **Teams**
2. チームを作成（例: `thread-of-the-dead-developers`）
3. チームメンバーを追加
4. リポジトリにチームを追加して権限を付与

---

## 5. チームメンバーのクローン手順

### リポジトリをクローン

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

### 依存関係のインストール

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

### 環境変数の設定

```powershell
# .envファイルを作成
copy backend\.env.example backend\.env

# 編集（チームリーダーから認証情報を取得）
notepad backend\.env
```

### 動作確認

```powershell
# Bedrock接続テスト
node scripts\test-bedrock.js

# アプリケーション起動
START.bat
```

---

## 6. ブランチ保護の設定（推奨）

### mainブランチの保護

1. GitHubリポジトリページ → **Settings**
2. 左メニューの「**Branches**」
3. 「**Add branch protection rule**」をクリック
4. 設定:
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
     - ✅ **Require approvals**: 1（最低1人の承認が必要）
   - ✅ **Require status checks to pass before merging**（CI/CD設定時）
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
5. 「**Create**」をクリック

---

## 7. GitHub Actionsの設定（オプション）

### 自動テスト・デプロイの設定

`.github/workflows/ci.yml` を作成：

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm install
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
```

---

## トラブルシューティング

### 認証エラー: "Authentication failed"

```powershell
# 認証情報をクリア
git config --global --unset credential.helper
git config --global credential.helper wincred

# 再度プッシュ（Personal Access Tokenを入力）
git push origin main
```

### リモートURLの確認・変更

```powershell
# 現在のリモートURL確認
git remote -v

# HTTPSに変更
git remote set-url origin https://github.com/takahashi0022/thread-of-the-dead.git

# SSHに変更
git remote set-url origin git@github.com:takahashi0022/thread-of-the-dead.git
```

### SSH接続エラー

```powershell
# SSH設定を確認
ssh -T git@github.com

# SSH鍵が正しく登録されているか確認
# GitHub Settings → SSH and GPG keys
```

### Personal Access Tokenの有効期限切れ

1. GitHub → Settings → Developer settings → Personal access tokens
2. 期限切れのトークンを削除
3. 新しいトークンを生成
4. ローカルの認証情報を更新

---

## CodeCommitからの移行（既存プロジェクトの場合）

### 既にCodeCommitを使用している場合

```powershell
# 現在のリモートを確認
git remote -v

# CodeCommitのリモートを削除
git remote remove origin

# GitHubのリモートを追加
git remote add origin https://github.com/takahashi0022/thread-of-the-dead.git

# プッシュ
git push -u origin main
```

---

## GitHub vs CodeCommit 比較

| 機能 | GitHub | CodeCommit |
|------|--------|-----------|
| 料金 | 無料（Public）、$4/月〜（Private） | ⚠️ サービス終了 |
| プルリクエスト | ✅ 高機能 | ✅ 基本機能 |
| CI/CD | ✅ GitHub Actions | AWS CodePipeline |
| コミュニティ | ✅ 世界最大 | AWS内のみ |
| 認証 | PAT, SSH | IAM, SSH |
| ブランチ保護 | ✅ 高機能 | ✅ 基本機能 |

---

## 次のステップ

セットアップ完了後、以下を参照：

- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Git運用ルール
- [TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md) - チーム開発ガイド

---

**Happy Coding with GitHub! 🐙**
