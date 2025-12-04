# 📎 ドキュメントリンク参照ガイド

このドキュメントは、各ファイルから他のドキュメントへの正しいリンクパスを示します。

## 📂 ファイルの場所による相対パス

### ルート直下のファイル（README.md, QUICKSTART.md, PROJECT_STRUCTURE.md など）

```markdown
# ルート直下の他のファイルへ
[QUICKSTART.md](./QUICKSTART.md)
[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

# docs/setup/ へ
[STARTUP_GUIDE.md](./docs/setup/STARTUP_GUIDE.md)
[AWS_BEDROCK_SETUP.md](./docs/setup/AWS_BEDROCK_SETUP.md)

# docs/development/ へ
[GIT_WORKFLOW.md](./docs/development/GIT_WORKFLOW.md)
[TEAM_DEVELOPMENT.md](./docs/development/TEAM_DEVELOPMENT.md)

# docs/security/ へ
[IAM_POLICIES.md](./docs/security/IAM_POLICIES.md)

# docs/operations/ へ
[COST_CONTROL.md](./docs/operations/COST_CONTROL.md)
[CHANGELOG.md](./docs/operations/CHANGELOG.md)
```

---

### docs/setup/ 内のファイル

```markdown
# ルートへ
[README.md](../../README.md)
[QUICKSTART.md](../../QUICKSTART.md)
[PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md)

# 同じフォルダ内
[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
[AWS_BEDROCK_SETUP.md](./AWS_BEDROCK_SETUP.md)

# 他のカテゴリへ
[GIT_WORKFLOW.md](../development/GIT_WORKFLOW.md)
[IAM_POLICIES.md](../security/IAM_POLICIES.md)
[COST_CONTROL.md](../operations/COST_CONTROL.md)
```

---

### docs/development/ 内のファイル

```markdown
# ルートへ
[README.md](../../README.md)
[QUICKSTART.md](../../QUICKSTART.md)
[PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md)

# 同じフォルダ内
[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
[TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md)
[QUICK_START_CODECOMMIT.md](./QUICK_START_CODECOMMIT.md)

# 他のカテゴリへ
[STARTUP_GUIDE.md](../setup/STARTUP_GUIDE.md)
[IAM_POLICIES.md](../security/IAM_POLICIES.md)
[COST_CONTROL.md](../operations/COST_CONTROL.md)
```

---

### docs/security/ 内のファイル

```markdown
# ルートへ
[README.md](../../README.md)
[QUICKSTART.md](../../QUICKSTART.md)

# 他のカテゴリへ
[STARTUP_GUIDE.md](../setup/STARTUP_GUIDE.md)
[GIT_WORKFLOW.md](../development/GIT_WORKFLOW.md)
[COST_CONTROL.md](../operations/COST_CONTROL.md)
```

---

### docs/operations/ 内のファイル

```markdown
# ルートへ
[README.md](../../README.md)
[QUICKSTART.md](../../QUICKSTART.md)

# 他のカテゴリへ
[STARTUP_GUIDE.md](../setup/STARTUP_GUIDE.md)
[GIT_WORKFLOW.md](../development/GIT_WORKFLOW.md)
[IAM_POLICIES.md](../security/IAM_POLICIES.md)
```

---

## 🔍 リンク確認コマンド

### PowerShellでリンク切れをチェック

```powershell
# 全てのMarkdownファイルから相対リンクを抽出
Get-ChildItem -Path . -Filter "*.md" -Recurse | 
  Select-String -Pattern "\]\(\./[^)]+\)" | 
  Select-Object Path, LineNumber, Line

# ルート直下のファイルへのリンクを探す（docs/内から）
Get-ChildItem -Path .\docs -Filter "*.md" -Recurse | 
  Select-String -Pattern "\]\(\./[A-Z_]+\.md\)"
```

---

## ✅ リンクチェックリスト

### README.md
- [ ] QUICKSTART.md へのリンク
- [ ] PROJECT_STRUCTURE.md へのリンク
- [ ] docs/setup/ 内のファイルへのリンク
- [ ] docs/development/ 内のファイルへのリンク
- [ ] docs/security/ 内のファイルへのリンク
- [ ] docs/operations/ 内のファイルへのリンク

### QUICKSTART.md
- [ ] README.md へのリンク
- [ ] PROJECT_STRUCTURE.md へのリンク
- [ ] docs/setup/ 内のファイルへのリンク
- [ ] docs/development/ 内のファイルへのリンク

### PROJECT_STRUCTURE.md
- [ ] README.md へのリンク
- [ ] QUICKSTART.md へのリンク
- [ ] docs/ 内の全カテゴリへのリンク

### docs/setup/ 内のファイル
- [ ] ルートファイルへのリンク（../../）
- [ ] 同じフォルダ内のリンク（./）
- [ ] 他のカテゴリへのリンク（../category/）

### docs/development/ 内のファイル
- [ ] ルートファイルへのリンク（../../）
- [ ] 同じフォルダ内のリンク（./）
- [ ] 他のカテゴリへのリンク（../category/）

### docs/security/ 内のファイル
- [ ] ルートファイルへのリンク（../../）
- [ ] 他のカテゴリへのリンク（../category/）

### docs/operations/ 内のファイル
- [ ] ルートファイルへのリンク（../../）
- [ ] 他のカテゴリへのリンク（../category/）

---

## 🛠️ よくある間違い

### ❌ 間違い: docs/内から同じ階層のファイルへ
```markdown
# docs/development/GIT_WORKFLOW.md から
[TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md)  # ❌ 間違い
```

### ✅ 正しい
```markdown
# docs/development/GIT_WORKFLOW.md から
[TEAM_DEVELOPMENT.md](./TEAM_DEVELOPMENT.md)  # ✅ 正しい（同じフォルダ内）
[TEAM_DEVELOPMENT.md](../development/TEAM_DEVELOPMENT.md)  # ✅ 正しい（明示的）
```

---

### ❌ 間違い: docs/内からルートへ
```markdown
# docs/setup/STARTUP_GUIDE.md から
[README.md](./README.md)  # ❌ 間違い
```

### ✅ 正しい
```markdown
# docs/setup/STARTUP_GUIDE.md から
[README.md](../../README.md)  # ✅ 正しい
```

---

### ❌ 間違い: ルートからdocs/内へ
```markdown
# README.md から
[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)  # ❌ 間違い（移動前のパス）
```

### ✅ 正しい
```markdown
# README.md から
[STARTUP_GUIDE.md](./docs/setup/STARTUP_GUIDE.md)  # ✅ 正しい
```

---

## 📝 リンク更新時のルール

1. **ファイルを移動したら、そのファイルへのリンクを全て更新**
2. **相対パスの階層を正しく数える**
   - `./` = 同じフォルダ
   - `../` = 1つ上のフォルダ
   - `../../` = 2つ上のフォルダ
3. **リンク更新後、必ずテストする**

---

## 🔗 全ドキュメントのリンクマップ

```
ReBBS/
├── README.md
│   ├→ QUICKSTART.md
│   ├→ PROJECT_STRUCTURE.md
│   └→ docs/**/*.md
│
├── QUICKSTART.md
│   ├→ README.md
│   ├→ PROJECT_STRUCTURE.md
│   └→ docs/**/*.md
│
├── PROJECT_STRUCTURE.md
│   ├→ README.md
│   └→ docs/**/*.md
│
└── docs/
    ├── setup/
    │   ├→ ../../README.md
    │   ├→ ../development/*.md
    │   └→ ../operations/*.md
    │
    ├── development/
    │   ├→ ../../README.md
    │   ├→ ../setup/*.md
    │   └→ ../security/*.md
    │
    ├── security/
    │   ├→ ../../README.md
    │   └→ ../setup/*.md
    │
    └── operations/
        ├→ ../../README.md
        └→ ../setup/*.md
```

---

**リンク切れを見つけたら、このドキュメントを参照して修正してください！**
