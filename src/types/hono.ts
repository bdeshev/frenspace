import type { AuthUser } from '../lib/auth.ts'

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}
