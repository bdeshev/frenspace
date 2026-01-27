# Specification: Authentication System

## Capability: User Authentication

Provides user identity management through Discord OAuth integration.

## User Stories

### US-1: Sign In with Discord
As a user, I want to sign in using my Discord account so I don't need to create a new password.

**Acceptance Criteria**:
- Clicking "Sign in with Discord" redirects to Discord OAuth
- After authorization, I'm logged into the application
- My Discord username, email, and avatar are saved
- I can access protected pages after login

### US-2: Persistent Sessions
As a user, I want to stay logged in even if the server restarts.

**Acceptance Criteria**:
- Sessions are stored in the database
- Closing and reopening browser keeps me logged in (until expiry)
- Server restart doesn't log me out
- Sessions expire after reasonable time (default: 7 days)

### US-3: Sign Out
As a user, I want to sign out to protect my account on shared devices.

**Acceptance Criteria**:
- Clicking "Sign Out" clears my session
- I'm redirected to a public page
- I cannot access protected pages without logging in again

### US-4: Protected Content
As a user, I want certain pages to require login so my data stays private.

**Acceptance Criteria**:
- Unauthenticated requests to protected routes redirect to login
- Authenticated requests show personalized content
- My name and avatar appear on protected pages

## Functional Requirements

### FR-1: OAuth Provider
The system MUST support Discord as an OAuth provider.

**Details**:
- Use Discord OAuth2 API
- Request scopes: `identify`, `email`
- Handle OAuth callback at `/api/auth/callback/discord`
- Store Discord tokens securely

### FR-2: User Data
The system MUST store the following user information:

| Field | Source | Required |
|-------|--------|----------|
| id | Generated UUID | Yes |
| name | Discord username | Yes |
| email | Discord email | Yes |
| emailVerified | Discord (always true) | Yes |
| image | Discord avatar URL | Yes |
| createdAt | System timestamp | Yes |
| updatedAt | System timestamp | Yes |

### FR-3: Session Management
The system MUST use database-backed sessions:

| Attribute | Requirement |
|-----------|-------------|
| Storage | SQLite database |
| Token | Random 32+ character string |
| Expiry | 7 days from creation |
| Cookie | HTTP-only, Secure (prod), SameSite=Lax |

### FR-4: Authentication Middleware
The system MUST provide middleware for protected routes:

**Behavior**:
1. Extract session token from request (cookie or header)
2. Validate session against database
3. If valid: resolve user, attach to context, continue
4. If invalid: redirect to `/api/auth/signin/discord` with 302

### FR-5: Environment Configuration
The system MUST use environment variables:

```
BETTER_AUTH_SECRET      # JWT signing secret (32+ chars)
BETTER_AUTH_URL         # App base URL
DISCORD_CLIENT_ID       # Discord OAuth app ID
DISCORD_CLIENT_SECRET   # Discord OAuth secret
DATABASE_URL            # SQLite file path
```

## Non-Functional Requirements

### NFR-1: Security
- Secrets MUST NOT be committed to version control
- Session cookies MUST be HTTP-only
- OAuth state parameter MUST be validated
- Database file MUST have restrictive permissions (600)

### NFR-2: Performance
- Session lookup SHOULD complete in <10ms
- OAuth redirect SHOULD complete in <500ms

### NFR-3: Availability
- Auth endpoints MUST be available 99.9% of time
- Database MUST be backed up regularly

## API Endpoints

### Auth Endpoints (provided by better-auth)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/auth/signin/discord` | Start OAuth flow | No |
| GET | `/api/auth/callback/discord` | OAuth callback | No |
| GET | `/api/auth/session` | Get current session | No |
| POST | `/api/auth/signout` | Sign out | Yes |
| GET | `/api/auth/user` | Get current user | Yes |

### Application Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/home` | User dashboard | Yes |

## Error Handling

| Scenario | Response |
|----------|----------|
| Invalid session | 302 redirect to login |
| Expired session | 302 redirect to login |
| Discord OAuth denied | Error page with retry link |
| Missing env vars | Startup error, clear message |
| Database error | 500 error, log details |

## Constraints

1. **Single Provider**: Only Discord OAuth supported initially
2. **SQLite Only**: Database must be SQLite for simplicity
3. **No Passwords**: No email/password authentication
4. **No Roles**: All authenticated users have same permissions

## Future Enhancements (Out of Scope)

- Multiple OAuth providers (GitHub, Google)
- User preferences/settings
- Role-based access control
- Session management UI (view/revoke sessions)
- Magic link authentication

## Success Metrics

- OAuth flow completion rate >95%
- Session persistence across restarts: 100%
- Protected route unauthorized access: 0%
- Average login time <3 seconds
