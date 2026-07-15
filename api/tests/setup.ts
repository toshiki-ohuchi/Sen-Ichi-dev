import { beforeAll, afterAll, afterEach } from 'vitest'

// TEST_DATABASE_URL 未設定時は本番DBへの誤接続を防ぐため即座に中断する
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    '\n❌ TEST_DATABASE_URL が設定されていません。\n' +
    '本番DBへの誤接続を防ぐためテストを中断しました。\n' +
    'ローカルでテストを実行する場合は .env.test に TEST_DATABASE_URL を設定してください。\n' +
    '  例) TEST_DATABASE_URL=postgresql://...(Neonテストブランチの接続文字列)'
  )
}
import { db } from '../db/index.js'
import { users, sessions, records, todos, monthlySchedules } from '../db/schema.js'
import bcrypt from 'bcryptjs'

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

beforeAll(async () => {
  // テスト用ユーザーを初期化
  await db.delete(monthlySchedules)
  await db.delete(todos)
  await db.delete(records)
  await db.delete(sessions)
  await db.delete(users)

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
  // 各テスト後にレコード・セッションをクリア（ユーザーは保持）
  await db.delete(monthlySchedules)
  await db.delete(todos)
  await db.delete(records)
  await db.delete(sessions)
})

afterAll(async () => {
  await db.delete(users)
})
