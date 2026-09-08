# Food / Lunchbox

MVP workspace for a school lunchbox product built around grocery items that can later be sourced from Samokat.

## Product surfaces

- `apps/parent` — parent experience: child profile, food constraints, lunchbox planning and approval.
- `apps/kid` — child experience: simple lunchbox preview and preference feedback.
- `packages/domain` — shared product types and domain rules.
- `packages/ui` — shared UI primitives.

## Local development

Requirements: Node.js 22+ and pnpm 10+.

```bash
corepack enable
pnpm install
pnpm dev
```

Parent app: http://localhost:3000
Kid app: http://localhost:3001

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Integration boundary

The scaffold intentionally does not depend on an undocumented Samokat API. Product/catalog data should be introduced through an adapter in a later iteration, keeping the core lunchbox domain independent from a specific provider.
