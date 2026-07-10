import { describe, it, expect } from 'vitest'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { app } from '../server.js'
import { TEST_ADMIN, TEST_USER } from './setup.js'
import { login } from './helpers.js'

describe('POST /api/auth/login', () => {
  it('正しい認証情報でログインできる', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_ADMIN.email, password: TEST_ADMIN.password }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.email).toBe(TEST_ADMIN.email)
    expect(body.role).toBe('admin')
    expect(res.headers.get('set-cookie')).toContain('session_id')
  })

  it('パスワードが誤っている場合は401を返す', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_ADMIN.email, password: 'wrongpassword' }),
    })
    expect(res.status).toBe(401)
  })

  it('存在しないメールアドレスは401を返す', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@sas-com.com', password: 'pass' }),
    })
    expect(res.status).toBe(401)
  })

  it('email・passwordが未入力の場合は400を返す', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    })
    expect(res.status).toBe(400)
  })

  it('無効化されたアカウントは403を返す', async () => {
    await db.update(users).set({ isActive: false }).where(eq(users.email, TEST_USER.email))
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
    })
    expect(res.status).toBe(403)
    // 後続テストのために戻す
    await db.update(users).set({ isActive: true }).where(eq(users.email, TEST_USER.email))
  })

  it('5回連続失敗でアカウントがロックされ423を返す', async () => {
    // 失敗を5回繰り返す
    for (let i = 0; i < 5; i++) {
      await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_USER.email, password: 'wrongpass' }),
      })
    }
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
    })
    expect(res.status).toBe(423)
    // ロック解除
    await db.update(users).set({ failedLoginCount: 0, lockedUntil: null }).where(eq(users.email, TEST_USER.email))
  })
})

describe('POST /api/auth/logout', () => {
  it('ログアウトでセッションが無効化される', async () => {
    const cookie = await login(TEST_ADMIN.email, TEST_ADMIN.password)
    const res = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: cookie },
    })
    expect(res.status).toBe(200)

    // ログアウト後は /me が null を返す
    const meRes = await app.request('/api/auth/me', {
      headers: { Cookie: cookie },
    })
    const me = await meRes.json()
    expect(me).toBeNull()
  })
})

describe('GET /api/auth/me', () => {
  it('ログイン中はユーザー情報を返す', async () => {
    const cookie = await login(TEST_ADMIN.email, TEST_ADMIN.password)
    const res = await app.request('/api/auth/me', {
      headers: { Cookie: cookie },
    })
    const body = await res.json()
    expect(body.email).toBe(TEST_ADMIN.email)
  })

  it('未ログイン時はnullを返す', async () => {
    const res = await app.request('/api/auth/me')
    const body = await res.json()
    expect(body).toBeNull()
  })
})
