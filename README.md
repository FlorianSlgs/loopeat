# LoopEat

LoopEat is a full-stack web application that enables restaurants and food trucks in Montpellier, France, to manage a connected reusable container deposit system for takeaway meals.

## 🏗️ Architecture

This project follows a **monorepo structure** with three main services:

- **Frontend** - Angular 20 application with server-side rendering (SSR)
- **Backend** - Express.js REST API
- **Database** - PostgreSQL 16 database with pgAdmin interface

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the entire stack is using Docker Compose:

```bash
# Start all services (frontend, backend, database, pgAdmin)
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers after dependency changes
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Access Points

Once running, you can access:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)
- **PostgreSQL**: localhost:5432 (devuser / devpassword)

## 💻 Manual Development Setup

If you prefer to run services individually without Docker:

### Prerequisites

- Node.js 18+
- npm 10+
- PostgreSQL 16+ (if running backend locally)

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Visit http://localhost:4200

### Backend Setup

```bash
cd backend
npm install

# Create .env file with database credentials
# See backend/.env.example

node index.js
```

API will run on http://localhost:3000

## 📁 Project Structure

```
loop-eat/
├── frontend/                     # Angular 20 application
│   ├── src/
│   │   └── app/
│   │       ├── apps/                     # Business domain modules
│   │       ├── common/                   # Shared utilities
│   │       └── presentation/             # UI components
│   │           ├── features/             # Reusable features (map, carousel)
│   │           ├── pages/                # Route-level pages
│   │           └── shared/               # Common UI components
│   ├── Dockerfile.dev
│   └── package.json
├── backend/                       # Express.js API
│   ├── Dockerfile.dev
│   ├── index.js
│   └── package.json
├── docker-compose.yml             # Multi-service orchestration
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Angular 20.3** with standalone components
- **TypeScript 5.9**
- **Tailwind CSS 4.1** for styling
- **Leaflet 1.9** for interactive maps
- **Server-Side Rendering (SSR)** with Express
- **Signals-based reactivity** (zoneless change detection)

### Backend
- **Node.js** with Express 5.1
- **PostgreSQL 16** database
- **Nodemon** for development auto-reload

### DevOps
- **Docker & Docker Compose** for containerization
- **pgAdmin 4** for database management

## 🧪 Testing

```bash
# Frontend tests (Jasmine + Karma)
cd frontend
npm test

# Run specific test file
npm test -- --include='**/map.spec.ts'
```

## 📦 Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Builds to `frontend/dist/` with SSR support.

### Docker Production Build

```bash
# Build production images
cd frontend && npm run docker:build:prod
cd backend && npm run docker:build
```

## ✨ Key Features

- **Interactive Map** - Leaflet-powered map showing restaurants and food trucks
- **Search & Filter** - Real-time filtering of locations
- **SSR Support** - Server-side rendering for better SEO and performance
- **Responsive Design** - Mobile-friendly Tailwind CSS interface
- **Database Integration** - PostgreSQL for data persistence

## 🐳 Docker Details

The development environment uses Docker Compose with:

- **Volume mounting** for hot reload during development
- **Isolated node_modules** to avoid platform conflicts
- **Health checks** to ensure services start in correct order
- **pgAdmin** for easy database management

## 📚 Additional Documentation

- Frontend-specific guide: [frontend/README.md](frontend/README.md)
- Backend-specific guide: [backend/README.md](backend/README.md)
- Project architecture notes: [CLAUDE.md](CLAUDE.md)

## 🤝 Contributing

When working on this project:

1. Use Docker Compose for development consistency
2. Follow the Angular standalone component pattern
3. Use signals for state management (no Zones)
4. Ensure SSR compatibility (check browser platform before using browser APIs)
5. Run tests before committing

## 📄 License

[Add your license here]
