# Design: Discord Authentication

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Hono Application                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ /healthcheck │  │ /api/auth/*  │  │      /home (protected)   │  │
│  │   (public)   │  │  (better-   │  │                          │  │
│  │              │  │    auth)     │  │  ┌──────────────────┐    │  │
│  └──────────────┘  └──────┬───────┘  │  │ Auth Middleware    │    │  │
│                           │          │  │ • Check session    │    │  │
│                           ▼          │  │ • Redirect if null │    │  │
│                  ┌─────────────────┐ │  │ • Resolve user     │    │  │
│                  │  Better-Auth    │ │  │ • Inject ctx.user  │    │  │
│                  │    Handler      │ │  └─────────┬──────────┘    │  │
│                  └────────┬────────┘ │            │               │  │
│                           │          │            ▼               │  │
│           ┌───────────────┼────────┐ │    ┌──────────────┐        │  │
│           ▼               ▼        ▼ │    │ Home Handler │        │  │
│    ┌──────────┐    ┌──────────┐     │ │    │ • ctx.get()  │        │  │
│    │ Discord  │    │  SQLite  │     │ │    │ • Render     │        │  │
│    │  OAuth   │    │ Database │     │ │    └──────────────┘        │  │
│    └──────────┘    └──────────┘     │ │                          │  │
│                                      │ └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

Better-auth automatically creates and manages these tables:

### user
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID v4 |
| name | TEXT | Discord username |
| email | TEXT UNIQUE | Discord email |
| emailVerified | BOOLEAN | Always true from Discord |
| image | TEXT | Discord avatar URL |
| createdAt | DATETIME | Auto timestamp |
| updatedAt | DATETIME | Auto timestamp |

### account
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | UUID v4 |
| userId | TEXT FK | References user.id |
| type | TEXT | "oauth" |
| provider | TEXT | "discord" |
| providerAccountId | TEXT | Discord user ID |
| access_token | TEXT | OAuth access token |
| expires_at | INTEGER | Token expiry unix timestamp |
| token_type | TEXT | "Bearer" |
| scope | TEXT | "identify email" |
| session_state | TEXT | OAuth state param |

### session
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Session token |
| userId | TEXT FK | References user.id |
| expiresAt | DATETIME | Session expiry |

## Configuration

### Environment Variables

```bash
# Better Auth
BETTER_AUTH_SECRET        # Random 32+ char secret for JWT
BETTER_AUTH_URL           # http://localhost:3000 (dev)

# Discord OAuth
DISCORD_CLIENT_ID         # From Discord Developer Portal
DISCORD_CLIENT_SECRET     # From Discord Developer Portal

# Database
DATABASE_URL              # ./data/frenspace.db
```

### Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Create New Application → Name it
3. OAuth2 → Redirects → Add: `http://localhost:3000/api/auth/callback/discord`
4. Copy Client ID and Client Secret to env vars

## Auth Flow

```
User visits /home
       │
       ▼
┌──────────────┐
│   Middleware  │
│  Check cookie │
└──────┬───────┘
       │
   ┌───┴───┐
   ▼       ▼
Valid   Invalid
 │         │
 │         ▼
 │   ┌────────────────────┐
 │   │ 302 Redirect to    │
 │   │ /api/auth/signin   │
 │   │ /discord           │
 │   └────────────────────┘
 │
 ▼
┌─────────────────┐
│ Resolve user    │
│ from session    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ctx.set('user') │
│ Continue to     │
│ handler         │
└─────────────────┘
```

## Protected Route Middleware

```typescript
// middleware/auth.ts
export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.redirect('/api/auth/signin/discord', 302)
  }

  c.set('user', session.user)
  await next()
})
```

## /home Route Response

```html
<!DOCTYPE html>
<html>
<head>
  <title>Home - Frenspace</title>
</head>
<body>
  <h1>Hello {user.name}!</h1>
  <img src="{user.image}" alt="Avatar" width="64" height="64" />
  <form action="/api/auth/signout" method="POST">
    <button type="submit">Sign Out</button>
  </form>
</body>
</html>
```

## File Structure

```
project/
├── data/
│   └── frenspace.db          # SQLite database (gitignored)
├── src/
│   ├── lib/
│   │   ├── env.ts            # Environment validation
│   │   ├── auth.ts           # Better-auth config
│   │   └── db.ts             # Database connection
│   ├── middleware/
│   │   └── auth.ts           # Protected route middleware
│   └── routes/
│       └── home.ts           # /home handler
├── env.example               # Template for env vars
└── index.ts                  # Main entry (updated)
```

## Dependencies

```json
{
  "dependencies": {
    "better-auth": "^1.0.0",
    "@better-auth/sqlite": "^1.0.0"
  }
}
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid session | Redirect to login |
| Database error | 500 error page |
| Discord OAuth error | Better-auth handles, shows error page |
| Missing env vars | Startup error with clear message |

## Security Considerations

1. **Session cookies**: HTTP-only, Secure in production, SameSite=Lax
2. **CSRF protection**: Better-auth includes state parameter validation
3. **Secrets**: Never commit to repo, use strong random values
4. **Database**: File permissions should restrict read access

---

**References**:
- [Capability Spec](specs/spec.md) - Full requirements and user stories
- [proposal.md](proposal.md) - Scope and goals
- [tasks.md](tasks.md) - Implementation steps
