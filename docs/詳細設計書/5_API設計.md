# 5. API設計

## 5.1 共通仕様

| 項目 | 値 |
|---|---|
| ベースURL | `/api` |
| データ形式 | JSON（`Content-Type: application/json`） |
| 文字コード | UTF-8 |
| 認証方式 | セッションCookie（`session_id`）。詳細は6章参照 |
| CORS | `BASE_URL` 環境変数で指定したオリジンのみ許可（credentials: true） |

### 共通エラーレスポンス形式

```json
{ "error": "エラー種別", "message": "ユーザー向けメッセージ" }
```

### HTTPステータスコード

| ステータス | 意味 |
|---|---|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエスト不正（バリデーションエラー等） |
| 401 | 未認証（セッションなし・期限切れ） |
| 403 | 権限不足（ロール不足・アカウント無効） |
| 404 | リソース未存在 |
| 409 | 競合（楽観的ロック違反・メール重複） |
| 423 | アカウントロック中 |

---

## 5.2 認証API（認証不要）

### POST /api/auth/login

ログイン処理。成功時にセッションCookieを発行します。

**リクエストBody**
```json
{
  "email": "user@sas-com.com",
  "password": "password123"
}
```

**レスポンス（200 OK）**
```json
{
  "email": "user@sas-com.com",
  "name": "山田 太郎",
  "role": "user"
}
```

**エラーレスポンス一覧**

| ステータス | error | 説明 |
|---|---|---|
| 400 | - | email または password が未入力 |
| 401 | - | 「メールアドレスまたはパスワードが正しくありません。」 |
| 403 | - | 「このアカウントは無効です。管理者にお問い合わせください。」 |
| 423 | - | 「アカウントがロックされています。N分後に再試行してください。」 |

---

### POST /api/auth/logout

セッションを無効化します。

**リクエストBody：** なし（Cookieを参照）

**レスポンス（200 OK）**
```json
{ "ok": true }
```

---

### GET /api/auth/me

現在のログイン状態を確認します。

**レスポンス（200 OK）— ログイン中**
```json
{
  "email": "user@sas-com.com",
  "name": "山田 太郎",
  "role": "user"
}
```

**レスポンス（200 OK）— 未ログイン・セッション期限切れ**
```json
null
```

---

## 5.3 レコードAPI（認証必須）

### GET /api/records

レコード一覧を取得します。フィルタ・ソート・ページネーションに対応。

**クエリパラメータ**

| パラメータ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `q` | string | `''` | 顧客名・案件名の部分一致検索（大文字小文字区別なし） |
| `assignedDept` | string | `''` | 担当部署フィルタ（完全一致） |
| `commercialFlow` | string | `''` | 商流フィルタ（完全一致） |
| `contractType` | string | `''` | 契約形態フィルタ（完全一致） |
| `customerGrade` | string | `''` | 客先グレードフィルタ（完全一致） |
| `sortKey` | string | `'no'` | ソートキー（下記参照） |
| `sortDir` | string | `'asc'` | ソート方向（`asc` / `desc`） |
| `page` | integer | `1` | ページ番号（1始まり） |
| `pageSize` | integer | `20` | 1ページあたりの件数 |

**有効なソートキー**

`no` / `customerName` / `revenue` / `itPartnerRatio` / `sasRatio` / `memberCount` / `avgUnitPrice` / `updatedAt`

※ 無効なキーを指定した場合は `no` にフォールバック

**レスポンス（200 OK）**
```json
{
  "data": [ /* SalesRecord[] (todosとschedulesは含まない) */ ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

---

### GET /api/records/filters

フィルタ用のドロップダウン選択肢をDB上の実データから取得します。

**レスポンス（200 OK）**
```json
{
  "assignedDept": ["ITコンサルティング部", "サービス営業部"],
  "commercialFlow": ["1次", "2次"],
  "contractType": ["準委任", "請負・派遣"],
  "customerGrade": ["A", "B", "C"]
}
```

---

### GET /api/records/:id

指定IDのレコードをtodos・schedulesも含めて取得します。

**パスパラメータ：** `id`（整数）

**レスポンス（200 OK）**
```json
{
  "id": 1,
  "no": 1,
  "customerName": "株式会社サンプル",
  "version": 3,
  "...": "...",
  "todos": [
    {
      "id": 10,
      "recordId": 1,
      "agenda": "BP単価交渉",
      "assignee": "小山",
      "startDate": "2026-04-01",
      "endDate": "2026-04-30",
      "execDate": null,
      "result": "",
      "activityCheck": "進行中",
      "sortOrder": 0
    }
  ],
  "schedules": [
    {
      "id": 5,
      "recordId": 1,
      "month": "3月",
      "activityType": "顧客イベント",
      "content": "FY26 1Q\n【定例（3/12）】"
    }
  ]
}
```

**エラー：** `404 { "error": "Not found" }`

---

### POST /api/records

新規レコードを登録します。

**リクエストBody**
```json
{
  "customerName": "株式会社サンプル",
  "revenue": 5000,
  "...": "...",
  "todos": [
    {
      "agenda": "初回訪問",
      "assignee": "田中",
      "startDate": "2026-04-01",
      "endDate": "2026-04-15",
      "execDate": null,
      "result": "",
      "activityCheck": "未着手"
    }
  ],
  "schedules": [
    {
      "month": "3月",
      "activityType": "顧客イベント",
      "content": "FY26 1Q"
    }
  ]
}
```

**サーバー側の自動設定項目**

| フィールド | 設定値 |
|---|---|
| `no` | `MAX(no) + 1`（既存の最大値+1で自動採番） |
| `version` | `1`（固定） |
| `createdBy` | セッションのユーザーメールアドレス |
| `updatedBy` | セッションのユーザーメールアドレス |

**バリデーション**

| フィールド | ルール | エラー |
|---|---|---|
| `customerName` | 必須・空文字不可 | `400 { "error": "customerName is required" }` |

**レスポンス（201 Created）**

作成されたレコード（todos・schedules除く）

---

### PUT /api/records/:id

レコードを更新します。楽観的ロックにより競合を検出します。

**パスパラメータ：** `id`（整数）

**リクエストBody**
```json
{
  "customerName": "株式会社サンプル（更新）",
  "version": 3,
  "...": "...",
  "todos": [ /* 全件（replace方式）*/ ],
  "schedules": [ /* 全件（upsert方式）*/ ]
}
```

**楽観的ロックの動作**

| 状況 | 動作 |
|---|---|
| `body.version == DB.version` | 更新実行。DBの `version` を `+1` してインクリメント |
| `body.version != DB.version` | `409 Conflict` を返却。更新しない |

**todos更新方式：** 既存todosを全件DELETEしてから再INSERT（replace方式）

**schedules更新方式：** Upsert（ON CONFLICT DO UPDATE）。`content` が空文字のレコードも保存される

**自動更新項目**

| フィールド | 設定値 |
|---|---|
| `version` | `clientVersion + 1` |
| `updatedAt` | `new Date()`（現在日時） |
| `updatedBy` | セッションのユーザーメールアドレス |

**レスポンス（200 OK）：** 更新後のレコード

**エラー一覧**

| ステータス | 内容 |
|---|---|
| 404 | 指定IDのレコードが存在しない |
| 409 | `{ "error": "conflict", "message": "他のユーザーがこのレコードを更新しました。画面を更新してください。" }` |

---

### DELETE /api/records/:id

指定IDのレコードを削除します（関連するtodos・monthly_schedulesもCASCADE削除）。

**レスポンス（200 OK）**
```json
{ "ok": true }
```

---

## 5.4 ユーザー管理API（認証必須 + adminロール限定）

adminロール以外のユーザーがアクセスした場合、`403 { "error": "管理者権限が必要です。" }` を返します。

---

### GET /api/users

ユーザー一覧を取得します（作成日時昇順）。

**レスポンス（200 OK）**
```json
[
  {
    "id": 1,
    "email": "admin@sas-com.com",
    "name": "システム管理者",
    "role": "admin",
    "isActive": true,
    "failedLoginCount": 0,
    "lockedUntil": null,
    "lastLoginAt": "2026-07-09T10:00:00.000Z",
    "createdAt": "2026-04-01T00:00:00.000Z",
    "createdBy": null
  }
]
```

※ `passwordHash` はレスポンスに含まれません

---

### POST /api/users

新規ユーザーを登録します。

**リクエストBody**
```json
{
  "email": "newuser@sas-com.com",
  "name": "新規 ユーザー",
  "password": "Pass1234",
  "role": "user"
}
```

**バリデーションルール**

| 項目 | ルール |
|---|---|
| email | 必須。`@sas-com.com` ドメインのみ許可 |
| name | 必須 |
| password | 必須。8文字以上・英字含む・数字含む |
| role | `'admin'` または `'user'` のみ |

**レスポンス（201 Created）**
```json
{
  "id": 5,
  "email": "newuser@sas-com.com",
  "name": "新規 ユーザー",
  "role": "user",
  "isActive": true,
  "createdAt": "2026-07-09T10:00:00.000Z"
}
```

**エラー**

| ステータス | 内容 |
|---|---|
| 400 | バリデーションエラー（詳細メッセージ含む） |
| 409 | 「このメールアドレスはすでに登録されています。」 |

---

### PUT /api/users/:id

ユーザー情報（氏名・権限・有効/無効）を更新します。

**リクエストBody（部分更新可）**
```json
{
  "name": "更新 太郎",
  "role": "admin",
  "isActive": false
}
```

**レスポンス（200 OK）**
```json
{
  "id": 5,
  "email": "user@sas-com.com",
  "name": "更新 太郎",
  "role": "admin",
  "isActive": false
}
```

**エラー：** `400`（無効なrole）/ `404`（ユーザー未存在）

---

### PUT /api/users/:id/password

パスワードを強制変更します（ロック状態も同時にリセット）。

**リクエストBody**
```json
{ "password": "NewPass99" }
```

**処理内容**
1. パスワードポリシーチェック（8文字以上・英字・数字）
2. `bcrypt.hash(password, 10)` でハッシュ化
3. `failedLoginCount=0`・`lockedUntil=null` にリセット

**レスポンス（200 OK）**
```json
{ "ok": true, "email": "user@sas-com.com" }
```

---

### PUT /api/users/:id/unlock

アカウントロックを手動解除します。

**処理内容：** `failedLoginCount=0`・`lockedUntil=null` にリセット

**レスポンス（200 OK）**
```json
{ "ok": true }
```

---

### DELETE /api/users/:id

ユーザーを削除します。

**制約：** 操作者自身のアカウントは削除不可（`400 { "error": "自分自身は削除できません。" }`）

**レスポンス（200 OK）**
```json
{ "ok": true }
```
