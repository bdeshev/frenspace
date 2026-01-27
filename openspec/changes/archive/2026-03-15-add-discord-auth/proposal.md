# Proposal: Add Discord Authentication

## Overview

Integrate Discord OAuth authentication using better-auth library with SQLite database storage for users and sessions.

## Goals

- Allow users to sign in via Discord OAuth
- Store user data (name, email, avatar) in SQLite database
- Use database-backed sessions for persistence
- Provide protected routes that require authentication
- Create a simple /home route displaying authenticated user info

## Non-Goals

- Multiple OAuth providers (Discord only for now)
- Custom user fields or profile data
- Role-based access control
- Email/password authentication
- Account linking between providers

## Scope

### In Scope

1. Better-auth integration with Discord provider
2. SQLite database setup with auto-migrations
3. Database-backed session management
4. Protected route middleware with redirect-to-login behavior
5. Environment variable configuration
6. /home protected route showing user info and avatar
7. Health check endpoint remains public

### Out of Scope

- User management admin panel
- Password reset flows
- Email verification (handled by Discord)
- Rate limiting on auth endpoints
- Session revocation UI

## Success Criteria

- [ ] User can click "Sign in with Discord" and complete OAuth flow
- [ ] User data persists in SQLite database after first login
- [ ] Session survives server restarts (database-backed)
- [ ] Unauthenticated requests to /home redirect to Discord login
- [ ] Authenticated requests to /home show "Hello {name}" with avatar
- [ ] Sign out clears session and redirects to public page

## Risks and Considerations

| Risk | Mitigation |
|------|------------|
| Discord OAuth app setup complexity | Provide clear setup instructions in README |
| Session secrets in env vars | Document BETTER_AUTH_SECRET generation |
| Database file permissions | Ensure ./data/ directory is writable |
| Redirect URL mismatch | Document exact callback URL format |

## Dependencies

- `better-auth` - Authentication framework
- `@better-auth/sqlite` or `bun:sqlite` adapter - Database connection
- Environment variables for Discord OAuth credentials

## Estimation

**Small change** - 2-3 hours implementation

## Artifacts to Create

1. `proposal.md` (this document) - Scope and goals
2. `design.md` - Architecture, data model, middleware design
3. `tasks.md` - Implementation steps
4. `specs/spec.md` - Capability specification with requirements

---

**References**:
- [Capability Spec](specs/spec.md) - Full requirements, user stories, and acceptance criteria

**Status**: Draft
**Created**: 2026-03-15
