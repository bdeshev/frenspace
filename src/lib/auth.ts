import { betterAuth } from 'better-auth'
import { kyselyAdapter } from '@better-auth/kysely-adapter'
import { Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import { Database } from 'bun:sqlite'
import { env } from './env.ts'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const isTestEnvironment = process.env.ENVIRONMENT === 'test'

export let db: Kysely<any>

async function createAuth() {
  console.log('🔧 Initializing better-auth...')
  console.log(`   DATABASE_URL: ${env.DATABASE_URL}`)
  console.log(`   BETTER_AUTH_URL: ${env.BETTER_AUTH_URL}`)
  console.log(`   Environment: ${isTestEnvironment ? 'test' : 'production'}`)

  // Resolve relative paths to absolute paths
  let dbPath = env.DATABASE_URL
  if (dbPath !== ':memory:' && !dbPath.startsWith('/')) {
    dbPath = resolve(process.cwd(), dbPath)
    console.log(`   Resolved to absolute path: ${dbPath}`)
  }

  // Ensure database directory exists
  if (dbPath !== ':memory:') {
    const dbDir = dirname(dbPath)
    if (!existsSync(dbDir)) {
      console.log(`   Creating database directory: ${dbDir}`)
      mkdirSync(dbDir, { recursive: true, mode: 0o700 })
    }
  }

  // Create Kysely instance with bun:sqlite
  console.log('🔌 Creating Kysely instance with bun:sqlite...')
  db = new Kysely({
    dialect: new BunSqliteDialect({
      database: new Database(dbPath),
    }),
  })
  console.log('✅ Kysely instance created')

  console.log('⚙️  Creating better-auth with kyselyAdapter...')
  
  const socialProviders = isTestEnvironment
    ? undefined
    : {
        discord: () => ({
          clientId: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
          redirectURI: `${env.BETTER_AUTH_URL}/callback/discord`,
        }),
      }
  
  const auth = betterAuth({
    database: kyselyAdapter(db, {
      type: 'sqlite',
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL,
    socialProviders,
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: false,
      },
    },
    cookieOptions: {
      httpOnly: true,
      secure: env.BETTER_AUTH_URL.startsWith('https'),
      sameSite: 'lax',
      path: '/',
    },
  })
  
  console.log('✅ betterAuth() returned successfully')
  
  // Force context initialization
  console.log('🔍 Force-loading auth context...')
  try {
    // @ts-ignore - $context is a promise
    const context = await auth.$context
    console.log('✅ Auth context loaded')
    if (context && typeof context === 'object') {
      const keys = Object.keys(context)
      console.log('📋 Context keys:', keys)
      // @ts-ignore
      if (context.adapter) {
        console.log('✅ Adapter is present in context')
      } else {
        console.log('❌ Adapter NOT present in context')
      }
      // @ts-ignore
      const discordProvider = context.socialProviders?.find?.(p => p.id === 'discord')
      if (discordProvider) {
        console.log('✅ Discord OAuth configured')
      }
    }
  } catch (ctxError) {
    console.error('❌ Failed to load auth context:')
    if (ctxError instanceof Error) {
      console.error('   Error:', ctxError.message)
      console.error('   Stack:', ctxError.stack)
    } else {
      console.error('   Unknown error:', ctxError)
    }
    throw ctxError
  }
  
  return auth
}

let authPromise: ReturnType<typeof createAuth> | undefined

export async function getAuth() {
  if (!authPromise) {
    authPromise = createAuth()
  }
  return authPromise
}

export const auth = new Proxy({} as Awaited<ReturnType<typeof createAuth>>, {
  get(_target, _prop) {
    throw new Error('Use getAuth() instead of importing auth directly')
  },
})

export type AuthType = Awaited<ReturnType<typeof createAuth>>
export type AuthSession = Awaited<ReturnType<AuthType['api']['getSession']>>
export type AuthUser = NonNullable<AuthSession>['user']
