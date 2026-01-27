# frenspace

Minimal TypeScript/Bun project template.

<instructions>

## Build & Test
- Build: `bun build index.ts --outdir dist` (for bundling)
- Run: `bun run index.ts`
- Typecheck: `bun run typecheck` (or `tsc --noEmit`)
- Test: `bun test`
- Lint: `bun run lint`
- Lint (fix): `bun run lint:fix`

## Setup
- Install dependencies: `bun install`

</instructions>

<rules>

## Process Constraints
- MUST NOT run long-running/blocking processes (dev servers, watch modes)
- Dev servers are USER's responsibility to run in background
- MUST use one-shot verification commands only

## Coding Conventions
- TypeScript strict mode enabled in [tsconfig.json](tsconfig.json#L18)
- Use `.ts` extensions in imports (verbatimModuleSyntax enabled)
- Target: ESNext with moduleResolution: bundler
- NoUnusedLocals and noUnusedParameters are disabled
- Follow the minimal Bun runtime pattern
- **MUST run lint before committing changes**
- **MUST run lint:fix when lint issues are auto-fixable**
- **Lint is strict: warnings are treated as errors**

## File Organization
- Entry point: [index.ts](index.ts#L1)
- Type definitions: none yet
- Output directory: `dist/` or `out/` (ignored by git)

</rules>

<context_hints>

## Context Allocation
- **Skip**: `node_modules/` (Bun packages)
- **Minimal**: [index.ts](index.ts#L1), [index.test.ts](index.test.ts#L1), [tsconfig.json](tsconfig.json#L1-L30), and [package.json](package.json#L1-L30) exist

</context_hints>
