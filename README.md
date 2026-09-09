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

Both apps share the same lightweight demo state through a localhost cookie. Open
them in two tabs of the same browser to run the full Kid → Parent approval flow.

Deployed parent prototype: https://pencilanya.github.io/food/

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

## Integration boundary

The MVP intentionally does not depend on an undocumented Samokat API. The local
catalog uses `MockCatalogProvider`; future sources can implement `CatalogProvider`
without changing lunchbox rules. Authentication, production persistence, delivery,
payments and medical recommendations are intentionally out of scope.
