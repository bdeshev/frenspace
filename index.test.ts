import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { startServer } from './index.ts'

describe('HTTP Server Integration Tests', () => {
  let server: Awaited<ReturnType<typeof startServer>>
  const port = 3001

  beforeAll(async () => {
    server = await startServer(port)
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should return 200 with correct body on GET /healthcheck', async () => {
    const response = await fetch(`http://localhost:${port}/healthcheck`)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ message: 'OK' })
  })

  it('should return 404 for undefined routes', async () => {
    const response = await fetch(`http://localhost:${port}/undefined-route`)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('should handle graceful shutdown successfully', async () => {
    const result = await server.stop()
    expect(result).toBeUndefined()
  })
})
