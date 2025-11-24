# 🚀 GitHub クイックスタート（5分）

GitHubにプロジェクトをプッシュするための最短手順です。

## 前提条件

- [ ] GitHubアカウントを作成済み
- [ ] Gitがインストール済み
- [ ] プロジェクトフォルダが手元にある

## 5分でプッシュ

### 1. GitHubでリポジトリを作成

1. https://github.com にログイン
2. 右上の「+」→「New repository」
3. Repository name: `thread-of-the-dead`
4. Visibility: Private（推奨）
5. 「Create repository」をクリック

### 2. Personal Access Tokenを生成

1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Note: `Thread of the Dead`
5. Scopes: ✅ `repo`
6. Generate token
7. **トークンをコピー**（⚠️ 再表示不可）

### 3. プロジェクトをプッシュ

```powershell
# プロジェクトディレクトリに移動
cd Thread_of_the_Dead

# Gitリポジトリを初期化（まだの場合）
git init

# GitHubをリモートとして追加
git remote add origin https://github.com/takahashi0022/thread-of-the-dead.git

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
- **Password**: Personal Access Token（手順2でコピーしたもの）

### 4. 確認

```powershell
# リモートブランチを確認
git branch -a

# 出力例:
# * main
#   remotes/origin/main
```

## 完了！

✅ GitHubへのプッシュが完了しました

次のステップ：
- チームメンバーを追加: リポジトリ → Settings → Collaborators
- ブランチ保護を設定: Settings → Branches
- 開発を開始: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)

## トラブルシューティング

### 認証エラーが出る

```powershell
# 認証情報を保存
git config --global credential.helper wincred

# 再度プッシュ（Personal Access Tokenを入力）
git push -u origin main
```

### リモートが既に存在する

```powershell
# 既存のリモートを削除
git remote remove origin

# 再度追加
git remote add origin https://github.com/takahashi0022/thread-of-the-dead.git
```

## 詳細ドキュメント

より詳しい情報は以下を参照：
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - 詳細なセットアップ手順
- [TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md) - チーム開発ガイド
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Git運用ルール
