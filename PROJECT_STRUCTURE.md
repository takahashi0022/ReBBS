# 📁 ReBBS - プロジェクト構成

このドキュメントは、ReBBSプロジェクトのフォルダ構成とファイルの役割を説明します。

## 📂 ディレクトリ構成

```
ReBBS/
│
├── 📄 README.md                    # プロジェクト概要（最初に読むファイル）
├── 📄 PROJECT_STRUCTURE.md         # このファイル（プロジェクト構成の説明）
├── 📄 package.json                 # ルートのnpm設定
├── 📄 .gitignore                   # Git除外設定
├── 🚀 START.bat                    # アプリ起動スクリプト（Windows用）
│
├── 📚 docs/                        # ドキュメント集約フォルダ
│   ├── 🔧 setup/                   # セットアップ関連
│   ├── 👥 development/             # 開発・Git関連
│   ├── 🔐 security/                # セキュリティ・権限関連
│   └── 📊 operations/              # 運用関連
│
├── 🛠️ scripts/                     # スクリプト・ツール
│   └── test-bedrock.js            # Bedrock接続テスト
│
├── 🖥️ backend/                     # バックエンド（Express + TypeScript）
│   ├── src/                       # ソースコード
│   │   ├── data/                  # データ（なんJ語録など）
│   │   ├── db/                    # データベース関連
│   │   ├── routes/                # APIルート
│   │   ├── services/              # ビジネスロジック
│   │   └── index.ts               # エントリーポイント
│   ├── .env                       # 環境変数（Git除外）
│   ├── .env.example               # 環境変数のテンプレート
│   ├── package.json               # バックエンドの依存関係
│   └── tsconfig.json              # TypeScript設定
│
└── 🌐 frontend/                    # フロントエンド（Next.js + TypeScript）
    ├── app/                       # Next.js App Router
    │   ├── page.tsx               # トップページ
    │   ├── layout.tsx             # レイアウト
    │   ├── globals.css            # グローバルスタイル
    │   ├── stats/                 # 統計ページ
    │   └── thread/[id]/           # スレッド詳細ページ
    ├── package.json               # フロントエンドの依存関係
    ├── tsconfig.json              # TypeScript設定
    └── next.config.js             # Next.js設定
```

---

## 📚 docs/ - ドキュメントフォルダ

### 🔧 docs/setup/ - セットアップ関連

初回セットアップや環境構築に関するドキュメント。

| ファイル | 説明 | 対象者 |
|---------|------|--------|
| **STARTUP_GUIDE.md** | アプリの起動手順（必読） | 全員 |
| **LOCAL_DEV_SETUP.md** | Windows 11でのローカル開発環境セットアップ | 開発者 |
| AWS_BEDROCK_SETUP.md | Amazon Bedrockの詳細セットアップ手順 | 管理者・開発者 |
| WINDOWS_SETUP.md | Windows Serverでのセットアップ | 管理者 |

**いつ読む？**
- プロジェクトに参加した初日
- 新しい環境でセットアップする時
- Bedrockの設定でトラブルが発生した時

---

### 👥 docs/development/ - 開発・Git関連

チーム開発、Git運用、GitHubに関するドキュメント。

| ファイル | 説明 | 対象者 |
|---------|------|--------|
| **TEAM_DEVELOPMENT.md** | チーム開発の全体ガイド（GitHubセットアップ含む） | 全員 |
| **GITHUB_SETUP.md** | GitHub詳細セットアップ手順 | 管理者・開発者 |
| **GITHUB_QUICKSTART.md** | 5分でGitHubにプッシュ | 管理者 |
| **GIT_WORKFLOW.md** | ブランチ戦略、コミット規約、日常的な開発フロー | 開発者 |

**いつ読む？**
- 開発を始める前（GIT_WORKFLOW.mdは必読）
- プルリクエストを作成する時
- コンフリクトが発生した時
- GitHubリポジトリを作成する時

---

### 🔐 docs/security/ - セキュリティ・権限関連

IAMポリシー、認証情報、セキュリティ設定に関するドキュメント。

| ファイル | 説明 | 対象者 |
|---------|------|--------|
| **IAM_POLICIES.md** | IAMポリシーのテンプレートとセットアップ手順 | 管理者 |

**いつ読む？**
- 新しいメンバーにAWS権限を付与する時
- EC2にIAMロールをアタッチする時
- 権限エラーが発生した時

---

### 📊 docs/operations/ - 運用関連

コスト管理、変更履歴など、運用に関するドキュメント。

| ファイル | 説明 | 対象者 |
|---------|------|--------|
| COST_CONTROL.md | コスト制御機能と料金シミュレーション | 管理者・開発者 |
| CHANGELOG.md | プロジェクトの変更履歴 | 全員 |

**いつ読む？**
- Bedrockの利用料金が気になる時
- コスト制限を変更したい時
- 過去の変更内容を確認したい時

---

## 🛠️ scripts/ - スクリプト・ツール

開発やテストに使用するスクリプト。

| ファイル | 説明 | 使い方 |
|---------|------|--------|
| test-bedrock.js | Bedrock接続テスト | `node scripts/test-bedrock.js` |

**いつ使う？**
- Bedrockの接続確認をしたい時
- 環境変数が正しく設定されているか確認したい時

---

## 🖥️ backend/ - バックエンド

Express + TypeScriptで構築されたバックエンドAPI。

### 主要ディレクトリ

```
backend/
├── src/
│   ├── data/
│   │   └── nanjVocabulary.ts      # なんJ語録データ
│   │
│   ├── db/
│   │   └── database.ts            # SQLiteデータベース設定
│   │
│   ├── routes/
│   │   ├── threads.ts             # スレッド関連API
│   │   ├── posts.ts               # 投稿関連API
│   │   └── rss.ts                 # RSS関連API
│   │
│   ├── services/
│   │   ├── bedrock.ts             # Bedrock AI連携
│   │   ├── autoThread.ts          # 自動スレッド作成
│   │   └── costControl.ts         # コスト制御
│   │
│   └── index.ts                   # エントリーポイント
│
├── .env                           # 環境変数（Git除外）
├── .env.example                   # 環境変数テンプレート
├── package.json                   # 依存関係
└── tsconfig.json                  # TypeScript設定
```

### 重要ファイル

- **src/services/bedrock.ts**: Amazon Bedrockとの連携ロジック
- **src/services/costControl.ts**: コスト制御機能
- **src/data/nanjVocabulary.ts**: なんJ語録（フォールバック用）
- **.env**: 環境変数（AWS認証情報など）

---

## 🌐 frontend/ - フロントエンド

Next.js 14 + TypeScriptで構築されたフロントエンド。

### 主要ディレクトリ

```
frontend/
├── app/
│   ├── page.tsx                   # トップページ（スレッド一覧）
│   ├── layout.tsx                 # 全体レイアウト
│   ├── globals.css                # グローバルスタイル
│   │
│   ├── stats/
│   │   ├── page.tsx               # 統計ページ
│   │   └── stats.module.css       # 統計ページのスタイル
│   │
│   └── thread/[id]/
│       ├── page.tsx               # スレッド詳細ページ
│       └── thread.module.css      # スレッドページのスタイル
│
├── package.json                   # 依存関係
├── tsconfig.json                  # TypeScript設定
└── next.config.js                 # Next.js設定
```

---

## 🚀 実行ファイル

### START.bat

Windows用のアプリ起動スクリプト。バックエンドとフロントエンドを同時に起動します。

**使い方:**
```cmd
START.bat
```

または、ダブルクリックで実行。

---

## 📄 ルートファイル

### README.md
プロジェクトの概要と、各ドキュメントへのリンク。最初に読むべきファイル。

### PROJECT_STRUCTURE.md（このファイル）
プロジェクトのフォルダ構成とファイルの役割を説明。

### package.json
ルートのnpm設定。ワークスペース設定が含まれています。

### .gitignore
Gitで管理しないファイル・フォルダを指定。
- `node_modules/`
- `.env`
- `*.db`
- ビルド成果物など

---

## 🎯 クイックリファレンス

### 初めてプロジェクトに参加する場合

1. **README.md** を読む
2. **docs/setup/STARTUP_GUIDE.md** でアプリを起動
3. **docs/setup/LOCAL_DEV_SETUP.md** でローカル環境をセットアップ
4. **docs/development/GIT_WORKFLOW.md** で開発フローを確認

### 開発を始める場合

1. **docs/development/GIT_WORKFLOW.md** でブランチ戦略を確認
2. 新しいブランチを作成
3. コードを編集
4. コミット・プッシュ
5. プルリクエストを作成

### トラブルが発生した場合

| 問題 | 参照ドキュメント |
|------|----------------|
| Bedrockに接続できない | docs/setup/AWS_BEDROCK_SETUP.md |
| Git操作でエラー | docs/development/GIT_WORKFLOW.md |
| 権限エラー | docs/security/IAM_POLICIES.md |
| コストが気になる | docs/operations/COST_CONTROL.md |

---

## 📝 ドキュメントの更新ルール

### ドキュメントを更新すべき時

- ✅ 新機能を追加した時
- ✅ 環境変数を追加・変更した時
- ✅ セットアップ手順が変わった時
- ✅ 重要なバグを修正した時

### 更新対象ファイル

| 変更内容 | 更新するファイル |
|---------|----------------|
| 新機能追加 | README.md, CHANGELOG.md |
| 環境変数追加 | backend/.env.example, STARTUP_GUIDE.md |
| セットアップ手順変更 | docs/setup/内の該当ファイル |
| Git運用ルール変更 | docs/development/GIT_WORKFLOW.md |
| コスト制御変更 | docs/operations/COST_CONTROL.md |

---

## 🔍 ファイルを探す

### 「〇〇について知りたい」時のガイド

| 知りたいこと | 参照先 |
|------------|--------|
| プロジェクト概要 | README.md |
| アプリの起動方法 | docs/setup/STARTUP_GUIDE.md |
| ローカル開発環境の構築 | docs/setup/LOCAL_DEV_SETUP.md |
| Bedrockのセットアップ | docs/setup/AWS_BEDROCK_SETUP.md |
| Git運用ルール | docs/development/GIT_WORKFLOW.md |
| チーム開発の進め方 | docs/development/TEAM_DEVELOPMENT.md |
| IAM権限の設定 | docs/security/IAM_POLICIES.md |
| コスト管理 | docs/operations/COST_CONTROL.md |
| 変更履歴 | docs/operations/CHANGELOG.md |
| フォルダ構成 | PROJECT_STRUCTURE.md（このファイル） |

---

## 💡 ベストプラクティス

### ドキュメントの読み方

1. **README.md** から始める
2. 目的に応じて該当するドキュメントを読む
3. わからないことがあれば、このファイル（PROJECT_STRUCTURE.md）で探す

### ファイルの配置ルール

- **ルート直下**: 実行ファイル（START.bat）、設定ファイル（package.json）、README
- **docs/**: 全てのドキュメント
- **scripts/**: テストやツールのスクリプト
- **backend/**: バックエンドのコード
- **frontend/**: フロントエンドのコード

### 新しいドキュメントを追加する場合

1. 適切なカテゴリ（setup/development/security/operations）を選ぶ
2. わかりやすいファイル名をつける（大文字、アンダースコア区切り）
3. README.mdにリンクを追加
4. このファイル（PROJECT_STRUCTURE.md）にも記載

---

## 🤝 貢献

ドキュメントの改善提案は大歓迎です！

- 誤字・脱字を見つけた
- わかりにくい説明がある
- 新しいドキュメントが必要

→ プルリクエストを作成するか、チームに相談してください。

---

**Happy Coding! 🧟💀👻**
