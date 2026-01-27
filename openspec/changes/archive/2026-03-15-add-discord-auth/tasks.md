# Tasks: Discord Authentication

## Prerequisites

- [ ] Create Discord application at https://discord.com/developers/applications
- [ ] Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
- [ ] Copy Client ID and Client Secret
- [ ] Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`

---

## Task 1: Install Dependencies

**Status**: ✅ Complete

```bash
bun add better-auth @better-auth/sqlite
```

**Acceptance Criteria**:
- [ ] better-auth appears in package.json dependencies
- [ ] @better-auth/sqlite appears in dependencies
- [ ] bun.lock updated

---

## Task 2: Create Environment Configuration

**Status**: ✅ Complete

**Files**:
- `src/lib/env.ts` - Zod schema for env validation
- `.env` - Local environment (gitignored)
- `.env.example` - Template (already exists)

**Acceptance Criteria**:
- [x] Env schema validates all required variables
- [x] Type-safe env export
- [x] Clear error messages for missing vars
- [x] .env.example present in repo

**Schema**:
```typescript
const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DATABASE_URL: z.string(),
  PORT: z.string().optional().default('3000'),
})
```

---

## Task 3: Setup Database Connection

**Status**: ✅ Complete

**File**: `src/lib/db.ts`

**Requirements**:
- Create SQLite connection using `bun:sqlite` or better-auth adapter
- Ensure ./data/ directory exists with proper permissions
- Database file should have 600 permissions (owner read/write only)
- Connection string from DATABASE_URL env var

**Acceptance Criteria**:
- [x] SQLite connection established
- [x] ./data/ directory created if not exists
- [x] Database file permissions set to 600
- [x] Connection string from DATABASE_URL env var
- [x] Export configured adapter for better-auth

---

## Task 4: Configure Better-Auth

**Status**: ✅ Complete

**File**: `src/lib/auth.ts`

**Requirements**:
- Discord provider with `identify` and `email` scopes
- SQLite adapter for database storage
- Database-backed sessions with 7-day expiry
- Secure cookie configuration:
  - HTTP-only
  - Secure flag in production
  - SameSite=Lax
- Callback URL derived from BETTER_AUTH_URL
- CSRF protection enabled

**Acceptance Criteria**:
- [x] Auth instance exports handler
- [x] Discord provider configured with env vars
- [x] OAuth scopes include `identify` and `email`
- [x] SQLite adapter connected
- [x] Session strategy set to "database"
- [x] Session expiry set to 7 days
- [x] Cookie settings: HTTP-only, Secure (prod), SameSite=Lax
- [x] Better-auth mounts at /api/auth/*
- [x] CSRF state validation enabled

---

## Task 5: Extend Hono Context Types

**Status**: ✅ Complete

**File**: `src/types/hono.ts` (or in `src/lib/auth.ts`)

**Requirements**:
- Extend Hono's ContextVariableMap to include `user` type
- Define User interface matching database schema

**Acceptance Criteria**:
- [x] User interface exported with fields: id, name, email, image
- [x] ContextVariableMap extended with `user: User`
- [x] TypeScript recognizes `c.get('user')` in handlers

---

## Task 6: Create Protected Route Middleware

**Status**: ✅ Complete

**File**: `src/middleware/auth.ts`

**Requirements**:
- Check session from request cookies/headers using better-auth API
- If no valid session: 302 redirect to `/api/auth/signin/discord`
- If valid session: resolve user from database, inject into context
- Handle session expiry correctly
- Use Hono's `createMiddleware`

**Acceptance Criteria**:
- [x] Middleware type-safe with Hono context
- [x] Validates session using better-auth getSession API
- [x] Redirects unauthenticated requests with 302
- [x] Redirects expired sessions to login
- [x] Injects user object: `{ id, name, email, image }` into context
- [x] Works with `app.use('/home', authMiddleware)`

---

## Task 7: Create /home Route

**Status**: ✅ Complete

**File**: `src/routes/home.ts`

**Requirements**:
- GET /home
- Protected by authMiddleware
- Renders HTML: "Hello {user.name}!" + avatar image
- Include sign out form

**Acceptance Criteria**:
- [x] Route handler gets user from `c.get('user')`
- [x] HTML response with proper doctype
- [x] Avatar image displayed (64x64)
- [x] Sign out form POSTs to /api/auth/signout
- [x] Returns 200 for authenticated users
- [x] Returns 302 redirect if accessed directly without middleware

**Example Response**:
```html
<!DOCTYPE html>
<html>
<head><title>Home - Frenspace</title></head>
<body>
  <h1>Hello Alice!</h1>
  <img src="https://cdn.discordapp.com/avatars/123/abc.png" width="64" height="64" />
  <form action="/api/auth/signout" method="POST">
    <button>Sign Out</button>
  </form>
</body>
</html>
```

---

## Task 8: Update Main Entry Point

**Status**: ✅ Complete

**File**: `index.ts`

**Changes**:
- Import auth handler
- Mount at /api/auth/*
- Import home route
- Mount at /home with authMiddleware

**Acceptance Criteria**:
- [x] /healthcheck still works (public)
- [x] /api/auth/* routes handled by better-auth
- [x] /home protected and shows user info
- [x] Server starts without errors

---

## Task 9: Update .gitignore

**Status**: ✅ Complete

**Additions**:
```
# Environment
.env

# Database
data/
*.db
*.db-journal

# Better-auth
.better-auth
```

---

## Task 10: Test Authentication Flow

**Status**: 🔲 Pending

### Functional Tests

1. **OAuth Flow**
   - Start server: `bun run index.ts`
   - Visit http://localhost:3000/home
   - Verify 302 redirect to Discord OAuth
   - Complete OAuth authorization
   - Verify redirect back to /home
   - Verify "Hello {name}!" displays with avatar

2. **Session Persistence**
   - Complete login
   - Stop and restart server
   - Refresh /home
   - Verify still logged in (session persisted in DB)

3. **Sign Out**
   - Click sign out button
   - Verify redirect to public page
   - Attempt to access /home
   - Verify redirect to login

4. **Direct Access Protection**
   - Clear cookies
   - Visit /home directly
   - Verify redirect to Discord login

### Security Tests

5. **Cookie Attributes** (check in browser dev tools)
   - Session cookie is HTTP-only
   - Secure flag set in production
   - SameSite=Lax attribute present

6. **Database Security**
   - Database file has 600 permissions
   - Cannot read database without proper permissions

7. **Session Expiry**
   - Session expires after 7 days
   - Expired session redirects to login

**Acceptance Criteria**:
- [ ] Full OAuth flow completes successfully
- [ ] User data appears in database (user, account, session tables)
- [ ] Session persists across server restart
- [ ] Sign out clears session and cookies
- [ ] Unauthenticated access redirects to login
- [ ] Session expires after 7 days
- [ ] Cookies have correct security attributes
- [ ] Database file has 600 permissions

---

## Task 11: Run Lint and Typecheck

**Status**: ✅ Complete

```bash
bun run lint
bun run typecheck
```

**Acceptance Criteria**:
- [x] No lint errors (warnings treated as errors)
- [x] No TypeScript errors
- [x] All strict mode checks pass

---

## Task 12: Update Documentation

**Status**: 🔲 Pending

**Files**:
- README.md - Add setup instructions
- env.example - Already created

**Add to README**:
- Discord app setup instructions
- Environment variable descriptions
- How to run locally
- Database location

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Install dependencies | 2 min |
| 2 | Environment config | 10 min |
| 3 | Database setup | 10 min |
| 4 | Better-auth config | 20 min |
| 5 | Extend Hono types | 10 min |
| 6 | Auth middleware | 20 min |
| 7 | /home route | 15 min |
| 8 | Update index.ts | 10 min |
| 9 | .gitignore | 5 min |
| 10 | Testing | 20 min |
| 11 | Lint/Typecheck | 5 min |
| 12 | Documentation | 10 min |
| **Total** | | **~2.5 hours** |

---

**References**:
- [Capability Spec](specs/spec.md) - Full requirements and user stories
- [proposal.md](proposal.md) - Scope and goals
- [design.md](design.md) - Technical design and architecture
