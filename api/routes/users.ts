import { Hono } from 'hono'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq, asc } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth.js'
import bcrypt from 'bcryptjs'
import type { Variables } from '../types.js'

const usersRouter = new Hono<{ Variables: Variables }>()
usersRouter.use('*', authMiddleware)

// 管理者のみ許可するミドルウェア
usersRouter.use('*', async (c, next) => {
  if (c.get('userRole') !== 'admin') {
    return c.json({ error: '管理者権限が必要です。' }, 403)
  }
  await next()
})

const PASSWORD_MIN = 8
const ALLOWED_DOMAIN = 'sas-com.com'

function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN) return `パスワードは${PASSWORD_MIN}文字以上で設定してください。`
  if (!/[a-zA-Z]/.test(pw)) return 'パスワードにはアルファベットを含めてください。'
  if (!/[0-9]/.test(pw)) return 'パスワードには数字を含めてください。'
  return null
}

// GET /api/users - ユーザー一覧
usersRouter.get('/', async (c) => {
  const list = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      failedLoginCount: users.failedLoginCount,
      lockedUntil: users.lockedUntil,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      createdBy: users.createdBy,
    })
    .from(users)
    .orderBy(asc(users.createdAt))
  return c.json(list)
})

// POST /api/users - ユーザー新規登録
usersRouter.post('/', async (c) => {
  const { email, name, password, role } = await c.req.json<{
    email: string; name: string; password: string; role: string
  }>()
  const adminEmail = c.get('userEmail')

  if (!email || !name || !password) {
    return c.json({ error: 'メールアドレス・氏名・パスワードは必須です。' }, 400)
  }
  if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    return c.json({ error: `メールアドレスは @${ALLOWED_DOMAIN} のみ登録できます。` }, 400)
  }
  const pwError = validatePassword(password)
  if (pwError) return c.json({ error: pwError }, 400)
  if (!['admin', 'user'].includes(role)) {
    return c.json({ error: '権限は admin または user を指定してください。' }, 400)
  }

  const [existing] = await db.select({ id: users.id }).from(users)
    .where(eq(users.email, email.toLowerCase())).limit(1)
  if (existing) return c.json({ error: 'このメールアドレスはすでに登録されています。' }, 409)

  const passwordHash = await bcrypt.hash(password, 10)
  const [inserted] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
    role,
    isActive: true,
    createdBy: adminEmail,
  }).returning({
    id: users.id, email: users.email, name: users.name,
    role: users.role, isActive: users.isActive, createdAt: users.createdAt,
  })

  return c.json(inserted, 201)
})

// PUT /api/users/:id - ユーザー情報更新（氏名・権限・有効/無効）
usersRouter.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { name, role, isActive } = await c.req.json<{
    name?: string; role?: string; isActive?: boolean
  }>()

  const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
  if (name !== undefined) updateData.name = name
  if (role !== undefined) {
    if (!['admin', 'user'].includes(role)) return c.json({ error: '無効な権限です。' }, 400)
    updateData.role = role
  }
  if (isActive !== undefined) updateData.isActive = isActive

  const [updated] = await db.update(users).set(updateData).where(eq(users.id, id))
    .returning({
      id: users.id, email: users.email, name: users.name,
      role: users.role, isActive: users.isActive,
    })

  if (!updated) return c.json({ error: 'ユーザーが見つかりません。' }, 404)
  return c.json(updated)
})

// PUT /api/users/:id/password - パスワードリセット（管理者による強制変更）
usersRouter.put('/:id/password', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { password } = await c.req.json<{ password: string }>()

  const pwError = validatePassword(password)
  if (pwError) return c.json({ error: pwError }, 400)

  const passwordHash = await bcrypt.hash(password, 10)
  const [updated] = await db.update(users).set({
    passwordHash,
    failedLoginCount: 0,
    lockedUntil: null,
    updatedAt: new Date(),
  }).where(eq(users.id, id)).returning({ id: users.id, email: users.email })

  if (!updated) return c.json({ error: 'ユーザーが見つかりません。' }, 404)
  return c.json({ ok: true, email: updated.email })
})

// PUT /api/users/:id/unlock - アカウントロック解除
usersRouter.put('/:id/unlock', async (c) => {
  const id = parseInt(c.req.param('id'))
  await db.update(users).set({
    failedLoginCount: 0,
    lockedUntil: null,
    updatedAt: new Date(),
  }).where(eq(users.id, id))
  return c.json({ ok: true })
})

// DELETE /api/users/:id - ユーザー削除
usersRouter.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const adminEmail = c.get('userEmail')

  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, id)).limit(1)
  if (target?.email === adminEmail) {
    return c.json({ error: '自分自身を削除することはできません。' }, 400)
  }

  await db.delete(users).where(eq(users.id, id))
  return c.json({ ok: true })
})

export default usersRouter
