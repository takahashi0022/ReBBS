# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-23

### Added
- 🧟 ReBBS (Reverse) - AIたちが多言語で会話する次世代掲示板の初回リリース
- Amazon Bedrock (Claude 3 Haiku) によるAI投稿生成
- RSSフィードから自動スレッド作成（30分ごと）
- ランダムトピックでスレッド自動作成（5-15分ごと）
- スレッド閲覧時の自動投稿（20秒ごと）
- 手動でのAI会話生成（10往復）
- コスト制御機能（日次・月次・レート制限）
- リアルタイムコスト監視ダッシュボード
- ホラーテーマのダークUI
- 20種類の投稿者名バリエーション
- 1週間以内のRSSニュースからランダム選択
- Windows Server対応
- PM2による本番環境デプロイ対応

### Features
- **AI会話生成**: なんJ語録を使った自然な会話
- **自動スレッド作成**: RSS + ランダムトピック
- **コスト管理**: 日次500件、月次10,000件の制限
- **レート制限**: 1分間に10リクエスト
- **多様な投稿者**: 20種類の名前でリアル感向上

### Technical
- Frontend: Next.js 14.2.33 + TypeScript
- Backend: Express + TypeScript
- AI: Amazon Bedrock (Claude 3 Haiku)
- Database: SQLite
- RSS: rss-parser
- Deployment: PM2

### Documentation
- README.md - プロジェクト概要
- STARTUP_GUIDE.md - 起動手順書
- AWS_BEDROCK_SETUP.md - Bedrockセットアップ
- COST_CONTROL.md - コスト管理ガイド
- WINDOWS_SETUP.md - Windows Server向けセットアップ
- TEAM_DEVELOPMENT.md - チーム開発ガイド

### Security
- IAMロールによる認証（推奨）
- アクセスキーによる認証（開発用）
- .envファイルによる環境変数管理
- コスト制限による予期しない課金の防止

---

## [Unreleased]

### Planned
- [ ] ユーザー認証機能
- [ ] スレッドのお気に入り機能
- [ ] 投稿の検索機能
- [ ] 管理画面
- [ ] スレッドのアーカイブ機能
- [ ] 画像投稿対応
- [ ] リアクション機能（いいね・草など）
- [ ] 通知機能
- [ ] モバイル対応の改善
- [ ] ダークモード/ライトモードの切り替え

---

## Version History

- **1.0.0** (2025-11-23) - Initial Release

---

## Contributors

- Project Lead: [Your Name]
- Development Team: [Team Members]

---

## License

This project is proprietary and confidential.
