import { beforeAll, afterAll, afterEach } from 'vitest'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { inArray, like, or } from 'drizzle-orm'
import * as schema from '../db/schema.js'
import { users, sessions, records, todos, monthlySchedules } from '../db/schema.js'
import bcrypt from 'bcryptjs'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 【防御①】TEST_DATABASE_URL 未設定なら即座に中断
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const testDbUrl = process.env.TEST_DATABASE_URL
if (!testDbUrl) {
  throw new Error(
    '\n❌ TEST_DATABASE_URL が設定されていません。\n' +
    '本番DBへの誤接続を防ぐためテストを中断しました。\n' +
    'ローカルで実行する場合は .env.test に TEST_DATABASE_URL を設定してください。'
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 【防御②】TEST_DATABASE_URL と DATABASE_URL が同じホストを指していたら中断
//   文字列一致だけでなくホスト名レベルで比較（クエリパラメータの差異を無視）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function extractHost(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}
const testHost = extractHost(testDbUrl)
const prodUrl = process.env.DATABASE_URL
if (prodUrl) {
  const prodHost = extractHost(prodUrl)
  if (testHost === prodHost) {
    throw new Error(
      '\n❌ TEST_DATABASE_URL と DATABASE_URL が同じDBホストを指しています。\n' +
      '本番DBへの誤接続を防ぐためテストを中断しました。\n' +
      'TEST_DATABASE_URL には必ずテスト専用ブランチの接続文字列を設定してください。'
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 【防御③】CI環境では DATABASE_URL が必ず設定されていること
//   CI（GitHub Actions）では DATABASE_URL シークレットが未設定だと防御②が機能しない
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (process.env.CI && !prodUrl) {
  throw new Error(
    '\n❌ CI 環境で DATABASE_URL が設定されていません。\n' +
    'GitHub Actions の Secrets に DATABASE_URL（本番DB接続文字列）を追加し、\n' +
    'test.yml の env セクションに DATABASE_URL: ${{ secrets.DATABASE_URL }} を追加してください。\n' +
    'これにより TEST_DATABASE_URL と本番DBの同一性チェックが正しく機能します。'
  )
}

// 防御を通過した場合のみ、テスト専用DBに接続する
const sql = neon(testDbUrl)
export const db = drizzle(sql, { schema })

export const TEST_ADMIN = {
  email: 'testadmin@sas-com.com',
  password: 'TestPass1',
  name: 'テスト管理者',
  role: 'admin' as const,
}

export const TEST_USER = {
  email: 'testuser@sas-com.com',
  password: 'TestPass1',
  name: 'テストユーザー',
  role: 'user' as const,
}

const TEST_EMAILS = [TEST_ADMIN.email, TEST_USER.email]

// テストレコードを識別するプレフィックス（本番データと区別するため）
export const TEST_RECORD_PREFIX = '[TEST]'

beforeAll(async () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 【防御④】テストデータのみ削除（全件削除しない）
  //   records/todos/monthlySchedules は [TEST] プレフィックス付きのみ削除
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const testRecords = await db
    .select({ id: records.id })
    .from(records)
    .where(like(records.customerName, `${TEST_RECORD_PREFIX}%`))
  if (testRecords.length > 0) {
    const testRecordIds = testRecords.map(r => r.id)
    await db.delete(monthlySchedules).where(inArray(monthlySchedules.recordId, testRecordIds))
    await db.delete(todos).where(inArray(todos.recordId, testRecordIds))
    await db.delete(records).where(inArray(records.id, testRecordIds))
  }
  await db.delete(sessions).where(inArray(sessions.userId,
    (await db.select({ id: users.id }).from(users).where(inArray(users.email, TEST_EMAILS))).map(u => u.id)
  ))
  await db.delete(users).where(inArray(users.email, TEST_EMAILS))

  const adminHash = await bcrypt.hash(TEST_ADMIN.password, 10)
  const userHash = await bcrypt.hash(TEST_USER.password, 10)

  await db.insert(users)
    .values({ email: TEST_ADMIN.email, passwordHash: adminHash, name: TEST_ADMIN.name, role: 'admin', isActive: true })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: adminHash, name: TEST_ADMIN.name, role: 'admin', isActive: true, failedLoginCount: 0, lockedUntil: null },
    })
  await db.insert(users)
    .values({ email: TEST_USER.email, passwordHash: userHash, name: TEST_USER.name, role: 'user', isActive: true })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: userHash, name: TEST_USER.name, role: 'user', isActive: true, failedLoginCount: 0, lockedUntil: null },
    })
})

afterEach(async () => {
  // [TEST] プレフィックス付きレコードのみ削除
  const testRecords = await db
    .select({ id: records.id })
    .from(records)
    .where(like(records.customerName, `${TEST_RECORD_PREFIX}%`))
  if (testRecords.length > 0) {
    const testRecordIds = testRecords.map(r => r.id)
    await db.delete(monthlySchedules).where(inArray(monthlySchedules.recordId, testRecordIds))
    await db.delete(todos).where(inArray(todos.recordId, testRecordIds))
    await db.delete(records).where(inArray(records.id, testRecordIds))
  }
  await db.delete(sessions).where(inArray(sessions.userId,
    (await db.select({ id: users.id }).from(users).where(inArray(users.email, TEST_EMAILS))).map(u => u.id)
  ))
})

afterAll(async () => {
  // テスト用アカウントのみ削除（全件削除しない）
  await db.delete(users).where(inArray(users.email, TEST_EMAILS))
})
