import { Database } from 'bun:sqlite'
import { existsSync, mkdirSync, chmodSync } from 'node:fs'
import { dirname } from 'node:path'
import { env } from './env.ts'

const dbPath = env.DATABASE_URL
const isMemoryDb = dbPath === ':memory:'

if (!isMemoryDb) {
  const dir = dirname(dbPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 })
  }
}

export const db = new Database(dbPath)

if (!isMemoryDb) {
  chmodSync(dbPath, 0o600)
  console.log(`✓ Database connected: ${dbPath}`)
} else {
  console.log('✓ Database connected: :memory:')
}
