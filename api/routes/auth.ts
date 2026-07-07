import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { db } from '../db'
import { sessions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'

const auth = new Hono()

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const BASE_URL = process.env.BASE_URL!
const ALLOWED_DOMAIN = 'sas-com.com'

auth.get('/google', (c) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${BASE_URL}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.redirect(`/?error=no_code`)

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${BASE_URL}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json() as { access_token: string; id_token: string }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const user = await userRes.json() as { email: string; name: string; picture: string }

    // Domain check
    if (!user.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return c.redirect(`/?error=domain_not_allowed`)
    }

    // Create session
    const sessionId = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userEmail: user.email,
      userName: user.name,
      userPicture: user.picture,
      expiresAt,
    })

    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      expires: expiresAt,
    })

    return c.redirect('/')
  } catch (e) {
    console.error('OAuth error:', e)
    return c.redirect(`/?error=oauth_failed`)
  }
})

auth.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    deleteCookie(c, 'session_id', { path: '/' })
  }
  return c.json({ ok: true })
})

auth.get('/me', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  if (!sessionId) return c.json(null)

  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
  if (!session || session.expiresAt < new Date()) return c.json(null)

  return c.json({ email: session.userEmail, name: session.userName, picture: session.userPicture })
})

export default auth
