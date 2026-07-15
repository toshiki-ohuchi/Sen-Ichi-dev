import { beforeAll, afterAll, afterEach } from 'vitest'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { inArray } from 'drizzle-orm'
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
// 【防御②】TEST_DATABASE_URL と DATABASE_URL が同一なら即座に中断
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (testDbUrl === process.env.DATABASE_URL) {
  throw new Error(
    '\n❌ TEST_DATABASE_URL と DATABASE_URL が同じ接続文字列です。\n' +
    '本番DBへの誤接続を防ぐためテストを中断しました。\n' +
    'TEST_DATABASE_URL には必ずテスト専用ブランチの接続文字列を設定してください。'
  )
}

// 防御①②を通過した場合のみ、テスト専用DBに接続する
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

beforeAll(async () => {
  await db.delete(monthlySchedules)
  await db.delete(todos)
  await db.delete(records)
  await db.delete(sessions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 【防御③】削除はテスト用アカウントのみに限定（全件削除しない）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
  await db.delete(monthlySchedules)
  await db.delete(todos)
  await db.delete(records)
  await db.delete(sessions)
})

afterAll(async () => {
  // テスト用アカウントのみ削除（全件削除しない）
  await db.delete(users).where(inArray(users.email, TEST_EMAILS))
})
