import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth.js'
import recordsRouter from './routes/records.js'
import usersRouter from './routes/users.js'
import type { Variables } from './types.js'

const app = new Hono<{ Variables: Variables }>().basePath('/api')

app.use('*', cors({
  origin: process.env.BASE_URL || 'http://localhost:5173',
  credentials: true,
}))

app.route('/auth', auth)
app.route('/records', recordsRouter)
app.route('/users', usersRouter)

export default app.fetch
