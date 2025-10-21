# LoopEat Backend

Express.js REST API backend for the LoopEat restaurant and food truck locator. Provides authentication, user management, and restaurant data endpoints with PostgreSQL database integration.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# From project root - starts backend, database, and pgAdmin
docker-compose up backend

# Or build and run backend only
cd backend
npm run docker:dev
```

API will be available at http://localhost:3001

### Local Development

```bash
# Install dependencies
npm install

# Create .env file (see Configuration section below)
cp .env.example .env

# Start development server with auto-reload
node src/server.js
```

API runs on http://localhost:3000

## 🏗️ Architecture

The backend follows a **modular architecture** with clear separation of concerns:

```
src/
├── config/            # Configuration files
│   └── database.js    # PostgreSQL connection pool
├── middlewares/       # Express middlewares
│   └── auth.middleware.js  # JWT authentication
├── models/            # Data models
│   ├── user.model.js
│   ├── pro.model.js
│   └── verification.model.js
├── modules/           # Feature modules
│   └── auth/
│       ├── auth.routes.js       # Route definitions
│       ├── auth.controller.js   # Request handlers
│       ├── auth.service.js      # Business logic
│       ├── auth.repository.js   # Database queries
│       └── auth.validation.js   # Input validation
├── utils/             # Shared utilities
│   ├── email.service.js   # Email sending (Nodemailer)
│   └── token.service.js   # JWT token management
├── app.js             # Express app configuration
└── server.js          # Server entry point
```

### Module Structure

Each feature module follows a consistent pattern:

- **Routes** - Define API endpoints and HTTP methods
- **Controller** - Handle HTTP requests/responses
- **Service** - Contain business logic
- **Repository** - Database access layer
- **Validation** - Input validation schemas

## 🔧 Technology Stack

- **Express 5.1** - Web framework
- **PostgreSQL 16** - Relational database
- **pg** - PostgreSQL client for Node.js
- **bcrypt 6.0** - Password hashing
- **jsonwebtoken 9.0** - JWT authentication
- **nodemailer 7.0** - Email sending
- **Redis 5.8** - Caching and session storage
- **dotenv** - Environment variable management
- **cookie-parser** - Cookie parsing
- **cors** - CORS middleware
- **Nodemon** - Development auto-reload

## ⚙️ Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (matches docker-compose.yml)
DB_USER=devuser
DB_PASSWORD=devpassword
DB_HOST=localhost  # Use 'database' when running in Docker
DB_PORT=5432
DB_NAME=myapp_dev

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Email (SMTP configuration)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Docker vs Local Development

When running with Docker Compose, use these settings in `.env`:

```env
DB_HOST=database  # Container name from docker-compose.yml
REDIS_HOST=redis  # If using Redis container
```

When running locally without Docker:

```env
DB_HOST=localhost
REDIS_HOST=localhost
```

## 🛠️ Development Commands

```bash
# Start server manually
node src/server.js

# Start with Nodemon (auto-reload) - add to package.json if needed
npx nodemon src/server.js
```

## 🐳 Docker Commands

```bash
# Build development image
npm run docker:build

# Run development container
npm run docker:dev

# Or use docker-compose from project root
cd ..
docker-compose up backend
```

Note: Commands use Windows syntax (`%cd%`). For Linux/Mac, modify package.json to use `$(pwd)`.

## 🗄️ Database

### PostgreSQL Connection

The backend connects to PostgreSQL using a connection pool (src/config/database.js:1):

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});
```

### pgAdmin Access

When running with Docker Compose, access pgAdmin at:

- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

To connect to the database in pgAdmin:
1. Add new server
2. Host: `database` (container name)
3. Port: `5432`
4. Username: `devuser`
5. Password: `devpassword`

### Database Migrations

Initialization scripts can be placed in `init-scripts/` directory. They will run automatically when the PostgreSQL container starts for the first time.

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

### Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Backend returns JWT token
3. Client stores token (in localStorage or httpOnly cookie)
4. Client sends token in `Authorization` header: `Bearer <token>`
5. Middleware validates token on protected routes

### Example Protected Route

```javascript
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/protected', authenticate, (req, res) => {
  // req.user contains decoded JWT payload
  res.json({ user: req.user });
});
```

## 📧 Email Service

Email functionality uses Nodemailer (src/utils/email.service.js:1):

- Email verification
- Password reset
- Notifications

Configure SMTP settings in `.env` file.

## 📁 API Endpoints

### Authentication

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/verify-email      - Verify email address
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/me                - Get current user (protected)
```

### Future Endpoints

- Restaurants CRUD
- Food trucks CRUD
- Search and filtering
- User favorites

## 🧪 Testing

Currently no tests configured. To add testing:

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Add test script to package.json
"test": "jest"
```

## 🚨 Common Issues

### Database connection fails

- Verify PostgreSQL is running: `docker ps` or check local PostgreSQL service
- Check `.env` file has correct database credentials
- When using Docker, ensure `DB_HOST=database` not `localhost`
- Wait for database health check: `docker-compose logs database`

### Port 3000/3001 already in use

```bash
# Find process using the port (Windows)
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F

# Or change PORT in .env file
```

### JWT token invalid

- Check `JWT_SECRET` matches between token creation and validation
- Verify token hasn't expired (check `JWT_EXPIRES_IN`)
- Ensure token is sent with `Bearer ` prefix

### Email not sending

- Verify SMTP credentials in `.env`
- For Gmail, use App Password, not regular password
- Check firewall/antivirus blocking port 587

## 📊 Database Schema (Current)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification tokens
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Professionals (restaurant/food truck owners)
CREATE TABLE pros (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  business_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Best Practices

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens stored in httpOnly cookies when possible
- CORS configured to allow only specific origins
- SQL injection prevention via parameterized queries
- Rate limiting (to be implemented)
- Helmet middleware (to be added for security headers)

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Node.js pg Documentation](https://node-postgres.com)
- [Project Architecture](../CLAUDE.md)

## 🔮 Roadmap

- [ ] Add comprehensive test suite (Jest + Supertest)
- [ ] Implement rate limiting
- [ ] Add Helmet for security headers
- [ ] Set up Redis for session management
- [ ] Create database migration system
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement logging (Winston or Pino)
- [ ] Add request validation middleware
- [ ] Set up CI/CD pipeline
