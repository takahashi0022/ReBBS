# ✅ 初回セットアップ チェックリスト

プロジェクトフォルダを入手した後、このチェックリストに従ってセットアップを進めてください。

## 📋 事前準備

- [ ] Node.js (v18以上) がインストール済み
- [ ] Git がインストール済み（未インストールの場合は下記参照）
- [ ] GitHubアカウントを作成済み
- [ ] AWS認証情報（IAMアクセスキー）を取得済み
- [ ] テキストエディタ（VS Codeなど）がインストール済み

### Gitのインストール（未インストールの場合）

**方法A: winget（Windows 10/11）**
```powershell
winget install Git.Git
```

**方法B: 公式インストーラー**
1. https://git-scm.com/download/win からダウンロード
2. インストーラーを実行（デフォルト設定でOK）

**インストール確認:**
```powershell
git --version
# 出力例: git version 2.43.0.windows.1
```

---

## 🎯 セットアップ手順

### ステップ1: 依存関係のインストール

- [ ] ルートディレクトリで `npm install` を実行
- [ ] `cd backend` → `npm install` を実行
- [ ] `cd frontend` → `npm install` を実行
- [ ] `node_modules/` フォルダが3箇所に作成されたことを確認

**所要時間**: 約3分

---

### ステップ2: 環境変数の設定

- [ ] `backend/.env.example` を `backend/.env` にコピー
- [ ] `backend/.env` を開く
- [ ] `AWS_ACCESS_KEY_ID` を実際の値に変更
- [ ] `AWS_SECRET_ACCESS_KEY` を実際の値に変更
- [ ] `AWS_REGION` を確認（デフォルト: ap-northeast-1）
- [ ] ファイルを保存

**所要時間**: 約1分

---

### ステップ3: Bedrock接続テスト

- [ ] `node scripts\test-bedrock.js` を実行
- [ ] "✅ Bedrock接続成功！" が表示されることを確認
- [ ] エラーが出た場合は、AWS認証情報を再確認

**所要時間**: 約30秒

---

### ステップ4: アプリケーション起動

- [ ] バックエンドを起動: `cd backend` → `npm run dev`
- [ ] フロントエンドを起動（別ターミナル）: `cd frontend` → `npm run dev`
- [ ] http://localhost:3000 にアクセス
- [ ] スレッド一覧が表示されることを確認

**所要時間**: 約1分

---

### ステップ5: GitHub認証設定

#### Personal Access Token（PAT）の生成

- [ ] GitHub → Settings → Developer settings → Personal access tokens
- [ ] 「Generate new token (classic)」をクリック
- [ ] Note: `Thread of the Dead Development`
- [ ] Expiration: 90 days（または任意）
- [ ] Scopes: ✅ `repo`
- [ ] 「Generate token」をクリック
- [ ] **トークンをコピーして安全に保存**（⚠️ 再表示不可）

**所要時間**: 約2分

---

### ステップ6: Git設定

- [ ] `git config --global user.name "Your Name"` を実行
- [ ] `git config --global user.email "your.email@example.com"` を実行
- [ ] `git config --global credential.helper wincred` を実行（Windows）

**所要時間**: 約1分

---

### ステップ7: リポジトリのクローン

- [ ] `git clone https://github.com/takahashi0022/thread-of-the-dead.git` を実行
- [ ] 認証情報を入力:
  - **Username**: GitHubのユーザー名
  - **Password**: Personal Access Token（ステップ5で生成したもの）
- [ ] `cd thread-of-the-dead` でプロジェクトディレクトリに移動
- [ ] `git remote -v` でリモートリポジトリを確認

**所要時間**: 約1分

---

## 📚 必読ドキュメント

セットアップ完了後、以下を読んでください：

- [ ] [README.md](../../README.md) - プロジェクト概要
- [ ] [QUICKSTART.md](../../QUICKSTART.md) - クイックスタートガイド
- [ ] [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md) - フォルダ構成
- [ ] [docs/development/GIT_WORKFLOW.md](../development/GIT_WORKFLOW.md) - Git運用ルール（必読）
- [ ] [docs/development/TEAM_DEVELOPMENT.md](../development/TEAM_DEVELOPMENT.md) - チーム開発ガイド
- [ ] [docs/development/GITHUB_SETUP.md](../development/GITHUB_SETUP.md) - GitHub詳細セットアップ

---

## 🎓 開発開始前の確認

- [ ] Git運用ルールを理解した
- [ ] ブランチ戦略を理解した
- [ ] コミットメッセージ規約を理解した
- [ ] プルリクエストの作成方法を理解した
- [ ] チームのコミュニケーションチャンネルに参加した

---

## 🚨 トラブルシューティング

### npm install でエラー

```powershell
# キャッシュをクリア
npm cache clean --force

# 再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

### Bedrock接続エラー

1. `backend/.env` のAWS認証情報を確認
2. IAMユーザーにBedrock権限があるか確認
3. [AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md) を参照

### ポート競合エラー

```powershell
# ポートを使用しているプロセスを確認
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# プロセスを終了
taskkill /PID <PID> /F
```

---

## 🚨 トラブルシューティング（追加）

### GitHub認証エラー

```powershell
# 認証情報をクリア
git config --global --unset credential.helper
git config --global credential.helper wincred

# 再度クローンまたはプル（Personal Access Tokenを入力）
git clone https://github.com/takahashi0022/thread-of-the-dead.git
```

### Personal Access Tokenを忘れた

1. GitHub → Settings → Developer settings → Personal access tokens
2. 古いトークンを削除
3. 新しいトークンを生成
4. 再度認証

---

## ✅ セットアップ完了確認

全てのチェックボックスにチェックが入ったら、セットアップ完了です！

- [ ] Gitのインストール完了
- [ ] GitHubアカウント作成完了
- [ ] Personal Access Token生成完了
- [ ] Git設定完了
- [ ] リポジトリのクローン完了
- [ ] 依存関係のインストール完了
- [ ] 環境変数の設定完了
- [ ] Bedrock接続テスト成功
- [ ] アプリケーション起動成功
- [ ] 必読ドキュメントを読了
- [ ] 開発開始前の確認完了

---

## 🎉 おめでとうございます！

セットアップが完了しました。開発を始めましょう！

**次のステップ**:
1. チームリーダーから最初のタスクを受け取る
2. [docs/development/GIT_WORKFLOW.md](../development/GIT_WORKFLOW.md) に従ってブランチを作成
3. コードを書く
4. プルリクエストを作成

**Happy Coding! 🧟💀👻**
