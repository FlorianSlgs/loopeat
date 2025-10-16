# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoopEat is a full-stack web application built with Angular 20 (frontend) and Express.js (backend). The application is a restaurant and food truck locator featuring an interactive map powered by Leaflet, allowing users to discover eco-friendly dining options in Montpellier, France.

## Architecture

### Monorepo Structure

The project follows a monorepo pattern with two main directories:
- `frontend/` - Angular 20 application with SSR support
- `backend/` - Express.js REST API

### Frontend Architecture

The Angular frontend follows a **presentation-oriented architecture** with clear separation of concerns:

```
frontend/src/app/
├── apps/          # Business domain modules (e.g., users/)
├── common/        # Shared utilities and core services
└── presentation/  # UI layer
    ├── features/  # Reusable feature components (map, carousel)
    ├── pages/     # Route-level page components (accueil)
    └── shared/    # Common UI components (header, footer)
```

**Key architectural decisions:**
- **Standalone components**: All components use Angular's standalone API (no NgModules)
- **Zoneless change detection**: Uses `provideZonelessChangeDetection()` with signals for reactive state
- **Signals for state management**: Components use Angular signals (`signal()`, `computed()`) instead of traditional observables
- **SSR-ready**: Implements server-side rendering with client hydration and event replay
- **Platform-aware code**: Uses `isPlatformBrowser()` to handle browser-only APIs (e.g., Leaflet) safely in SSR context

**Map component architecture** (frontend/src/app/presentation/features/map/map.ts:1):
- Lazy loads Leaflet library only in browser context to avoid SSR issues
- Uses signals for reactive filtering and search
- Custom SVG markers differentiate restaurants from food trucks
- Implements custom tooltip positioning relative to map markers

### Backend Architecture

Simple Express.js server providing REST API endpoints:
- Port: 3000 (mapped to 3001 in Docker)
- Currently provides basic health check endpoints
- Uses CommonJS module system

## Development Commands

### Using Docker Compose (Recommended)

```bash
# Start both frontend and backend in development mode
docker-compose up

# Rebuild containers after dependency changes
docker-compose up --build

# Stop all services
docker-compose down
```

Access:
- Frontend: http://localhost:4200
- Backend: http://localhost:3001

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server (with hot reload)
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Build and watch for changes
npm run watch

# Run unit tests
npm test
# or
ng test

# Run specific test file
ng test --include='**/map.spec.ts'

# Serve SSR build
npm run serve:ssr:loop-eat

# Docker commands (Windows syntax)
npm run docker:build:dev    # Build dev image
npm run docker:build:prod   # Build prod image
npm run docker:dev          # Run dev container
```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start server (manual)
node index.js

# Docker commands (Windows syntax)
npm run docker:build   # Build dev image
npm run docker:dev     # Run dev container
```

## Technology Stack

### Frontend
- **Angular 20.3** with standalone components
- **TypeScript 5.9**
- **Tailwind CSS 4.1** for styling
- **Leaflet 1.9** for interactive maps
- **Express 5.1** for SSR server
- **Jasmine + Karma** for testing

### Backend
- **Node.js** with Express 5.1
- **Nodemon** for development auto-reload

## Important Development Notes

### Working with Leaflet Maps

When modifying map-related code:
- Always use `isPlatformBrowser(this.platformId)` before accessing Leaflet
- Import Leaflet dynamically: `this.L = await import('leaflet');`
- Never access browser APIs (like `document`, `window`) during SSR

### Working with Signals

This project uses Angular's signal-based reactivity:
- Use `signal()` for mutable state
- Use `computed()` for derived values
- Call signals with `()` to read values: `this.searchTerm()`
- Update with `.set()` or `.update()`: `this.searchTerm.set('value')`

### Styling with Tailwind

- Tailwind CSS 4.1 is configured with PostCSS
- Custom Tailwind classes can be used throughout components
- Leaflet CSS is globally imported in angular.json

### Docker Development

- Development Dockerfiles use volume mounts to enable hot reload
- `node_modules` are isolated inside containers to avoid platform conflicts
- Windows syntax uses `%cd%` for current directory (Linux/Mac use `$(pwd)`)

## File Naming Conventions

- Components use the pattern: `name.ts`, `name.html`, `name.css`, `name.spec.ts`
- No `.component` suffix in filenames
- Routes are defined in `app.routes.ts` (client) and `app.routes.server.ts` (server)

## Testing

- Test files are co-located with source files (e.g., `map.spec.ts` next to `map.ts`)
- Run all tests with `ng test` in the frontend directory
- Tests use Jasmine and run with Karma in Chrome

## Build Output

- Frontend builds to `frontend/dist/`
- Production builds use output hashing for cache busting
- Bundle size limits: 500kB initial (warning), 1MB (error)
