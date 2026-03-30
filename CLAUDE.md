# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Type-check
npx tsc --noEmit

# Compile
npx tsc
```

No test runner or linter is configured yet.

## TypeScript Configuration

The `tsconfig.json` uses strict settings worth noting:
- `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`, requiring null checks
- `exactOptionalPropertyTypes: true` — optional props cannot be explicitly set to `undefined` unless the type includes `undefined`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `module: "nodenext"` — requires file extensions in relative imports (e.g. `./foo.js` not `./foo`)
- `jsx: "react-jsx"` — JSX support enabled (no explicit React import needed)

`rootDir` and `outDir` are commented out in tsconfig — set these when source layout is established.
