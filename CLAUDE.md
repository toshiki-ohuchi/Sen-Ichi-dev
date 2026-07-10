# CLAUDE.md — Sen-Ichi プロジェクト指示書

## プロジェクト概要

「顧客別営業戦略一覧（Sen-Ichi）」FY2026  
技術スタック：Vue 3 + Hono + Drizzle ORM + Neon PostgreSQL + Vercel

---

## 変更実施後の必須ルール

コードに変更を加えてコミット・プッシュした後は、**以下の手順を必ず一連で実行すること。**  
ユーザーから明示的に省略を指示された場合を除き、省略しない。

### ステップ1：コード変更をコミット・プッシュ
- 変更内容を適切な粒度でコミットする
- `git push -u origin main` でプッシュする
- mainブランチへのプッシュにより **Vercel が自動デプロイ** される

### ステップ2：DBスキーマ変更の案内（該当する場合のみ）
- `api/db/schema.ts` を変更した場合は、以下をユーザーに案内する：
  ```
  DBスキーマを変更しました。ローカル環境で以下を実行してください：
  npm run db:push
  ```
- `db:push` はローカルの `DATABASE_URL` が必要なため、自動実行はしない

### ステップ3：詳細設計書の更新
- 変更内容に関係する `docs/詳細設計書/` の章を特定する
- 対象章の判定基準：

| 変更箇所 | 更新する設計書 |
|---|---|
| `api/db/schema.ts` | `4_データベース設計.md` |
| `api/routes/*.ts` | `5_API設計.md` |
| `api/middleware/auth.ts` | `6_認証・セキュリティ設計.md` |
| `api/routes/auth.ts` | `6_認証・セキュリティ設計.md` |
| `src/views/*.vue` / `src/components/**` | `3_画面設計.md` |
| `src/types/index.ts` | `4_データベース設計.md` / `5_API設計.md` |
| `src/stores/*.ts` | `7_共通仕様.md` |
| `vercel.json` / `package.json` | `2_システム概要.md` |
| Excel入出力ロジック | `7_共通仕様.md` |
| 認証・セキュリティロジック | `6_認証・セキュリティ設計.md` |

- 該当章の内容をコードの変更内容に正確に合わせて修正する
- 修正した設計書を **コードとは別のコミット** でプッシュする

### ステップ4：完了報告
- 実施した内容を以下の形式で報告する：
  ```
  ✅ コード変更：[変更の概要]
  ✅ Vercelデプロイ：mainプッシュにより自動実行
  ✅ 設計書更新：[更新したファイル名]
  （⚠️ DBスキーマ変更あり：npm run db:push を実行してください）
  ```

---

## コミットメッセージのルール

- コード変更：`feat:` / `fix:` / `refactor:` / `style:` 等のプレフィックスを使う
- 設計書更新：`docs:` プレフィックスを使う
- 必ず Co-Authored-By を含める：
  ```
  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_015bmpGMC6yDxuiKBUyaPs7H
  ```

---

## ドキュメント構成

```
docs/
├── architecture.html        # システム構成図
└── 詳細設計書/
    ├── 1_ドキュメント概要.md
    ├── 2_システム概要.md
    ├── 3_画面設計.md
    ├── 4_データベース設計.md
    ├── 5_API設計.md
    ├── 6_認証・セキュリティ設計.md
    ├── 7_共通仕様.md
    └── 8_開発・運用.md
```

---

## 重要な実装仕様（変更時の注意点）

- **楽観的ロック**：`records.version` フィールドで管理。PUT時に `version` 不一致 → 409
- **セッション認証**：`sessions` テーブルで管理。Cookie名 `session_id`（httpOnly・7日間）
- **No自動採番**：`MAX(no) + 1` でサーバー側が採番。フロントから送らない
- **スケジュール保存**：Upsert（ON CONFLICT DO UPDATE）方式
- **TODO保存**：全DELETE → 全INSERT（replace方式）
- **契約形態**：複数選択を「・」区切りで1文字列に格納
- **セレクトボックス**：null/空文字の扱いは `:value="field ?? ''"` + `@change` パターン
- **modal-body**：`overflow-x: hidden` 必須（CSS sticky の横固定のため）
