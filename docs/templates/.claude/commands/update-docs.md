# /update-docs スキル

コード変更後に詳細設計書を最新の状態に同期するスキル。

## 実行手順

### ステップ1：変更内容の確認

```bash
git diff main --name-only
git diff main --stat
```

直近のコミットで変更されたファイルを確認し、影響する設計書の章を特定する。

### ステップ2：更新対象章の特定

以下の対応表に従って更新する設計書を特定する。

| 変更されたファイル | 更新する設計書 |
|---|---|
| DBスキーマファイル | `4_データベース設計.md` |
| APIルートファイル | `5_API設計.md` |
| 認証ミドルウェア・ルート | `6_認証・セキュリティ設計.md` |
| 画面コンポーネント・ビュー | `3_画面設計.md` |
| 型定義ファイル | `4_データベース設計.md` / `5_API設計.md` |
| 状態管理ストア | `7_共通仕様.md` |
| ビルド・デプロイ設定ファイル | `2_システム概要.md` |
| Excel入出力ロジック | `7_共通仕様.md` |
| テスト・CI設定 | `8_開発・運用.md` |

### ステップ3：設計書の更新

- 該当章を Read ツールで読み込み、コードの実装内容と照合する
- 差異がある箇所を正確に修正する
- コードに存在しない情報を設計書に書かない（推測で書かない）

### ステップ4：設計書のコミット・プッシュ

```bash
git add docs/詳細設計書/<対象ファイル>
git commit -m "docs: [更新内容の概要]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_XXXXXXXXXXXXXXXX"

git checkout main
git pull origin main
git merge <作業ブランチ名>
git push origin main
```

### ステップ5：完了報告

```
✅ 設計書更新完了
更新ファイル：[ファイル名]
更新内容：[変更の概要]

【mainブランチ最新コミット確認】
[git log origin/main --oneline -3 の出力]
```
