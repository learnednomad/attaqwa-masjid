# @attaqwa/api

The backend API service for the Masjid At-Taqwa Digital Ecosystem, built with Hono.js and TypeScript.

## 🚀 Features

- **Hono.js Framework**: Lightweight, fast, and TypeScript-first
- **JWT Authentication**: Secure user authentication with role-based access control
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Islamic APIs**: Prayer times, Qibla direction, and Islamic calendar integration
- **Zod Validation**: Runtime type checking for API requests and responses
- **CORS Support**: Configurable cross-origin resource sharing
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

## 📁 Project Structure

```
src/
├── routes/
│   ├── auth.ts           # Authentication endpoints
│   ├── announcements.ts  # Announcement CRUD
│   ├── events.ts         # Event management
│   ├── users.ts          # User management
│   └── islamic.ts        # Islamic features (prayer times, etc.)
├── middleware/
│   ├── auth.ts           # JWT middleware
│   ├── cors.ts           # CORS configuration
│   └── validation.ts     # Request validation
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   └── islamic.ts        # Islamic API integrations
├── types/
│   └── hono.ts           # Hono context extensions
└── index.ts              # Main application entry
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your database and JWT settings
   ```

3. **Run database migrations**
   ```bash
   cd ../db
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Development Commands

```bash
npm run dev         # Start development server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run typecheck   # TypeScript type checking
npm test            # Run tests
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  },
  "token": "jwt.token.here"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  },
  "token": "jwt.token.here"
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

### Announcement Endpoints

#### GET /api/announcements
List all published announcements.

**Query Parameters:**
- `type` (optional): Filter by announcement type
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "announcements": [
    {
      "id": "clxxxxx",
      "title": "Community Event",
      "content": "Join us for...",
      "type": "EVENT",
      "priority": "HIGH",
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "name": "Admin User"
      }
    }
  ],
  "total": 5
}
```

#### POST /api/announcements
Create a new announcement (Admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "title": "New Announcement",
  "content": "Announcement content here...",
  "type": "GENERAL",
  "priority": "NORMAL",
  "isPublished": true
}
```

#### PUT /api/announcements/:id
Update an existing announcement.

#### DELETE /api/announcements/:id
Delete an announcement.

### Event Endpoints

#### GET /api/events
List all published events.

**Response:**
```json
{
  "events": [
    {
      "id": "clxxxxx",
      "title": "Friday Prayer",
      "description": "Weekly congregational prayer",
      "startTime": "2024-01-05T12:30:00.000Z",
      "endTime": "2024-01-05T13:30:00.000Z",
      "location": "Main Prayer Hall",
      "isRecurring": true,
      "recurrencePattern": "WEEKLY"
    }
  ]
}
```

#### POST /api/events
Create a new event (Admin only).

### Islamic Feature Endpoints

#### GET /api/islamic/prayer-times
Get prayer times for a location.

**Query Parameters:**
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `date` (optional): Date for prayer times (default: today)
- `method` (optional): Calculation method (default: ISNA)

**Response:**
```json
{
  "date": "2024-01-01",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "prayers": {
    "fajr": "05:30",
    "sunrise": "07:15",
    "dhuhr": "12:45",
    "asr": "15:30",
    "maghrib": "18:00",
    "isha": "19:30"
  },
  "method": "ISNA"
}
```

#### GET /api/islamic/qibla-direction
Get Qibla direction for a location.

**Query Parameters:**
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude

**Response:**
```json
{
  "direction": 58.5,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure

The API uses JWT tokens for authentication with the following payload:

```typescript
interface UserPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  iat: number;
  exp: number;
}
```

### Role-Based Access Control

- **USER**: Can view published content, manage own profile
- **MODERATOR**: Can create/edit announcements and events
- **ADMIN**: Full access to all features and user management

### Protected Routes

Routes requiring authentication:
- All POST, PUT, DELETE operations
- User profile management
- Admin dashboard endpoints

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/attaqwa_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# CORS
FRONTEND_URL="http://localhost:3000"

# External APIs
ALADHAN_API_URL="http://api.aladhan.com/v1"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Islamic API Integration

The API integrates with external Islamic services:

- **Aladhan API**: Prayer times and Islamic calendar
- **Islamic Finder**: Alternative prayer time calculations
- **Hijri Calendar**: Islamic date conversions

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Test Structure

```
tests/
├── routes/
│   ├── auth.test.ts
│   ├── announcements.test.ts
│   └── islamic.test.ts
├── middleware/
│   └── auth.test.ts
└── lib/
    └── islamic.test.ts
```

### Example Test

```typescript
import { testClient } from 'hono/testing';
import { app } from '../src/index';

describe('Authentication', () => {
  it('should register a new user', async () => {
    const res = await testClient(app).auth.register.$post({
      json: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }
    });
    
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe('test@example.com');
    expect(data.token).toBeDefined();
  });
});
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

Ensure the following in production:
- Secure JWT secret
- Proper database connection
- HTTPS enabled
- Rate limiting configured
- Monitoring and logging setup

## 📊 Monitoring & Logging

### Health Check

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### Logging

The API uses structured logging with configurable levels:
- `error`: Error messages and stack traces
- `warn`: Warning messages
- `info`: General information
- `debug`: Detailed debugging information

## 🤝 Contributing

Please read [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on contributing to this project.

### Islamic Considerations

When contributing to Islamic features:
- Use accurate prayer time calculations
- Respect Islamic calendar conventions
- Test with multiple Islamic calculation methods
- Consider different schools of Islamic thought

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.