# 📦 ドキュメント移行ガイド

このドキュメントは、2025年11月24日に実施したドキュメント整理の記録です。

## 🎯 整理の目的

プロジェクトルートがMarkdownファイルであふれていたため、以下の目的で整理を実施：

1. **可読性の向上**: 実行ファイルとドキュメントを分離
2. **保守性の向上**: カテゴリ別にドキュメントを分類
3. **新規参加者の理解促進**: 構造化されたドキュメント配置

## 📂 新しいフォルダ構成

```
ReBBS/
├── README.md                       # プロジェクト概要
├── PROJECT_STRUCTURE.md            # フォルダ構成の説明
├── package.json
├── .gitignore
├── START.bat                       # 実行ファイル
│
├── docs/                           # 📚 ドキュメント集約
│   ├── setup/                      # 🔧 セットアップ関連
│   ├── development/                # 👥 開発・Git関連
│   ├── security/                   # 🔐 セキュリティ・権限関連
│   └── operations/                 # 📊 運用関連
│
├── scripts/                        # 🛠️ スクリプト・ツール
│   └── test-bedrock.js
│
├── backend/
└── frontend/
```

## 📋 ファイル移動の詳細

### docs/setup/ - セットアップ関連

| 旧パス | 新パス |
|--------|--------|
| `STARTUP_GUIDE.md` | `docs/setup/STARTUP_GUIDE.md` |
| `LOCAL_DEV_SETUP.md` | `docs/setup/LOCAL_DEV_SETUP.md` |
| `AWS_BEDROCK_SETUP.md` | `docs/setup/AWS_BEDROCK_SETUP.md` |
| `WINDOWS_SETUP.md` | `docs/setup/WINDOWS_SETUP.md` |

### docs/development/ - 開発・Git関連

| 旧パス | 新パス |
|--------|--------|
| `TEAM_DEVELOPMENT.md` | `docs/development/TEAM_DEVELOPMENT.md` |
| `GIT_WORKFLOW.md` | `docs/development/GIT_WORKFLOW.md` |
| `QUICK_START_CODECOMMIT.md` | `docs/development/QUICK_START_CODECOMMIT.md` |
| `INITIAL_PUSH.md` | `docs/development/INITIAL_PUSH.md` |

**注**: `CODECOMMIT_SETUP.md`は`TEAM_DEVELOPMENT.md`に統合されました。

### docs/security/ - セキュリティ・権限関連

| 旧パス | 新パス |
|--------|--------|
| `IAM_POLICIES.md` | `docs/security/IAM_POLICIES.md` |

### docs/operations/ - 運用関連

| 旧パス | 新パス |
|--------|--------|
| `COST_CONTROL.md` | `docs/operations/COST_CONTROL.md` |
| `CHANGELOG.md` | `docs/operations/CHANGELOG.md` |

### scripts/ - スクリプト・ツール

| 旧パス | 新パス |
|--------|--------|
| `test-bedrock.js` | `scripts/test-bedrock.js` |

## 🔄 更新されたファイル

### README.md

ドキュメントへのリンクを全て更新：

```markdown
# 旧
- [STARTUP_GUIDE.md](./setup/STARTUP_GUIDE.md)

# 新
- [STARTUP_GUIDE.md](./docs/setup/STARTUP_GUIDE.md)
```

### 新規作成ファイル

- **PROJECT_STRUCTURE.md**: プロジェクト構成の詳細説明
- **docs/MIGRATION_GUIDE.md**: このファイル（移行記録）

## ✅ 移行後のチェックリスト

### 必須確認事項

- [x] 全てのMarkdownファイルが適切なフォルダに移動
- [x] README.mdのリンクが全て更新
- [x] test-bedrock.jsがscripts/に移動
- [x] PROJECT_STRUCTURE.mdを作成
- [x] .gitignoreが正しく機能

### 動作確認

- [ ] `START.bat` が正常に動作するか確認
- [ ] `node scripts/test-bedrock.js` が正常に動作するか確認
- [ ] README.mdの全てのリンクが正しく機能するか確認

## 🚨 注意事項

### 既存のブックマークやリンク

外部からのリンクや、ローカルのブックマークは更新が必要です：

```
# 旧URL（動作しない）
./STARTUP_GUIDE.md

# 新URL
./docs/setup/STARTUP_GUIDE.md
```

### Gitでの変更

この移行は以下のGit操作で実施：

```bash
# ファイル移動（Gitの履歴を保持）
git mv STARTUP_GUIDE.md docs/setup/
git mv LOCAL_DEV_SETUP.md docs/setup/
# ... 以下同様

# コミット
git add .
git commit -m "docs: Reorganize documentation structure

- Move all docs to docs/ folder
- Categorize into setup/development/security/operations
- Move test-bedrock.js to scripts/
- Update all links in README.md
- Add PROJECT_STRUCTURE.md"
```

## 📚 ドキュメントの探し方

### 以前の方法
```
Thread_of_the_Dead/
├── STARTUP_GUIDE.md
├── LOCAL_DEV_SETUP.md
├── AWS_BEDROCK_SETUP.md
├── ... (13個のMDファイル)
```

### 新しい方法

1. **README.md** を開く
2. カテゴリ別のリンクから目的のドキュメントを探す
3. または **PROJECT_STRUCTURE.md** で全体構成を確認

## 🎓 チームメンバーへの周知

### 既存メンバー向け

「ドキュメントの場所が変わりました！」

- 全てのドキュメントは `docs/` フォルダに移動
- README.mdのリンクは全て更新済み
- ブックマークしている場合は更新してください

### 新規メンバー向け

「整理されたドキュメント構成で学習しやすくなりました！」

1. README.md から始める
2. PROJECT_STRUCTURE.md で全体像を把握
3. 目的に応じて docs/ 配下のドキュメントを参照

## 🔮 今後の運用

### ドキュメント追加時のルール

1. **適切なカテゴリを選ぶ**
   - セットアップ関連 → `docs/setup/`
   - 開発・Git関連 → `docs/development/`
   - セキュリティ関連 → `docs/security/`
   - 運用関連 → `docs/operations/`

2. **README.mdにリンクを追加**
   ```markdown
   - [NEW_DOC.md](./docs/category/NEW_DOC.md) - 説明
   ```

3. **PROJECT_STRUCTURE.mdを更新**
   新しいドキュメントの説明を追加

### 新しいカテゴリが必要な場合

```bash
# 新しいカテゴリフォルダを作成
mkdir docs/new-category

# README.mdとPROJECT_STRUCTURE.mdを更新
```

## 📊 整理の効果

### Before（整理前）
```
ReBBS/
├── README.md
├── STARTUP_GUIDE.md
├── LOCAL_DEV_SETUP.md
├── AWS_BEDROCK_SETUP.md
├── WINDOWS_SETUP.md
├── TEAM_DEVELOPMENT.md
├── GIT_WORKFLOW.md
├── QUICK_START_CODECOMMIT.md
├── INITIAL_PUSH.md
├── IAM_POLICIES.md
├── COST_CONTROL.md
├── CHANGELOG.md
├── test-bedrock.js
├── START.bat
├── package.json
├── backend/
└── frontend/
```
→ **ルート直下に16ファイル**（見づらい）

### After（整理後）
```
ReBBS/
├── README.md
├── PROJECT_STRUCTURE.md
├── START.bat
├── package.json
├── docs/
│   ├── setup/
│   ├── development/
│   ├── security/
│   └── operations/
├── scripts/
├── backend/
└── frontend/
```
→ **ルート直下に5ファイル + 4フォルダ**（すっきり）

## 🎉 まとめ

- ✅ ドキュメントを4つのカテゴリに分類
- ✅ ルート直下をすっきり整理
- ✅ 新規参加者が理解しやすい構成
- ✅ 保守性・拡張性の向上

---

**整理完了日**: 2025年11月24日  
**実施者**: Kiro AI Assistant  
**承認者**: プロジェクトオーナー
