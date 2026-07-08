import { Hono } from 'hono'
import { db } from '../db/index.js'
import { records, todos, monthlySchedules } from '../db/schema.js'
import { eq, ilike, and, or, desc, asc, sql, max } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth.js'
import type { Variables } from '../types.js'
// xlsx はフロントエンド側でのみ使用

const recordsRouter = new Hono<{ Variables: Variables }>()
recordsRouter.use('*', authMiddleware)

// GET /api/records - list with search/filter
recordsRouter.get('/', async (c) => {
  const q = c.req.query('q') || ''
  const assignedDept = c.req.query('assignedDept') || ''
  const commercialFlow = c.req.query('commercialFlow') || ''
  const contractType = c.req.query('contractType') || ''
  const customerGrade = c.req.query('customerGrade') || ''
  const sortKey = c.req.query('sortKey') || 'no'
  const sortDir = c.req.query('sortDir') || 'asc'
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '20')

  const conditions = []
  if (q) conditions.push(or(ilike(records.customerName, `%${q}%`), ilike(records.projectName, `%${q}%`)))
  if (assignedDept) conditions.push(eq(records.assignedDept, assignedDept))
  if (commercialFlow) conditions.push(eq(records.commercialFlow, commercialFlow))
  if (contractType) conditions.push(eq(records.contractType, contractType))
  if (customerGrade) conditions.push(eq(records.customerGrade, customerGrade))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const validSortKeys: Record<string, any> = {
    no: records.no,
    customerName: records.customerName,
    revenue: records.revenue,
    itPartnerRatio: records.itPartnerRatio,
    sasRatio: records.sasRatio,
    memberCount: records.memberCount,
    avgUnitPrice: records.avgUnitPrice,
    updatedAt: records.updatedAt,
  }
  const sortCol = validSortKeys[sortKey] || records.no
  const orderFn = sortDir === 'desc' ? desc(sortCol) : asc(sortCol)

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(records).where(where)
  const data = await db.select().from(records).where(where).orderBy(orderFn).limit(pageSize).offset((page - 1) * pageSize)

  return c.json({ data, total: Number(count), page, pageSize })
})

// GET /api/records/filters - get distinct filter values
recordsRouter.get('/filters', async (c) => {
  const cols = ['assignedDept', 'commercialFlow', 'contractType', 'customerGrade'] as const
  const result: Record<string, string[]> = {}
  for (const col of cols) {
    const rows = await db.selectDistinct({ val: records[col] }).from(records).orderBy(asc(records[col]))
    result[col] = rows.map(r => r.val).filter(Boolean) as string[]
  }
  return c.json(result)
})

// GET /api/records/:id - get full record with todos and schedules
recordsRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const [record] = await db.select().from(records).where(eq(records.id, id)).limit(1)
  if (!record) return c.json({ error: 'Not found' }, 404)

  const todoList = await db.select().from(todos).where(eq(todos.recordId, id)).orderBy(asc(todos.sortOrder))
  const scheduleList = await db.select().from(monthlySchedules).where(eq(monthlySchedules.recordId, id))

  return c.json({ ...record, todos: todoList, schedules: scheduleList })
})

// POST /api/records
recordsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const userEmail = c.get('userEmail')
  const { todos: todoItems = [], schedules = [], ...recordData } = body

  const [{ maxNo }] = await db.select({ maxNo: max(records.no) }).from(records)
  const nextNo = (maxNo ?? 0) + 1

  const [inserted] = await db.insert(records).values({
    ...recordData,
    no: nextNo,
    version: 1,
    createdBy: userEmail,
    updatedBy: userEmail,
  }).returning()

  if (todoItems.length > 0) {
    await db.insert(todos).values(todoItems.map((t: any, i: number) => ({ ...t, recordId: inserted.id, sortOrder: i })))
  }
  for (const s of schedules) {
    if (s.content) {
      await db.insert(monthlySchedules).values({ recordId: inserted.id, month: s.month, activityType: s.activityType, content: s.content })
        .onConflictDoUpdate({ target: [monthlySchedules.recordId, monthlySchedules.month, monthlySchedules.activityType], set: { content: s.content } })
    }
  }

  return c.json(inserted, 201)
})

// PUT /api/records/:id - update with optimistic lock
recordsRouter.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const userEmail = c.get('userEmail')
  const { todos: todoItems, schedules, version: clientVersion, createdAt, updatedAt, createdBy, updatedBy, ...recordData } = body

  const [current] = await db.select({ version: records.version }).from(records).where(eq(records.id, id)).limit(1)
  if (!current) return c.json({ error: 'Not found' }, 404)
  if (current.version !== clientVersion) {
    return c.json({ error: 'conflict', message: '他のユーザーがこのレコードを更新しました。画面を更新してください。' }, 409)
  }

  const [updated] = await db.update(records).set({
    ...recordData,
    version: clientVersion + 1,
    updatedAt: new Date(),
    updatedBy: userEmail,
  }).where(eq(records.id, id)).returning()

  // Replace todos
  if (todoItems !== undefined) {
    await db.delete(todos).where(eq(todos.recordId, id))
    if (todoItems.length > 0) {
      await db.insert(todos).values(todoItems.map((t: any, i: number) => ({ ...t, id: undefined, recordId: id, sortOrder: i })))
    }
  }

  // Upsert schedules
  if (schedules !== undefined) {
    for (const s of schedules) {
      await db.insert(monthlySchedules).values({ recordId: id, month: s.month, activityType: s.activityType, content: s.content || '' })
        .onConflictDoUpdate({ target: [monthlySchedules.recordId, monthlySchedules.month, monthlySchedules.activityType], set: { content: s.content || '' } })
    }
  }

  return c.json(updated)
})

// DELETE /api/records/:id
recordsRouter.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  await db.delete(records).where(eq(records.id, id))
  return c.json({ ok: true })
})

export default recordsRouter
