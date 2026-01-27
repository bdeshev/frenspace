import { betterAuth } from 'better-auth'
import { Database } from 'bun:sqlite'
import { resolve, dirname } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { env } from '../src/lib/env.ts'

async function runMigrations() {
  console.log('🗄️  Running better-auth database migrations...')
  console.log(`   DATABASE_URL: ${env.DATABASE_URL}`)

  // Resolve database path
  let dbPath = env.DATABASE_URL
  if (dbPath !== ':memory:' && !dbPath.startsWith('/')) {
    dbPath = resolve(process.cwd(), dbPath)
  }

  // Ensure directory exists
  if (dbPath !== ':memory:') {
    const dbDir = dirname(dbPath)
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true, mode: 0o700 })
    }
  }

  // Create raw bun:sqlite Database instance
  // This enables better-auth's auto-detection and runMigrations
  const db = new Database(dbPath)

  // Create better-auth instance with raw Database
  const auth = betterAuth({
    database: db,
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL,
    socialProviders: {},
  })

  // Get context and run migrations
  // @ts-ignore - $context is a promise
  const context = await auth.$context
  
  // @ts-ignore - runMigrations is available when using raw Database
  if (context.runMigrations) {
    await context.runMigrations()
    console.log('✅ Database migrations completed successfully!')
  } else {
    console.error('❌ runMigrations not available')
    process.exit(1)
  }
  
  // Close the database connection
  db.close()
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('🎉 Database setup complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration error:', error)
    process.exit(1)
  })
