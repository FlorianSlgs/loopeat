# LoopEat Frontend

Angular 20 frontend application for the LoopEat restaurant and food truck locator. Features an interactive Leaflet map, server-side rendering (SSR), and modern reactive patterns with signals.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# From project root
docker-compose up frontend

# Or build and run frontend only
npm run docker:dev
```

Visit http://localhost:4200

### Local Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start
# or
ng serve
```

## 🏗️ Architecture

This frontend follows a **presentation-oriented architecture**:

```
src/app/
├── apps/          # Business domain modules
│   └── users/     # User authentication and management
├── common/        # Shared utilities and core services
│   ├── guards/    # Route guards
│   └── services/  # Shared services
└── presentation/  # UI layer
    ├── features/  # Reusable feature components
    │   ├── map/       # Interactive Leaflet map
    │   └── carousel/  # Image carousel
    ├── pages/     # Route-level page components
    │   ├── accueil/   # Home page
    │   └── connection/ # Login/signup pages
    └── shared/    # Common UI components
        ├── header/
        └── footer/
```

### Key Architectural Decisions

- **Standalone Components**: No NgModules, all components are standalone
- **Zoneless Change Detection**: Uses `provideZonelessChangeDetection()` with signals
- **Signals for State**: Angular signals (`signal()`, `computed()`) replace traditional observables
- **SSR-Ready**: Server-side rendering with client hydration and event replay
- **Platform-Aware**: Uses `isPlatformBrowser()` for browser-only APIs

## 🗺️ Map Component

The map component (src/app/presentation/features/map/map.ts:1) is a core feature:

- **Lazy Loading**: Leaflet is dynamically imported only in browser context
- **SSR Safe**: All browser APIs are wrapped in `isPlatformBrowser()` checks
- **Custom Markers**: SVG icons differentiate restaurants from food trucks
- **Reactive Search**: Signals-based filtering and search with `computed()`
- **Custom Tooltips**: Positioned relative to map markers for better UX

## 🛠️ Development Commands

```bash
# Development server (port 4200)
npm start

# Build for production
npm run build

# Build and watch for changes
npm run watch

# Serve SSR build locally
npm run serve:ssr:loop-eat

# Run all tests
npm test

# Run specific test file
ng test --include='**/map.spec.ts'

# Run tests with coverage
ng test --code-coverage
```

## 🐳 Docker Commands

```bash
# Build development image
npm run docker:build:dev

# Run development container
npm run docker:dev

# Build production image
npm run docker:build:prod

# Run production container
npm run docker:prod
```

Note: Commands use Windows syntax (`%cd%`). For Linux/Mac, modify package.json to use `$(pwd)`.

## 🎨 Styling

This project uses **Tailwind CSS 4.1**:

- Configured with PostCSS in `postcss.config.js`
- Global styles in `src/styles.css`
- Utility-first approach for component styling
- Leaflet CSS globally imported in `angular.json`

Example component styling:
```html
<div class="flex items-center gap-4 p-4 bg-blue-500 text-white rounded-lg">
  <!-- Your content -->
</div>
```

## 🔄 Working with Signals

This app uses Angular's signal-based reactivity:

```typescript
import { signal, computed } from '@angular/core';

// Create a signal
searchTerm = signal('');

// Read a signal value
console.log(this.searchTerm());

// Update a signal
this.searchTerm.set('nouvelle valeur');

// Computed signals (auto-updates when dependencies change)
filteredResults = computed(() => {
  return this.results().filter(r =>
    r.name.includes(this.searchTerm())
  );
});
```

## 🗺️ Working with Leaflet Maps

When modifying map-related code, follow these SSR-safe patterns:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private platformId = inject(PLATFORM_ID);

async initMap() {
  // Only run in browser
  if (isPlatformBrowser(this.platformId)) {
    // Dynamically import Leaflet
    const L = await import('leaflet');

    // Now safe to use Leaflet
    this.map = L.map('map').setView([lat, lng], zoom);
  }
}
```

**Never** access browser APIs like `document`, `window`, or `navigator` during SSR without platform checks.

## 🧪 Testing

Tests use **Jasmine** and **Karma**:

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
ng test --watch=false

# Run with coverage report
ng test --code-coverage

# Run specific test file
ng test --include='**/component-name.spec.ts'
```

Test files are co-located with components:
- `map.ts` → `map.spec.ts`
- `header.ts` → `header.spec.ts`

## 📦 Building

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration=production
```

Build artifacts are stored in `dist/loop-eat/`:
- `browser/` - Client-side bundle
- `server/` - SSR server bundle

### Bundle Size Limits
- Warning: 500 KB initial bundle
- Error: 1 MB initial bundle

## 🌐 Server-Side Rendering (SSR)

This app uses Angular Universal for SSR:

- Entry point: `server.ts`
- Server routes: `app.routes.server.ts`
- Client routes: `app.routes.ts`

SSR provides:
- Faster initial page load
- Better SEO
- Social media preview support

Build and serve SSR:
```bash
npm run build
npm run serve:ssr:loop-eat
```

## 📁 File Naming Conventions

- Components: `name.ts`, `name.html`, `name.css`, `name.spec.ts`
- No `.component` suffix (e.g., `map.ts` not `map.component.ts`)
- Routes: `app.routes.ts` and `app.routes.server.ts`

## 🔧 Configuration Files

- `angular.json` - Angular CLI configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `Dockerfile.dev` - Development Docker image
- `Dockerfile.prod` - Production Docker image

## 🚨 Common Issues

### Map not displaying
- Check if running in browser context: `isPlatformBrowser()`
- Ensure Leaflet CSS is imported in `angular.json`
- Verify map container has explicit height in CSS

### SSR errors
- Never use `document` or `window` without platform checks
- Dynamic imports for browser-only libraries
- Use `afterNextRender()` for initialization that must run in browser

### Hot reload not working in Docker
- Check volume mounts in `docker-compose.yml`
- Verify `CHOKIDAR_USEPOLLING=true` environment variable
- Try `docker-compose up --build`

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Leaflet Documentation](https://leafletjs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Project Architecture](../CLAUDE.md)
