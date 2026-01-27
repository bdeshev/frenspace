## 1. Install oxlint

- [x] 1.1 Install oxlint as dev dependency: `bun add -d oxlint`
- [x] 1.2 Verify oxlint is available: `bunx oxlint --version`

## 2. Configure package.json scripts

- [x] 2.1 Add lint script: `"lint": "oxlint . --deny-warnings"`
- [x] 2.2 Add lint:fix script: `"lint:fix": "oxlint . --deny-warnings --fix"`
- [x] 2.3 Add typecheck script: `"typecheck": "tsc --noEmit"`
- [x] 2.4 Verify scripts work: `bun run lint`, `bun run lint:fix`, `bun run typecheck`

## 3. Run initial lint and establish baseline

- [x] 3.1 Run initial lint: `bun run lint`
- [x] 3.2 Fix any existing issues or add ignore comments
- [x] 3.3 Run lint:fix to auto-fix what can be fixed: `bun run lint:fix`
- [x] 3.4 Verify lint passes after fixes: `bun run lint`

## 4. Update AGENTS.md

- [x] 4.1 Add lint command to Build & Test section: `Lint: bun run lint`
- [x] 4.2 Add lint:fix command: `Lint (fix): bun run lint:fix`
- [x] 4.3 Add typecheck command to Build & Test section: `Typecheck: bun run typecheck`
- [x] 4.4 Add coding convention: Agents MUST run lint before committing
- [x] 4.5 Add coding convention: Agents MUST run lint:fix when auto-fixable issues found
- [x] 4.6 Update context hints to reference package.json scripts

## 5. Verify all gates pass

- [x] 5.1 Run typecheck: `bun run typecheck` - verify exit code 0
- [x] 5.2 Run tests: `bun test` - verify all tests pass
- [x] 5.3 Run lint: `bun run lint` - verify exit code 0
- [x] 5.4 Verify all three gates work in sequence

## 6. Mark change complete

- [x] 6.1 Verify all scenarios in spec.md are satisfied
- [x] 6.2 Archive change with openspec
