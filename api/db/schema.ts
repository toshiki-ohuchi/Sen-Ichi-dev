import { pgTable, serial, integer, varchar, decimal, text, timestamp, date, uniqueIndex, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const records = pgTable('records', {
  id: serial('id').primaryKey(),
  no: integer('no'),
  newSort: varchar('new_sort', { length: 50 }),
  customerName: varchar('customer_name', { length: 200 }).notNull(),
  revenue: decimal('revenue', { precision: 15, scale: 2 }),
  itInvestment: decimal('it_investment', { precision: 15, scale: 2 }),
  itPartnerRatio: decimal('it_partner_ratio', { precision: 5, scale: 2 }),
  sasRatio: decimal('sas_ratio', { precision: 5, scale: 2 }),
  contractRegulation: text('contract_regulation'),
  department: varchar('department', { length: 200 }),
  location: varchar('location', { length: 200 }),
  businessDirector: text('business_director'),
  operationDirector: text('operation_director'),
  siteDirector: text('site_director'),
  projectName: varchar('project_name', { length: 200 }),
  projectTotal: integer('project_total'),
  endUserOrgChart: text('end_user_org_chart'),
  commercialFlow: varchar('commercial_flow', { length: 200 }),
  contractType: varchar('contract_type', { length: 200 }),
  members: text('members'),
  memberCount: integer('member_count'),
  avgUnitPrice: decimal('avg_unit_price', { precision: 15, scale: 2 }),
  assignedDept: varchar('assigned_dept', { length: 200 }),
  customerGrade: varchar('customer_grade', { length: 50 }),
  priceTableRequired: varchar('price_table_required', { length: 10 }),
  priceTableDate: date('price_table_date'),
  priceTableVer: varchar('price_table_ver', { length: 50 }),
  overworkRequired: varchar('overwork_required', { length: 10 }),
  overworkDate: date('overwork_date'),
  overworkVer: varchar('overwork_ver', { length: 50 }),
  salesStatus: text('sales_status'),
  planTarget: text('plan_target'),
  projectConcept: text('project_concept'),
  fiscalYear: integer('fiscal_year').default(2026),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: varchar('created_by', { length: 200 }),
  updatedBy: varchar('updated_by', { length: 200 }),
})

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  recordId: integer('record_id').references(() => records.id, { onDelete: 'cascade' }).notNull(),
  agenda: text('agenda'),
  assignee: varchar('assignee', { length: 200 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  execDate: date('exec_date'),
  result: text('result'),
  activityCheck: varchar('activity_check', { length: 50 }),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

export const monthlySchedules = pgTable('monthly_schedules', {
  id: serial('id').primaryKey(),
  recordId: integer('record_id').references(() => records.id, { onDelete: 'cascade' }).notNull(),
  month: varchar('month', { length: 10 }).notNull(),
  activityType: varchar('activity_type', { length: 100 }).notNull(),
  content: text('content'),
}, (table) => ({
  uniqueIdx: uniqueIndex('monthly_schedules_unique').on(table.recordId, table.month, table.activityType),
}))

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 200 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'admin' | 'user'
  isActive: boolean('is_active').notNull().default(true),
  failedLoginCount: integer('failed_login_count').notNull().default(0),
  lockedUntil: timestamp('locked_until'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: varchar('created_by', { length: 200 }),
})

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 100 }).primaryKey(),
  userEmail: varchar('user_email', { length: 200 }).notNull(),
  userName: varchar('user_name', { length: 200 }),
  userRole: varchar('user_role', { length: 20 }).default('user'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const recordsRelations = relations(records, ({ many }) => ({
  todos: many(todos),
  schedules: many(monthlySchedules),
}))

export const todosRelations = relations(todos, ({ one }) => ({
  record: one(records, { fields: [todos.recordId], references: [records.id] }),
}))

export const schedulesRelations = relations(monthlySchedules, ({ one }) => ({
  record: one(records, { fields: [monthlySchedules.recordId], references: [records.id] }),
}))
