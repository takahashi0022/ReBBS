# Git ワークフロー・運用ルール

## ブランチ戦略

### ブランチ構成

```
main (本番環境)
  ↑
develop (開発環境)
  ↑
feature/* (機能開発)
bugfix/* (バグ修正)
hotfix/* (緊急修正)
```

### ブランチの役割

- **main**: 本番環境にデプロイされる安定版
- **develop**: 開発中の最新コード（次回リリース予定）
- **feature/**: 新機能開発用（例: `feature/user-profile`）
- **bugfix/**: バグ修正用（例: `bugfix/fix-post-display`）
- **hotfix/**: 本番環境の緊急修正用（例: `hotfix/critical-security-fix`）

## 基本的な作業フロー

### 1. 最新コードを取得

```bash
# developブランチに移動
git checkout develop

# 最新コードをプル
git pull origin develop
```

### 2. 新しいブランチを作成

```bash
# 機能開発の場合
git checkout -b feature/機能名

# バグ修正の場合
git checkout -b bugfix/修正内容

# 例
git checkout -b feature/add-user-profile
git checkout -b bugfix/fix-thread-display
```

### 3. 開発作業

```bash
# ファイルを編集

# 変更を確認
git status
git diff

# 変更をステージング
git add .

# コミット（わかりやすいメッセージで）
git commit -m "feat: ユーザープロフィール機能を追加"
```

### 4. リモートにプッシュ

```bash
# 初回プッシュ
git push -u origin feature/機能名

# 2回目以降
git push
```

### 5. プルリクエスト作成

1. AWS CodeCommitコンソールを開く
2. 「プルリクエスト」→「プルリクエストの作成」
3. ソースブランチ: `feature/機能名`
4. ターゲットブランチ: `develop`
5. タイトルと説明を記入
6. レビュアーを指定
7. 「作成」をクリック

### 6. コードレビュー・マージ

- レビュアーがコードを確認
- 問題があれば修正を依頼
- 承認されたらマージ
- マージ後、ローカルブランチを削除

```bash
# developに戻る
git checkout develop

# 最新コードをプル
git pull origin develop

# 作業ブランチを削除
git branch -d feature/機能名
```

## コミットメッセージ規約

### フォーマット

```
<type>: <subject>

<body>（オプション）

<footer>（オプション）
```

### Type（種類）

- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの意味に影響しない変更（空白、フォーマットなど）
- **refactor**: リファクタリング
- **perf**: パフォーマンス改善
- **test**: テストの追加・修正
- **chore**: ビルドプロセスやツールの変更

### 例

```bash
# 良い例
git commit -m "feat: スレッド検索機能を追加"
git commit -m "fix: 投稿時のタイムスタンプ表示を修正"
git commit -m "docs: READMEにセットアップ手順を追加"
git commit -m "refactor: bedrock.tsのエラーハンドリングを改善"

# 悪い例
git commit -m "update"
git commit -m "fix bug"
git commit -m "いろいろ修正"
```

## プッシュ前のチェックリスト

### 必須チェック

- [ ] コードが正常に動作するか確認
- [ ] 不要なconsole.logやデバッグコードを削除
- [ ] .envファイルや機密情報をコミットしていないか確認
- [ ] コミットメッセージが規約に従っているか確認

### 推奨チェック

- [ ] コードフォーマットが統一されているか
- [ ] 不要なファイルが含まれていないか（node_modules、.DS_Storeなど）
- [ ] 関連するドキュメントを更新したか

## プル（更新）のタイミング

### 毎日の作業開始時

```bash
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop
```

### 長期間作業する場合

- 最低でも1日1回はdevelopブランチの変更を取り込む
- コンフリクトを早期に発見・解決するため

## コンフリクト解決

### コンフリクトが発生した場合

```bash
# developの最新を取得
git checkout develop
git pull origin develop

# 作業ブランチに戻る
git checkout feature/your-branch

# developをマージ
git merge develop

# コンフリクトが発生した場合、ファイルを編集して解決
# <<<<<<< HEAD と >>>>>>> の間を手動で修正

# 解決後、コミット
git add .
git commit -m "merge: developブランチをマージ"
git push
```

## 緊急修正（Hotfix）の手順

本番環境で重大なバグが見つかった場合：

```bash
# mainブランチから直接hotfixブランチを作成
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 修正作業

# コミット
git commit -m "hotfix: 重大なバグを修正"

# mainにマージ
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# developにもマージ
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop

# hotfixブランチを削除
git branch -d hotfix/critical-bug-fix
```

## 禁止事項

### 絶対にやってはいけないこと

❌ mainブランチに直接プッシュ
❌ 他人のブランチに勝手にプッシュ
❌ force push（`git push -f`）を使う（特別な理由がない限り）
❌ .envファイルや機密情報をコミット
❌ 大きなバイナリファイル（画像、動画など）を直接コミット
❌ node_modulesやビルド成果物をコミット

### 注意が必要なこと

⚠️ 複数人が同じファイルを同時に編集（コンフリクトの原因）
⚠️ 長期間ブランチをマージしない（コンフリクトが複雑化）
⚠️ コミットメッセージが不明瞭

## よくある質問

### Q: 間違えてmainブランチで作業してしまった

```bash
# 変更をstash（一時保存）
git stash

# 新しいブランチを作成
git checkout -b feature/your-feature

# stashした変更を適用
git stash pop
```

### Q: コミットを取り消したい

```bash
# 直前のコミットを取り消し（変更は残る）
git reset --soft HEAD^

# 直前のコミットを完全に取り消し（変更も削除）
git reset --hard HEAD^
```

### Q: プッシュ済みのコミットを修正したい

```bash
# 最新のコミットメッセージを修正
git commit --amend -m "新しいメッセージ"

# force pushが必要（注意して使用）
git push -f origin your-branch
```

## チーム開発のベストプラクティス

1. **小さく頻繁にコミット**: 大きな変更を一度にコミットしない
2. **わかりやすいブランチ名**: 何をしているかが一目でわかる名前
3. **定期的にプル**: 他のメンバーの変更を早めに取り込む
4. **コードレビューを活用**: 品質向上とナレッジ共有
5. **コミュニケーション**: 大きな変更は事前に相談

## 参考コマンド集

```bash
# ブランチ一覧
git branch -a

# ブランチ削除
git branch -d branch-name

# リモートブランチ削除
git push origin --delete branch-name

# 変更を一時保存
git stash

# 一時保存した変更を復元
git stash pop

# コミット履歴を確認
git log --oneline --graph

# 特定のファイルの変更履歴
git log -p filename

# 変更を破棄
git checkout -- filename
```
