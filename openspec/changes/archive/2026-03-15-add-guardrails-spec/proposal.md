## Why

The codebase currently lacks automated quality gates. TypeScript compilation errors, test failures, and code style violations can slip through to production. We need strict guardrails that block commits/merges when quality standards aren't met, ensuring consistent code quality across local development and CI/CD.

## What Changes

- **Integrate oxlint** as the project's linter with strict mode (warnings treated as errors)
- **Create typecheck scenarios** referencing existing `tsc --noEmit` command
- **Create test scenarios** referencing existing `bun test` command
- **Create lint scenarios** for oxlint with zero-config defaults (no React/JSX rules)
- **Update AGENTS.md** to document lint commands and require agents to run lint regularly
- **Configure CI** to run all three gates and block merges on any failure

## Capabilities

### New Capabilities
- `code-quality-guardrails`: Automated quality gates for typechecking, testing, and linting that block commits when standards aren't met

### Modified Capabilities
- None (existing http-server spec remains unchanged; this is orthogonal infrastructure)

## Impact

- **AGENTS.md**: Add lint commands to instructions section, add rule requiring agents to run lint regularly
- **package.json**: Add lint scripts (`lint`, `lint:fix`)
- **CI/CD**: Add quality gate workflow that runs tsc, bun test, and oxlint
- **Developer workflow**: Pre-commit quality checks in local dev
