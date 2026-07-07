/**
 * 初回管理者アカウント作成スクリプト
 *
 * 使用方法:
 *   DATABASE_URL=postgresql://... npx tsx scripts/create-admin.ts
 *
 * 環境変数 DATABASE_URL が設定されている必要があります。
 * .env ファイルがある場合は自動で読み込まれます。
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { users } from '../api/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'

// .env ファイルを手動読み込み（dotenv 不要）
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL が設定されていません。')
  console.error('   .env ファイルに DATABASE_URL を記述するか、環境変数として設定してください。')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema: { users } })

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string): Promise<string> => new Promise(resolve => rl.question(q, resolve))

async function main() {
  console.log('\n========================================')
  console.log('  管理者アカウント作成スクリプト')
  console.log('========================================\n')

  const name = (await ask('氏名を入力してください: ')).trim()
  const email = (await ask('メールアドレス (@sas-com.com): ')).trim().toLowerCase()
  const password = (await ask('パスワード（8文字以上・英数字混在）: ')).trim()
  rl.close()

  // バリデーション
  if (!name) { console.error('❌ 氏名を入力してください。'); process.exit(1) }
  if (!email.endsWith('@sas-com.com')) { console.error('❌ @sas-com.com のメールアドレスを入力してください。'); process.exit(1) }
  if (password.length < 8) { console.error('❌ パスワードは8文字以上で設定してください。'); process.exit(1) }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    console.error('❌ パスワードには英字と数字を両方含めてください。')
    process.exit(1)
  }

  // 重複チェック
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    console.error(`❌ ${email} はすでに登録されています。`)
    process.exit(1)
  }

  // 作成
  const passwordHash = await bcrypt.hash(password, 10)
  const [created] = await db.insert(users).values({
    email,
    passwordHash,
    name,
    role: 'admin',
    isActive: true,
    createdBy: 'system',
  }).returning({ id: users.id, email: users.email, name: users.name, role: users.role })

  console.log('\n✅ 管理者アカウントを作成しました。')
  console.log(`   ID    : ${created.id}`)
  console.log(`   氏名  : ${created.name}`)
  console.log(`   メール: ${created.email}`)
  console.log(`   権限  : ${created.role}`)
  console.log('\nこのアカウントでログインし、ユーザー管理画面から追加のユーザーを登録できます。\n')
}

main().catch(err => {
  console.error('❌ エラーが発生しました:', err.message)
  process.exit(1)
})
