import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import auth from './routes/auth'
import recordsRouter from './routes/records'
import usersRouter from './routes/users'

export const config = { runtime: 'nodejs20.x' }

const app = new Hono().basePath('/api')

app.use('*', cors({
  origin: process.env.BASE_URL || 'http://localhost:5173',
  credentials: true,
}))

app.route('/auth', auth)
app.route('/records', recordsRouter)
app.route('/users', usersRouter)

export default handle(app)
