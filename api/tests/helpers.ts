import { app } from '../server.js'

/** ログインしてセッションCookieを取得する */
export async function login(email: string, password: string): Promise<string> {
  const res = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const cookie = res.headers.get('set-cookie') ?? ''
  return cookie
}

/** 認証済みリクエストを送る */
export function authRequest(method: string, path: string, cookie: string, body?: unknown): Promise<Response> {
  return app.request(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

/** テスト用レコードのデフォルト値 */
export const sampleRecord = {
  customerName: 'テスト株式会社',
  revenue: 1000,
  todos: [],
  schedules: [],
}
