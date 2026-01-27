## 1. Project Setup

- [x] 1.1 Add dependencies to package.json (hono, @hono/zod-validator, zod)
- [x] 1.2 Add test script to package.json (`"test": "bun test"`)

## 2. Server Infrastructure

- [x] 2.1 Create Hono app instance in index.ts
- [x] 2.2 Implement error handling middleware with console.error()
- [x] 2.3 Implement not-found handler for undefined routes

## 3. Healthcheck Endpoint

- [x] 3.1 Define Zod schema for healthcheck response
- [x] 3.2 Create GET /healthcheck route with zValidator
- [x] 3.3 Return `{"message": "OK"}` on successful request

## 4. Graceful Shutdown

- [x] 4.1 Implement shutdown signal handlers (SIGTERM, SIGINT) with signal counter
- [x] 4.2 First signal: call server.stop() and wait for graceful completion
- [x] 4.3 Second signal: call server.stop(true) to force immediate stop
- [x] 4.4 Log shutdown messages for both graceful and force modes
- [x] 4.5 Return server instance with stop() method from startServer function

## 5. Integration Testing (Real Server)

- [x] 5.1 Create index.test.ts with bun:test framework
- [x] 5.2 Import the real server from index.ts (import { startServer } from './index.ts')
- [x] 5.3 Implement beforeAll hook to start the real server on port 3001
- [x] 5.4 Implement afterAll hook to stop the real server
- [x] 5.5 Write integration test for GET /healthcheck on port 3001 (status 200, correct body)
- [x] 5.6 Write integration test for undefined route on port 3001 (404 status)
- [x] 5.7 Write integration test for graceful shutdown (server.stop() completes successfully)

## 6. Verification

- [x] 6.1 Run `bun test` and ensure all tests pass
- [x] 6.2 Run `tsc --noEmit` and verify no type errors
- [x] 6.3 Start server with `bun run index.ts` and manually test /healthcheck
