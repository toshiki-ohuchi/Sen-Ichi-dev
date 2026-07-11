# 新規プロジェクト セットアップ プロンプト

> **使い方**：新規プロジェクトのリポジトリで Claude Code を開き、このファイルの「## 実行プロンプト」の内容をそのままチャットに貼り付けて実行する。

---

## 実行プロンプト

以下を新規プロジェクトのリポジトリで実行してください。

---

新規プロジェクトのセットアップを行います。以下の質問に答えてください。回答が集まり次第、`CLAUDE.md` と `.claude/commands/` 配下のスキルファイルを自動で生成します。

**【質問1】プロジェクト基本情報**
- プロジェクト名（システム名）：
- 年度（例：FY2026）：
- プロジェクトの概要（1〜2行）：

**【質問2】技術スタック**
- フロントエンド（例：Vue 3、React 18）：
- バックエンド（例：Hono、Express、Next.js API Routes）：
- ORM（例：Drizzle ORM、Prisma）：
- データベース（例：Neon PostgreSQL、PlanetScale、Supabase）：
- ホスティング（例：Vercel、Railway、Render）：
- テストフレームワーク（例：Vitest、Jest）：
- Node.js バージョン（例：20）：

**【質問3】ディレクトリ構成**
- フロントエンドのソースディレクトリ（例：src/）：
- APIのソースディレクトリ（例：api/）：
- DBスキーマファイルのパス（例：api/db/schema.ts）：
- APIルートファイルのディレクトリ（例：api/routes/）：
- テストファイルのディレクトリ（例：api/tests/）：

**【質問4】テスト環境**
- テスト用DB環境変数名（例：TEST_DATABASE_URL）：
- テスト実行コマンド（例：npm run test）：
- DBスキーマ適用コマンド（例：npm run db:push）：

**【質問5】重要な実装仕様**（該当するものを選択・追記）
- 楽観的ロック：あり / なし（あり の場合、管理フィールド名：）
- 認証方式：セッションCookie / JWT / その他（　　）
- 採番方式：MAX+1サーバー採番 / DB自動採番 / その他（　　）
- Excel入出力：あり / なし
- その他の特記事項：

---

上記の回答をもとに、`docs/templates/CLAUDE.md` のプレースホルダーをすべて埋めた形で **プロジェクトルートに `CLAUDE.md` を生成**してください。また、`.claude/commands/` 配下に以下のスキルファイルもあわせて生成してください。

- `update-docs.md`
- `self-check.md`
- `release-check.md`
- `test-run.md`

生成後、以下を確認・報告してください。

1. 生成した `CLAUDE.md` の全文をプレビュー表示する
2. プレースホルダーが残っていないことを確認する
3. `docs/詳細設計書/` ディレクトリが存在しない場合は、以下の空ファイルを作成する：
   - `1_ドキュメント概要.md`
   - `2_システム概要.md`
   - `3_画面設計.md`
   - `4_データベース設計.md`
   - `5_API設計.md`
   - `6_認証・セキュリティ設計.md`
   - `7_共通仕様.md`
   - `8_開発・運用.md`
4. すべてのファイルを `main` ブランチにコミット・プッシュする

---

## テンプレートの参照先

| ファイル | パス |
|---|---|
| CLAUDE.md テンプレート | `docs/templates/CLAUDE.md` |
| update-docs スキル | `docs/templates/.claude/commands/update-docs.md` |
| self-check スキル | `docs/templates/.claude/commands/self-check.md` |
| release-check スキル | `docs/templates/.claude/commands/release-check.md` |
| test-run スキル | `docs/templates/.claude/commands/test-run.md` |

> **注意**：テンプレートファイルはコピー元として使用する。`docs/templates/` 配下のファイルは編集しない。
