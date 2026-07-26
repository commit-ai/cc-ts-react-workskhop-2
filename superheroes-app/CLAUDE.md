# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands run from their respective subdirectory.

### Backend (`backend/`)

```bash
npm run dev        # tsx watch — hot-reloads; runs on port 41071
npm test           # Jest with ts-jest ESM preset
npm run build      # tsc compile to dist/
```

Run a single test file:
```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/server.test.ts
```

### Frontend (`frontend/`)

```bash
npm start          # CRA dev server on port 41072
npm test           # CRA Jest / React Testing Library
npm run build      # production build
```

## Architecture

### Backend layering

- `src/index.ts` — starts the HTTP server (port 41071); never imported by tests
- `src/app.ts` — creates the Express app and mounts the router; exported for `supertest`
- `src/routes/heroes.router.ts` — all `/api/superheroes` route handlers
- `src/services/heroes.service.ts` — `loadHeroes` (reads `data/superheroes.json` on every request) and `parseHeroId` (validates integer IDs)

The server does **not** start when imported in tests — tests use `supertest` directly against the exported `app`.

### API routes

| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | health check — returns `"Save the World!"` |
| GET | `/api/superheroes` | all heroes |
| GET | `/api/superheroes/search?name=<query>` | case-insensitive name search; `name` param required |
| GET | `/api/superheroes/:id` | single hero; `id` must be a non-negative integer |
| GET | `/api/superheroes/:id/powerstats` | powerstats only |

Hero shape: `{ id, name, image, powerstats: { intelligence, strength, speed, durability, power, combat } }`. Images are static files under `frontend/public/` named `<id>-<slug>.jpg`.

### Frontend data flow

- `useSuperheroes` hook fetches `/api/superheroes` on mount; CRA proxies `/api/*` to `http://localhost:41071`
- `App` holds `superheroes`, `selected` (max 2 IDs), `view` (`'table'` | `'compare'`), and `search` state
- `HeroTable` renders the full list with client-side search filtering and checkbox selection
- `CompareView` renders a stat-by-stat comparison using `calculateWinner` from `utils/heroStats.js`

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).