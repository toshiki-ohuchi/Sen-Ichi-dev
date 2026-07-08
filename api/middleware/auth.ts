import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { db } from '../db/index.js'
import { sessions } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { Variables } from '../types.js'

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const sessionId = getCookie(c, 'session_id')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (!session || session.expiresAt < new Date()) {
    return c.json({ error: 'Session expired' }, 401)
  }

  c.set('userEmail', session.userEmail)
  c.set('userName', session.userName ?? null)
  c.set('userRole', session.userRole ?? 'user')
  await next()
}
