# Superheroes Workshop Plugin Marketplace

A Claude Code plugin marketplace bundling the skills and hooks used in the Superheroes app workshop.

## Add this marketplace

```
/plugin marketplace add galz/cc-ts-react-workskhop-2
```

## Install plugins

```
/plugin install superheroes-workshop@superheroes-workshop-marketplace
```

## Plugins

| Plugin | Description |
|---|---|
| `superheroes-workshop` | Responsive hero table skill and ESLint pre-edit hook for the Superheroes app workshop. |

### What's included in `superheroes-workshop`

- **`responsive-hero-table` skill** — Applies the codebase's established responsive-table pattern to any hero data table; hides verbose columns on narrow screens and adds a summary column for mobile viewports.
- **`eslint-pre-edit` hook** — Runs ESLint before any file edit so lint errors are caught before Claude Code makes changes.
