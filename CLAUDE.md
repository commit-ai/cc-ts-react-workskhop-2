# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript/React workshop project with separate backend and frontend applications:
- **Backend**: Express.js server (Node.js, TypeScript) running on port 3000
- **Frontend**: React application running on port 3001
- **Architecture**: Frontend proxies API requests to the backend via `package.json` proxy configuration

The project structure is monorepo-style with `/backend` and `/frontend` as independent npm workspaces, each with their own `package.json` and dependencies.

## Common Development Commands

### Backend (TypeScript/Express)
```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start dev server with hot reload (nodemon + tsx)
npm start               # Start production server
npm test                # Run tests with Jest
```

### Frontend (React)
```bash
cd frontend
npm install              # Install dependencies
npm start               # Start dev server on port 3001
npm test                # Run tests (interactive watch mode)
npm run build           # Build for production
```

## Architecture Notes

- **Backend** uses ES modules (`"type": "module"` in package.json)
- **Backend** uses TypeScript directly via `tsx` (no build step needed for dev)
- **Frontend** uses Create React App (CRA) with TypeScript support
- **CORS/Proxying**: Frontend configured to proxy requests to backend via the `"proxy"` field in `frontend/package.json`
- **Testing**: 
  - Backend: Jest with ts-jest preset for ESM TypeScript
  - Frontend: Jest via react-scripts with React Testing Library

## Key Files & Directories

- `backend/src/server.ts` - Main Express server entry point
- `backend/tests/` - Backend test files
- `backend/jest.config.cjs` - Jest configuration for TypeScript + ESM
- `frontend/src/App.js` - Main React component
- `frontend/src/App.test.js` - Frontend tests
- `backend/data/` - Backend runtime data directory

## Development Setup

1. Ensure Node.js 20.x or higher and npm are installed
2. Open two terminal windows (one for backend, one for frontend)
3. Backend first: `cd backend && npm install && npm run dev`
4. Frontend second: `cd frontend && npm install && npm start`
5. Verify backend at http://localhost:3000/ and frontend at http://localhost:3001/

## Node Versions & TypeScript

- Target: Node.js 20.x+
- TypeScript target: ES2020
- Both backend and frontend use strict TypeScript mode

## Conventions
- Always validate API responses against the existing data shape in `superheroes.json`.
- When adding backend routes, follow the existing Express pattern in `server.ts`.
