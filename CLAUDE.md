# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** (`cd backend`):
```bash
npm run dev    # Dev server with hot-reload (nodemon, port 3000)
npm start      # Run server directly with tsx
npm test       # Jest tests (ESM mode)
```

**Frontend** (`cd frontend`):
```bash
npm start      # Dev server (port 3001, enforced via cross-env)
npm run build  # Production build
npm test       # React Testing Library tests
```

Run backend and frontend in separate terminals. No root-level scripts.

## Architecture

Full-stack TypeScript + React superhero data viewer. Two independent npm projects under `backend/` and `frontend/`.

**Backend** (`backend/`): Express server (TypeScript, ESM, Node 20+). Serves static superhero data from `backend/data/superheroes.json`. Three endpoints: `GET /`, `GET /api/superheroes`, `GET /api/superheroes/:id`, `GET /api/superheroes/:id/powerstats`. Port defaults to 3000 (override via `PORT` env var). Server startup is skipped when `NODE_ENV=test`.

**Frontend** (`frontend/`): React 18 with Create React App. Fetches hero data on mount via `fetch('/api/superheroes')` — proxied to `http://localhost:3000` via `"proxy"` in `package.json`. Renders a stats table.

**Data shape**:
```json
{ "id": number, "name": string, "image": string, "powerstats": { "intelligence": number, "strength": number, "speed": number, "durability": number, "power": number, "combat": number } }
```

## TypeScript / Module Notes

Backend uses `"type": "module"` (ESM) with `NodeNext` module resolution. Tests run via `ts-jest` with `--experimental-vm-modules`. Jest config is `jest.config.cjs` (CommonJS) to avoid ESM bootstrap issues. Test port is configurable via `TEST_PORT` env var.
