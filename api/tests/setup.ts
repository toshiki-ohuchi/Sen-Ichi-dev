import { beforeAll, afterAll, afterEach } from 'vitest'
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

  await db.insert(users).values([
    { email: TEST_ADMIN.email, passwordHash: adminHash, name: TEST_ADMIN.name, role: 'admin', isActive: true },
    { email: TEST_USER.email, passwordHash: userHash, name: TEST_USER.name, role: 'user', isActive: true },
  ])
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
