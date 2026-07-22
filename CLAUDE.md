# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repo has two top-level areas:

- **`superheroes-app/`** — a working full-stack app used as the workshop target
  - `backend/` — Express + TypeScript server (ESM, port 41071)
  - `frontend/` — Create React App (port 41072, proxies `/api/*` to backend)
- **`plugin-marketplace/`** — Claude Code plugin marketplace infrastructure (skills for building/publishing plugins)

## Development Commands

All commands are run from within their respective subdirectory.

### Backend (`superheroes-app/backend/`)

```bash
npm install
npm run dev        # tsx watch — hot-reloads on change
npm test           # Jest with ts-jest ESM preset
```

### Frontend (`superheroes-app/frontend/`)

```bash
npm install
npm start          # CRA dev server on port 41072
npm test           # CRA Jest / React Testing Library
npm run build      # production build
```

## Architecture

### Backend

Single-file Express server (`src/server.ts`) using ESM (`"type": "module"`). Runs with `tsx`. Data is a static JSON file (`data/superheroes.json`) read from disk on every request — no database.

API routes:
- `GET /` — health check
- `GET /api/superheroes` — all heroes
- `GET /api/superheroes/:id` — single hero
- `GET /api/superheroes/:id/powerstats` — powerstats only

The server does **not** start when `NODE_ENV=test`; tests use `supertest` against the exported `app` directly. Use `TEST_PORT` env var to override port in tests.

### Frontend

Standard CRA React app (JavaScript, not TypeScript). `package.json` sets `"proxy": "http://localhost:41071"` so `/api/*` calls are forwarded to the backend during development. `App.js` fetches `/api/superheroes` on mount and renders a table with hero images and powerstats.

Hero images are served as static files under `public/` (named `<id>-<slug>.jpg`); the `image` field in the JSON data points to these paths.

## Conventions

- Always validate API responses against the existing data shape in `superheroes.json`.
- When adding backend routes, follow the existing Express pattern in `server.ts`.

## Plugin Marketplace

`plugin-marketplace/` contains a Claude Code skill (`create-plugin-marketplace`) for converting a skill repo into a distributable plugin marketplace. See `plugin-marketplace/.claude/skills/create-plugin-marketplace/SKILL.md` for the full spec.
