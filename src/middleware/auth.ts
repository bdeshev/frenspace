import { createMiddleware } from 'hono/factory'
import { getAuth } from '../lib/auth.ts'

export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    const auth = await getAuth()
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session) {
      // Redirect to login page
      return c.redirect('/login', 302)
    }

    c.set('user', session.user)
    await next()
  } catch (error) {
    console.error('❌ Auth middleware error:')
    console.error('   Error type:', typeof error)
    console.error('   Error constructor:', error?.constructor?.name)
    
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
      
      // Log any additional properties on the error object
      const errorObj = error as unknown as Record<string, unknown>
      for (const key of Object.keys(errorObj)) {
        if (key !== 'message' && key !== 'stack') {
          try {
            console.error(`   ${key}:`, JSON.stringify(errorObj[key]))
          } catch {
            console.error(`   ${key}: [Unable to serialize]`)
          }
        }
      }
    } else {
      console.error(`   Unknown error type:`, error)
      try {
        console.error(`   Stringified: ${JSON.stringify(error)}`)
      } catch {
        console.error(`   Unable to stringify error`)
      }
    }
    
    return c.json({ 
      error: 'Authentication error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error?.constructor?.name || typeof error
    }, 500)
  }
})
