# Masjid At-Taqwa Digital Ecosystem

A comprehensive Islamic community platform built with modern web technologies, featuring a monorepo architecture with Turborepo for optimal development experience and scalability.

## 🏗️ Architecture Overview

This project uses a **Turborepo monorepo** structure with the following packages:

```
packages/
├── web/          # Next.js 15 frontend with Islamic UI design
├── api/          # Hono.js backend with JWT authentication
├── db/           # Prisma ORM with PostgreSQL schema
└── shared/       # Shared TypeScript types and utilities
```

## 🚀 Tech Stack

### Frontend (`packages/web`)
- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript
- **Tailwind CSS v4** with Islamic design system
- **Shadcn/UI** components with Radix UI primitives
- **React Query** for server state management
- **React Hook Form** with Zod validation

### Backend (`packages/api`)
- **Hono.js** - Lightweight, fast TypeScript web framework
- **JWT Authentication** with role-based access control (RBAC)
- **Prisma ORM** for type-safe database operations
- **Zod** for request/response validation
- **CORS** and security middleware

### Database (`packages/db`)
- **PostgreSQL** with comprehensive Islamic content schema
- **Prisma** migrations and type generation
- Models for users, announcements, events, prayer times, educational content

### Shared (`packages/shared`)
- **TypeScript types** shared across all packages
- **Utility functions** and constants
- **Zod schemas** for API validation

## 🎨 Islamic Design System

The platform features a carefully crafted Islamic design system:

- **Colors**: Islamic Green (`#2D7A2D`), Islamic Gold, Islamic Navy
- **Typography**: Inter for body text, Amiri for Arabic content
- **Components**: Islamic-themed UI components with proper RTL support
- **Accessibility**: WCAG compliant with proper ARIA labels

## 📋 Features

### 🏠 Public Website
- **Homepage** with community announcements and events
- **Prayer Times** with automatic location detection
- **Event Calendar** with iCal download support
- **Responsive Design** optimized for all devices

### 👥 Community Management
- **Announcements** with rich text and media support
- **Event Management** with RSVP functionality
- **Prayer Schedule** integration with Islamic calendar
- **Community Directory** for member connections

### 🎓 Educational Platform
- **Islamic Lessons** with progress tracking
- **Quizzes and Assessments** for knowledge verification
- **Age-appropriate Content** filtering system
- **Progress Analytics** for learning insights

### 🔐 Admin Dashboard
- **Role-based Access Control** (Admin, Moderator, User)
- **Content Management** for all platform content
- **User Management** with permission controls
- **Analytics Dashboard** with community insights

## 🛠️ Development Setup

### Prerequisites
- **Node.js 18+** and npm
- **PostgreSQL 14+** database
- **Git** for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/learnednomad/attaqwa-masjid.git
   cd attaqwa-masjid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp packages/api/.env.example packages/api/.env
   cp packages/web/.env.example packages/web/.env
   
   # Configure your database and API settings
   ```

4. **Set up the database**
   ```bash
   # Start PostgreSQL (using Docker)
   docker run --name attaqwa-postgres \
     -e POSTGRES_PASSWORD=your_password \
     -e POSTGRES_DB=attaqwa_db \
     -p 5432:5432 -d postgres:14
   
   # Run database migrations
   cd packages/db
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Start all services in development mode
   npm run dev
   
   # Or start individual services
   npm run dev --filter=@attaqwa/web      # Frontend only
   npm run dev --filter=@attaqwa/api      # Backend only
   ```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000/admin

## 🧪 Testing

### Running Tests
```bash
# Run all tests across packages
npm run test

# Run tests for specific package
npm run test --filter=@attaqwa/web

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing (planned)

## 📦 Building and Deployment

### Local Build
```bash
# Build all packages
npm run build

# Build specific package
npm run build --filter=@attaqwa/web
```

### Production Deployment

#### Using Docker
```bash
# Build Docker images
docker-compose build

# Start production services
docker-compose up -d
```

#### Using Vercel (Frontend)
```bash
# Deploy to Vercel
cd packages/web
npx vercel --prod
```

#### Database Deployment
- **Recommended**: Railway, PlanetScale, or Supabase
- **Self-hosted**: PostgreSQL with proper backups
- **Local**: Docker Compose for development

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Building
npm run build            # Build all packages
npm run build:web        # Build frontend
npm run build:api        # Build backend

# Code Quality
npm run lint             # Lint all packages
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run typecheck        # TypeScript type checking

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login     # User login
POST /api/auth/register  # User registration
POST /api/auth/logout    # User logout
GET  /api/auth/me        # Get current user
```

### Content Management
```
GET    /api/announcements       # List announcements
POST   /api/announcements       # Create announcement
PUT    /api/announcements/:id   # Update announcement
DELETE /api/announcements/:id   # Delete announcement

GET    /api/events              # List events
POST   /api/events              # Create event
PUT    /api/events/:id          # Update event
DELETE /api/events/:id          # Delete event
```

### Islamic Features
```
GET /api/prayer-times           # Current prayer times
GET /api/islamic-calendar       # Islamic calendar events
GET /api/qibla-direction        # Qibla direction for location
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following code conventions
3. Run tests: `npm run test`
4. Check types: `npm run typecheck`
5. Format code: `npm run format`
6. Commit with conventional commits
7. Create pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with Islamic naming conventions
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Semantic commit messages

## 📁 Project Structure

```
attaqwa-masjid/
├── packages/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities and hooks
│   │   │   └── styles/        # Global styles
│   │   ├── public/            # Static assets
│   │   └── package.json
│   │
│   ├── api/                    # Hono.js Backend
│   │   ├── src/
│   │   │   ├── routes/        # API route handlers
│   │   │   ├── middleware/    # Auth and validation
│   │   │   ├── lib/           # Utilities
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   │
│   ├── db/                     # Database Package
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   ├── migrations/    # Database migrations
│   │   │   └── seed.ts        # Database seeding
│   │   └── package.json
│   │
│   └── shared/                 # Shared Types
│       ├── src/
│       │   ├── types/         # TypeScript interfaces
│       │   ├── schemas/       # Zod validation schemas
│       │   └── utils/         # Shared utilities
│       └── package.json
│
├── docs/                       # Documentation
├── docker-compose.yml          # Docker configuration
├── turbo.json                  # Turborepo configuration
└── package.json               # Root package.json
```

## 🚀 Roadmap

### Phase 1: Core Platform ✅
- [x] Monorepo setup with Turborepo
- [x] Next.js frontend with Islamic design
- [x] Hono.js backend with JWT auth
- [x] PostgreSQL database with Prisma
- [x] Admin dashboard
- [x] Prayer times integration

### Phase 2: Enhanced Features ✅
- [x] Educational content system with age-tier filtering
- [x] Advanced user management with role-based access
- [x] Comprehensive monitoring and analytics
- [x] Production deployment setup
- [ ] Push notifications

### Phase 4: Future Community Features 📅
- [ ] Discussion forums
- [ ] Event RSVP system
- [ ] Donation management
- [ ] Volunteer coordination
- [ ] Community directory
- [ ] Mobile app development

### Phase 3: Analytics & Insights ✅
- [x] Usage analytics with Islamic feature tracking
- [x] Community insights and engagement metrics
- [x] Performance monitoring with Islamic context
- [x] Real-time monitoring dashboard
- [x] Error tracking and reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤲 Islamic Considerations

This platform is built with Islamic principles in mind:
- **Halal Content**: All content follows Islamic guidelines
- **Prayer Times**: Accurate prayer time calculations
- **Islamic Calendar**: Hijri date support
- **Community Focus**: Building strong Muslim communities
- **Educational**: Promoting Islamic knowledge and values

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues**: https://github.com/learnednomad/attaqwa-masjid/issues
- **Discussions**: https://github.com/learnednomad/attaqwa-masjid/discussions
- **Email**: support@attaqwa-masjid.com

---

**Built with ❤️ for the Islamic community**

*"And whoever builds a mosque for Allah, Allah will build for him a house like it in Paradise."* - Prophet Muhammad (ﷺ)