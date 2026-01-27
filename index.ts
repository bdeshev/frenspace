import { Hono } from 'hono'
import { z } from 'zod'
import { env } from './src/lib/env.ts'
import { getAuth } from './src/lib/auth.ts'
import home from './src/routes/home.ts'
import login from './src/routes/login.ts'
import './src/types/hono.ts'

const app = new Hono()

const HealthcheckResponseSchema = z.object({
  message: z.literal('OK')
})

app.onError((err, c) => {
  console.error({ error: err.message, stack: err.stack })
  return c.json({ error: err.message }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

app.get('/healthcheck', (c) => {
  const data = HealthcheckResponseSchema.parse({ message: 'OK' })
  return c.json(data)
})

app.all('/api/auth/*', async (c) => {
  try {
    const auth = await getAuth()
    
    // Pass the request directly to better-auth
    // It will handle basePath stripping internally based on baseURL
    const response = await auth.handler(c.req.raw)
    return response
  } catch (error) {
    console.error('❌ Auth handler error:')
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
    } else {
      console.error(`   Unknown error: ${JSON.stringify(error)}`)
    }
    return c.json({ 
      error: 'Authentication handler error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

app.get('/', (c) => c.redirect('/home'))
app.route('/home', home)
app.route('/login', login)

function startServer(port: number = Number.parseInt(env.PORT)) {
  let shutdownRequested = false

  const server = Bun.serve({
    port,
    async fetch(req) {
      return app.fetch(req)
    },
  })

  const stop = async (force: boolean = false) => {
    if (force) {
      console.log('Force stopping...')
    } else {
      console.log('Shutting down... (press Ctrl+C again to force)')
    }
    await server.stop(force)
    if (!force) {
      console.log('Shutdown complete')
    }
  }

  const handleSignal = async (_signal: 'SIGTERM' | 'SIGINT') => {
    if (shutdownRequested) {
      await stop(true)
      return
    }

    shutdownRequested = true
    await stop()
  }

  process.on('SIGTERM', () => handleSignal('SIGTERM'))
  process.on('SIGINT', () => handleSignal('SIGINT'))

  console.log(`Server running on http://localhost:${port}`)

  return { stop }
}

export { startServer }

if (import.meta.main) {
  const { stop: _stop } = startServer()
}
