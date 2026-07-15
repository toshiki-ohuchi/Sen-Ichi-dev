/**
 * 初期ユーザーを本番DBに登録するシードスクリプト
 * 実行方法: npx tsx api/scripts/seed.ts
 * 前提: DATABASE_URL 環境変数が設定されていること
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema.js'
import bcrypt from 'bcryptjs'

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL が設定されていません。')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 登録するユーザーをここに記載する
// パスワードは8文字以上・英字＋数字を含むこと
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const INITIAL_USERS = [
  {
    email: 'ohuchi@sas-com.com',
    password: 'TempPass1',   // ← ログイン後に変更すること
    name: '大内',
    role: 'admin' as const,
  },
]

async function seed() {
  console.log('🌱 初期ユーザーの登録を開始します...')

  for (const user of INITIAL_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10)
    await db.insert(schema.users)
      .values({
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          passwordHash,
          name: user.name,
          role: user.role,
          isActive: true,
          failedLoginCount: 0,
          lockedUntil: null,
        },
      })
    console.log(`  ✅ ${user.email} (${user.role}) を登録しました`)
  }

  console.log('\n✅ 完了しました。')
  console.log('⚠️  初期パスワード "TempPass1" は管理者画面から変更してください。')
}

seed().catch((err) => {
  console.error('❌ エラーが発生しました:', err)
  process.exit(1)
})
