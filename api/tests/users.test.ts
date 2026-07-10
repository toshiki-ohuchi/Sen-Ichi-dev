import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../server.js'
import { TEST_ADMIN, TEST_USER } from './setup.js'
import { login, authRequest } from './helpers.js'

let adminCookie: string
let userCookie: string

beforeEach(async () => {
  adminCookie = await login(TEST_ADMIN.email, TEST_ADMIN.password)
  userCookie = await login(TEST_USER.email, TEST_USER.password)
})

describe('GET /api/users', () => {
  it('管理者はユーザー一覧を取得できる', async () => {
    const res = await authRequest('GET', '/api/users', adminCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    // passwordHashがレスポンスに含まれないこと
    expect(body[0]).not.toHaveProperty('passwordHash')
  })

  it('一般ユーザーは403を返す', async () => {
    const res = await authRequest('GET', '/api/users', userCookie)
    expect(res.status).toBe(403)
  })

  it('未認証では401を返す', async () => {
    const res = await app.request('/api/users')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/users', () => {
  it('管理者は新規ユーザーを作成できる', async () => {
    const res = await authRequest('POST', '/api/users', adminCookie, {
      email: 'newtest@sas-com.com',
      name: '新規テスト',
      password: 'TestPass1',
      role: 'user',
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.email).toBe('newtest@sas-com.com')
  })

  it('@sas-com.com 以外のドメインは400を返す', async () => {
    const res = await authRequest('POST', '/api/users', adminCookie, {
      email: 'bad@gmail.com',
      name: '不正ユーザー',
      password: 'TestPass1',
      role: 'user',
    })
    expect(res.status).toBe(400)
  })

  it('パスワードポリシー違反（英字のみ）は400を返す', async () => {
    const res = await authRequest('POST', '/api/users', adminCookie, {
      email: 'policy@sas-com.com',
      name: 'ポリシーテスト',
      password: 'onlyletters',
      role: 'user',
    })
    expect(res.status).toBe(400)
  })

  it('メールアドレス重複は409を返す', async () => {
    const res = await authRequest('POST', '/api/users', adminCookie, {
      email: TEST_USER.email,
      name: '重複ユーザー',
      password: 'TestPass1',
      role: 'user',
    })
    expect(res.status).toBe(409)
  })
})

describe('PUT /api/users/:id/unlock', () => {
  it('管理者はアカウントロックを解除できる', async () => {
    // まずユーザーIDを取得
    const listRes = await authRequest('GET', '/api/users', adminCookie)
    const users = await listRes.json()
    const targetUser = users.find((u: any) => u.email === TEST_USER.email)

    const res = await authRequest('PUT', `/api/users/${targetUser.id}/unlock`, adminCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })
})

describe('PUT /api/users/:id/password', () => {
  it('管理者はパスワードをリセットできる', async () => {
    const listRes = await authRequest('GET', '/api/users', adminCookie)
    const users = await listRes.json()
    const targetUser = users.find((u: any) => u.email === TEST_USER.email)

    const res = await authRequest('PUT', `/api/users/${targetUser.id}/password`, adminCookie, {
      password: 'NewPass99',
    })
    expect(res.status).toBe(200)
    // パスワード変更後にログインできることを確認
    const loginRes = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_USER.email, password: 'NewPass99' }),
    })
    expect(loginRes.status).toBe(200)
  })
})
