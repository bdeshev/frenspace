## Context

Green field Bun project with minimal TypeScript setup. The project currently has no HTTP infrastructure, logging, or testing framework. This change establishes foundational patterns for future expansion into a mixed HTTP service (web pages, static scripts, API endpoints).

**Constraints:**
- Must use Bun runtime
- TypeScript strict mode enabled
- Single entry point at index.ts
- Output to dist/ directory ignored by git

## Goals / Non-Goals

**Goals:**
- Create production-ready HTTP server infrastructure with healthcheck endpoint
- Establish patterns for error handling, logging, and graceful shutdown
- Set up integration testing framework for future endpoints
- Enable iterative expansion (web pages, scripts, additional APIs)

**Non-Goals:**
- Authentication/authorization (future work)
- CORS configuration (will add later)
- Static file serving (not yet, mentioned as future capability)
- Database integration (not needed for healthcheck)
- Multiple routes beyond /healthcheck
- Production deployment configuration

## Decisions

### Framework Choice: Hono over Express/Fastify
**Decision:** Use Hono framework

**Rationale:**
- Native TypeScript support with excellent type inference
- Lightweight and fast (matches Bun's performance goals)
- Built-in middleware ecosystem
- Modern API design with async/await patterns
- Active development and Bun compatibility

**Alternatives Considered:**
- Express: Most mature but heavier, less TypeScript-native
- Fastify: Performant but more complex configuration overhead
- Bun.serve directly: Too manual for expanding to mixed workload

### Logging Approach: console.log/console.error over dedicated logger
**Decision:** Use Bun's built-in structured logging

**Rationale:**
- Zero dependencies
- Structured by default (JSON in production, formatted in dev)
- Sufficient for current needs
- Can upgrade to Pino later if needed

**Alternatives Considered:**
- Pino: Production-grade but extra dependency and complexity
- Winston: Heavyweight, more complexity than needed
- Manual console wrappers: Unnecessary abstraction

### Graceful Shutdown Pattern: Signal Counter with Force Fallback
**Decision:** First signal initiates graceful shutdown, second signal forces immediate stop

**Rationale:**
- Exit immediately when requests complete (no artificial wait)
- Manual force stop via second signal for stuck requests
- Testable (can await shutdown function)
- Uses Bun.serve's built-in Promise-based stop() method
- Common pattern: first Ctrl+C = graceful, second Ctrl+C = force

**Implementation:**
```typescript
let shutdownRequested = false

process.on('SIGTERM', async () => {
  if (shutdownRequested) {
    // Second signal: force immediate stop
    console.log('Force stopping...')
    await server.stop(true)
  }

  // First signal: graceful shutdown
  shutdownRequested = true
  console.log('Shutting down... (press Ctrl+C again to force)')

  // Stop accepting new requests and wait for in-flight requests
  await server.stop()

  console.log('Shutdown complete')
})
```

**Alternatives Considered:**
- process.exit(0): Anti-pattern, kills process abruptly
- Timeout-based force stop: Forces stop after fixed time, even if requests would complete soon
- server.stop() only: No way to stop immediately if requests hang forever
- Event emitters: More complex than needed

### Validation: Zod + @hono/zod-validator
**Decision:** Zod schemas with Hono middleware integration

**Rationale:**
- Type-safe validation at runtime
- Clear error messages
- Seamless Hono integration via middleware
- Can be reused for request/response schemas

**Implementation:**
- Request validation: `zValidator('json', schema)` or `zValidator('query', schema)`
- Response validation: `zValidator('response', schema)`
- Middleware catches errors before route handler

**Alternatives Considered:**
- Manual validation: Repetitive, error-prone
- class-validator: More verbose, less type inference
- ajv: Lower-level, more complex API

### Test Framework: bun:test
**Decision:** Use Bun's built-in test framework

**Rationale:**
- Already part of runtime (zero dependency)
- Familiar Jest-like API (expect().toBe())
- Built-in test runner
- Good TypeScript support

**Implementation Pattern:**
- beforeAll: Start server, capture port
- test: fetch request, validate response
- afterAll: server.stop()

**Alternatives Considered:**
- Vitest: Full-featured but extra dependency
- Jest: Bun-compatible but heavier
- Mocha/Chai: More setup required

### Error Handling Strategy: Global middleware
**Decision:** Catch-all error middleware in Hono

**Rationale:**
- Single point of error logging
- Consistent error responses
- Prevents unhandled rejections from crashing server

**Implementation:**
- Middleware catches all errors in request chain
- Logs error with console.error()
- Returns JSON `{error: string}` with status 500

### Port Binding: Fixed port 3000 (3001 for tests)
**Decision:** Hardcode port 3000 for production, 3001 for tests

**Rationale:**
- Simplest approach for first iteration
- Matches common development convention
- Tests use separate port to avoid conflicts
- Can make configurable via env vars later

**Alternatives Considered:**
- Port 0 (random): More complex testing setup
- Environment variable: Overkill for MVP
- Port detection: Premature optimization

## Risks / Trade-offs

### Risk: Port 3000 already in use
**Mitigation:** Document requirement to check port availability. Will add configurable port via env var in future iteration.

### Risk: In-flight requests hanging indefinitely
**Mitigation:** Second signal (press Ctrl+C twice) calls `server.stop(true)` to force immediate stop. For long-running operations, consider adding connection draining or request timeout in endpoints.

### Trade-off: Fixed port vs dynamic allocation
**Trade-off:** Fixed port (3000) is simpler but may conflict. Dynamic port (0) avoids conflicts but requires port discovery for testing and client communication.
**Decision:** Fixed port for now. Will make configurable if conflicts arise.

### Trade-off: Minimal logging vs production-grade
**Trade-off:** console.log/console.error is sufficient but lacks features like log levels, transports, sampling.
**Decision:** Start simple. Upgrade to Pino if needed for production.

### Risk: Zod validation errors breaking API contracts
**Mitigation:** Validate response schemas early. Integration tests catch contract violations. Schema evolution will be careful not to break clients.
