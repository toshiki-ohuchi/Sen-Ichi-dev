import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../server.js'
import { TEST_ADMIN, TEST_USER } from './setup.js'
import { login, authRequest, sampleRecord } from './helpers.js'

let adminCookie: string
let userCookie: string

beforeEach(async () => {
  adminCookie = await login(TEST_ADMIN.email, TEST_ADMIN.password)
  userCookie = await login(TEST_USER.email, TEST_USER.password)
})

describe('GET /api/records', () => {
  it('認証済みユーザーはレコード一覧を取得できる', async () => {
    const res = await authRequest('GET', '/api/records', userCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('total')
  })

  it('未認証では401を返す', async () => {
    const res = await app.request('/api/records')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/records', () => {
  it('新規レコードを作成できる', async () => {
    const res = await authRequest('POST', '/api/records', userCookie, sampleRecord)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.customerName).toBe(sampleRecord.customerName)
    expect(body.version).toBe(1)
    expect(body.no).toBeTypeOf('number')
  })

  it('顧客名なしは400を返す', async () => {
    const res = await authRequest('POST', '/api/records', userCookie, { ...sampleRecord, customerName: '' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/records/:id', () => {
  it('指定IDのレコードを取得できる', async () => {
    const createRes = await authRequest('POST', '/api/records', userCookie, sampleRecord)
    const created = await createRes.json()

    const res = await authRequest('GET', `/api/records/${created.id}`, userCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(created.id)
    expect(body).toHaveProperty('todos')
    expect(body).toHaveProperty('schedules')
  })

  it('存在しないIDは404を返す', async () => {
    const res = await authRequest('GET', '/api/records/999999', userCookie)
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/records/:id（楽観的ロック）', () => {
  it('正しいversionで更新できる', async () => {
    const createRes = await authRequest('POST', '/api/records', userCookie, sampleRecord)
    const created = await createRes.json()

    const res = await authRequest('PUT', `/api/records/${created.id}`, userCookie, {
      ...sampleRecord,
      customerName: '更新後株式会社',
      version: created.version,
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.customerName).toBe('更新後株式会社')
    expect(body.version).toBe(created.version + 1)
  })

  it('versionが不一致の場合は409を返す（楽観的ロック）', async () => {
    const createRes = await authRequest('POST', '/api/records', userCookie, sampleRecord)
    const created = await createRes.json()

    const res = await authRequest('PUT', `/api/records/${created.id}`, userCookie, {
      ...sampleRecord,
      version: 999, // 不正なversion
    })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('conflict')
  })
})

describe('DELETE /api/records/:id', () => {
  it('レコードを削除できる', async () => {
    const createRes = await authRequest('POST', '/api/records', userCookie, sampleRecord)
    const created = await createRes.json()

    const res = await authRequest('DELETE', `/api/records/${created.id}`, userCookie)
    expect(res.status).toBe(200)

    const getRes = await authRequest('GET', `/api/records/${created.id}`, userCookie)
    expect(getRes.status).toBe(404)
  })
})

describe('GET /api/records/filters', () => {
  it('フィルタ選択肢を取得できる', async () => {
    const res = await authRequest('GET', '/api/records/filters', userCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('assignedDept')
    expect(body).toHaveProperty('commercialFlow')
    expect(body).toHaveProperty('contractType')
    expect(body).toHaveProperty('customerGrade')
  })
})
