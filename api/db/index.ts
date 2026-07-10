import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL!
const sql = neon(dbUrl)
export const db = drizzle(sql, { schema })
