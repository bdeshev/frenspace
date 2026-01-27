## Why

Establish the foundational HTTP service infrastructure to serve a mixed workload of web pages, static scripts, and API endpoints. Starting with a healthcheck endpoint provides immediate operational readiness while enabling iterative expansion of functionality.

## What Changes

- Create Hono-based HTTP server on port 3000
- Implement `GET /healthcheck` endpoint returning `{"message": "OK"}`
- Add request/response type validation using Zod
- Implement error handling middleware with logging
- Add graceful shutdown support (first signal stops accepting and waits, second signal forces immediate stop)
- Return server instance for programmatic control
- Set up integration test framework with `bun:test`

## Capabilities

### New Capabilities
- `http-server`: Core HTTP service infrastructure with healthcheck endpoint, error handling, logging, and graceful shutdown

### Modified Capabilities
(None)

## Impact

**Dependencies:**
- Add `hono`
- Add `@hono/zod-validator`
- Add `zod`

**Files:**
- New: `index.ts` - server implementation
- New: `index.test.ts` - integration tests
- Modify: `package.json` - add dependencies and test script

**Code:**
- No existing code modified (green field project)
