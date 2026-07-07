import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { db } from '../db'
import { users, sessions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

const auth = new Hono()

const SESSION_DAYS = 7
const MAX_FAILED = 5
const LOCK_MINUTES = 15

// POST /api/auth/login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  if (!email || !password) {
    return c.json({ error: 'メールアドレスとパスワードを入力してください。' }, 400)
  }

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

  // タイミング攻撃対策：ユーザー不在でもハッシュ比較を実行
  const dummyHash = '$2a$10$dummyhashfordummycomparison00000000000000000'
  const hashToCompare = user ? user.passwordHash : dummyHash

  // アカウントロック確認
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
    return c.json({ error: `アカウントがロックされています。${remaining}分後に再試行してください。` }, 423)
  }

  const isValid = await bcrypt.compare(password, hashToCompare)

  if (!user || !isValid) {
    if (user) {
      const newCount = user.failedLoginCount + 1
      const shouldLock = newCount >= MAX_FAILED
      await db.update(users).set({
        failedLoginCount: newCount,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
        updatedAt: new Date(),
      }).where(eq(users.id, user.id))
      if (shouldLock) {
        return c.json({ error: `ログイン失敗が${MAX_FAILED}回を超えました。${LOCK_MINUTES}分間ロックされます。` }, 423)
      }
    }
    return c.json({ error: 'メールアドレスまたはパスワードが正しくありません。' }, 401)
  }

  if (!user.isActive) {
    return c.json({ error: 'このアカウントは無効化されています。管理者にお問い合わせください。' }, 403)
  }

  // ログイン成功
  await db.update(users).set({
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(users.id, user.id))

  const sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await db.insert(sessions).values({
    id: sessionId,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    expiresAt,
  })

  setCookie(c, 'session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  })

  return c.json({ email: user.email, name: user.name, role: user.role })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    deleteCookie(c, 'session_id', { path: '/' })
  }
  return c.json({ ok: true })
})

// GET /api/auth/me
auth.get('/me', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  if (!sessionId) return c.json(null)
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
  if (!session || session.expiresAt < new Date()) return c.json(null)
  return c.json({ email: session.userEmail, name: session.userName, role: session.userRole })
})

export default auth
