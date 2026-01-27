## Context

This is a minimal Bun + TypeScript project with:
- Type checking via `tsc --noEmit`
- Testing via `bun test`
- **No linting** currently configured

The codebase uses:
- Hono web framework
- Zod for validation
- Strict TypeScript mode enabled

Quality gates run manually today. This design adds automated guardrails that block commits/merges when quality standards aren't met.

## Goals / Non-Goals

**Goals:**
- Integrate oxlint as the project linter
- Configure strict lint mode (warnings treated as errors)
- Update AGENTS.md with lint commands and agent responsibilities
- Add package.json scripts for linting
- Establish the three-gate quality system: typecheck → test → lint

**Non-Goals:**
- Custom lint rule configuration (use oxlint zero-config defaults)
- React/JSX specific lint rules
- Pre-commit hooks or automated fixing
- Linting during watch/dev mode
- Migration from existing linter (none exists)

## Decisions

### 1. Use oxlint zero-config defaults
**Rationale:** Oxlint is designed to work without configuration. Adding a config file would add complexity without clear benefit for a minimal project.

**Alternatives considered:**
- ESLint + typescript-eslint: More configurable but slower, requires plugin ecosystem
- Biome: Good alternative but oxlint has better Bun ecosystem alignment (VoidZero/Rolldown connection)

### 2. Strict mode: `--deny-warnings` flag
**Rationale:** The proposal requires strictest possible enforcement. Treating warnings as errors ensures no quality debt accumulates.

**Trade-off:** May require occasional `// oxlint-ignore` comments for edge cases.

### 3. AGENTS.md pattern: Command reference + explicit rule
**Rationale:** Agents need both the commands to run AND a policy statement that requires regular lint execution.

Structure:
```markdown
## Build & Test
- Lint: `bun run lint`
- Lint (fix): `bun run lint:fix`

## Rules
- MUST run lint before committing changes
- MUST run lint:fix when lint issues are auto-fixable
```

### 4. Package.json scripts
```json
{
  "scripts": {
    "lint": "oxlint . --deny-warnings",
    "lint:fix": "oxlint . --deny-warnings --fix"
  }
}
```

**Rationale:** 
- Single dot (`.`) targets entire project
- `--deny-warnings` enforces strict mode
- Separate script for fix preserves the "manual fix" requirement

### 5. CI/CD Gate Execution Order
Execute gates sequentially for fast failure:
1. Typecheck (`tsc --noEmit`) - fastest, catches compile errors
2. Test (`bun test`) - catches functional bugs
3. Lint (`bun run lint`) - catches style/quality issues

**Rationale:** Typecheck is fastest (seconds), tests take longer (seconds to minutes), lint is fast but least critical for functionality.

## Risks / Trade-offs

**[Risk]** Oxlint may not recognize Bun-specific globals or patterns
→ **Mitigation:** Monitor for false positives; oxlint supports standard TypeScript/JS which covers most Bun code

**[Risk]** Strict mode (warnings as errors) may block legitimate patterns
→ **Mitigation:** Use inline ignore comments sparingly: `// oxlint-ignore-next-line <rule-name>`

**[Risk]** Agent workflow change requires habit formation
→ **Mitigation:** AGENTS.md explicitly requires lint execution; CI enforces it regardless

**[Risk]** Oxlint zero-config may miss project-specific conventions
→ **Mitigation:** Acceptable trade-off for simplicity; can add `.oxlintrc.json` later if needed

## Migration Plan

**Phase 1: Setup (this change)**
1. Install oxlint: `bun add -d oxlint`
2. Add scripts to package.json
3. Run initial lint to establish baseline
4. Fix any existing issues or add ignores
5. Update AGENTS.md

**Phase 2: CI Integration (follow-up)**
Add GitHub Actions workflow (separate change):
```yaml
name: Quality Gates
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run typecheck
      - run: bun test
      - run: bun run lint
```

**Rollback:** Remove oxlint from devDependencies and delete scripts from package.json.

## Open Questions

1. Should we run lint on `src/` only or entire project (including tests)?
   - **Recommendation:** Entire project (`oxlint .`) for consistency
   
2. Should lint run in parallel with tests in CI for speed?
   - **Recommendation:** Sequential for now; parallel adds complexity
   
3. Any Bun-specific globals that might need oxlint configuration?
   - **Investigation:** Run initial lint and see if `Bun` global triggers errors
