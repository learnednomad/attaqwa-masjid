# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Masjid At-Taqwa Digital Ecosystem is a comprehensive Islamic community platform built with a Turborepo monorepo architecture. It features a Next.js 15 frontend, Hono.js backend, and includes Islamic features like prayer times, educational content system, announcement management, and comprehensive monitoring. The project is designed for scalability and maintainability with modern web technologies.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # TypeScript type checking
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Testing
```bash
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Hono.js with JWT authentication and role-based access
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4 with custom Islamic design system
- **UI Components**: Shadcn/UI with Radix UI primitives
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest with Testing Library for all packages
- **Monitoring**: Comprehensive logging and analytics system
- **Deployment**: Docker containers optimized for production

### Monorepo Structure
```
packages/
├── web/                    # Next.js 15 frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and hooks
├── api/                    # Hono.js backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth and logging
│   │   └── lib/           # Backend utilities
├── db/                     # Prisma database package
│   └── prisma/
│       ├── schema.prisma  # Database schema
│       └── migrations/    # Database migrations
└── shared/                 # Shared types and utilities
    └── src/
        ├── types/         # TypeScript interfaces
        └── schemas/       # Zod validation schemas
```

### Key Features Implemented
- **Islamic Educational System**: Age-tier content filtering, interactive quizzes, progress tracking
- **Prayer & Islamic Features**: Real-time prayer times, Qibla direction, Hijri calendar
- **Admin Dashboard**: Role-based access, content management, analytics
- **Monitoring System**: Real-time metrics, Islamic feature analytics, error tracking
- **Authentication**: JWT-based with Admin/Moderator/User roles

### Key Design Patterns

#### Component Architecture
- **Feature-based organization**: Components grouped by domain (announcements, events, etc.)
- **Compound components**: Complex components broken into reusable parts
- **Props interfaces**: Strong typing for all component props
- **Variant patterns**: Use `cn()` utility for conditional styling

#### Type Safety
- Comprehensive TypeScript interfaces in `src/types/index.ts`
- Zod schemas for runtime validation
- API response typing with generic patterns
- Strict mode enabled for maximum type checking

#### Styling System
- **Islamic design system**: Custom color palette (islamic-green, islamic-gold, islamic-navy)
- **CSS custom properties**: HSL color values in CSS variables
- **Responsive design**: Mobile-first approach with Tailwind breakpoints
- **Arabic text support**: Amiri font family for Arabic content with RTL support

### Islamic Design Guidelines

#### Colors
- Primary: Islamic Green (`--primary: 142 76% 36%`)
- Secondary: Islamic Gold for highlights and Zakat information
- Navy: For text and formal elements
- Use semantic color tokens (e.g., `text-islamic-green-600`)

#### Typography
- Body text: Inter font family
- Arabic text: Amiri font family with `.arabic` class
- Prayer times: `.prayer-time` class for tabular numbers

#### Cultural Considerations
- Prayer time displays use 12-hour format
- Dates follow Islamic calendar when appropriate
- Respect for Islamic design patterns and geometric elements
- No inappropriate imagery per Islamic guidelines

## Development Guidelines

### Adding New Features
1. Create types in `src/types/index.ts`
2. Add constants in `src/constants/index.ts`
3. Build components in appropriate feature directories
4. Write tests alongside components
5. Update this documentation

### Component Development
- Use TypeScript interfaces for all props
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Follow Islamic design system colors and typography
- Include proper error boundaries and loading states

### Data Fetching Patterns
- Use React Query for server state management
- Implement proper loading and error states
- Cache prayer times with appropriate TTL (1 hour)
- Cache announcements and events with shorter TTL (5-10 minutes)

### Testing Strategy
- Unit tests for utility functions and hooks
- Component tests with Testing Library
- Integration tests for complete features
- Maintain 70%+ test coverage

### API Integration (Future)
- RESTful endpoints following `/api/[resource]` pattern
- Zod validation for request/response bodies
- Error handling with proper HTTP status codes
- Rate limiting and security headers

## Common Tasks

### Adding a New Announcement Type
1. Update `AnnouncementType` in `src/types/index.ts`
2. Add type to `ANNOUNCEMENT_TYPES` constant
3. Update `AnnouncementCard` component styling
4. Add corresponding API validation

### Creating a New Page
1. Create page in `src/app/[route]/page.tsx`
2. Add route to navigation in `src/components/layout/header.tsx`
3. Implement proper metadata and SEO
4. Follow layout patterns from existing pages

### Integrating External APIs
1. Create service functions in `src/lib/services/`
2. Define response types in `src/types/index.ts`
3. Add API endpoints to `src/constants/index.ts`
4. Implement error handling and caching

### Islamic Calendar Integration
- Use Hijri calendar calculations for Islamic dates
- Support both Gregorian and Islamic date displays
- Implement proper Ramadan/Eid date calculations
- Cache Islamic calendar data appropriately

## Security Considerations
- Input validation with Zod schemas
- Sanitize HTML content (already implemented in announcement cards)
- Secure file upload handling for calendar PDFs and images
- No hardcoded API keys or sensitive data
- HTTPS enforcement in production

## Performance Optimization
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Prayer time caching (1 hour TTL)
- Static generation for public pages
- Bundle analysis with `@next/bundle-analyzer`

## Deployment Notes
- Environment variables for API configurations
- Build-time type checking required
- Static asset optimization enabled
- Vercel deployment configuration optimized
- CDN caching for images and static assets