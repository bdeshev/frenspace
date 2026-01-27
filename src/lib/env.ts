import { z } from 'zod'

const isTestEnvironment = process.env.ENVIRONMENT === 'test'

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
  DISCORD_CLIENT_SECRET: z.string().min(1, 'DISCORD_CLIENT_SECRET is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.string().optional().default('3000'),
})

const getEnvWithDefaults = () => {
  if (isTestEnvironment) {
    return {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'test-secret-key-that-is-32-chars-long',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? 'test-discord-client-id',
      DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ?? 'test-discord-client-secret',
      DATABASE_URL: process.env.DATABASE_URL ?? ':memory:',
      PORT: process.env.PORT ?? '3000',
    }
  }
  return process.env
}

const parsed = envSchema.safeParse(getEnvWithDefaults())

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
