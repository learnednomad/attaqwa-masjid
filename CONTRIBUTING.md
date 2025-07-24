# Contributing to Masjid At-Taqwa Digital Ecosystem

Thank you for your interest in contributing to the Masjid At-Taqwa Digital Ecosystem! This project aims to build a comprehensive Islamic community platform, and we welcome contributions from developers who share our vision of supporting Muslim communities through technology.

## 🤲 Islamic Principles

Before contributing, please ensure your contributions align with Islamic values:
- All content and features should be **halal** (permissible in Islam)
- Respect Islamic guidelines in design and functionality
- No inappropriate imagery or content
- Support for Islamic practices (prayer times, Qibla, Islamic calendar)

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **PostgreSQL 14+** (or Docker)
- **Git** for version control
- Basic knowledge of TypeScript, React, and Node.js

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/attaqwa-masjid.git
   cd attaqwa-masjid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp packages/api/.env.example packages/api/.env
   cp packages/web/.env.example packages/web/.env
   # Configure your local database and API settings
   ```

4. **Start the development environment**
   ```bash
   npm run dev
   ```

## 📝 Development Workflow

### Creating a Feature

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the project structure**
   - Place components in appropriate feature directories
   - Use shared types from `packages/shared`
   - Follow existing naming conventions

3. **Write tests**
   - Add unit tests for new components
   - Add integration tests for API endpoints
   - Ensure tests pass: `npm run test`

4. **Check code quality**
   ```bash
   npm run lint         # Check linting
   npm run typecheck    # Verify TypeScript
   npm run format       # Format code
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add prayer time notifications"
   ```

### Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use a descriptive title
   - Include a detailed description
   - Reference any related issues
   - Add screenshots for UI changes

3. **Code Review**
   - Address reviewer feedback
   - Make necessary changes
   - Ensure CI/CD passes

## 🏗️ Architecture Guidelines

### Code Organization

```
packages/
├── web/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   │   ├── ui/        # Base UI components
│   │   │   ├── features/  # Feature-specific components
│   │   │   └── layout/    # Layout components
│   │   ├── lib/           # Utilities and hooks
│   │   └── types/         # Component-specific types
│   └── public/            # Static assets
│
├── api/                    # Hono.js Backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Authentication & validation
│   │   └── lib/           # Backend utilities
│   └── tests/             # API tests
│
├── db/                     # Database Package
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   └── seed/              # Database seeding scripts
│
└── shared/                 # Shared Types & Utils
    ├── src/
    │   ├── types/         # Shared TypeScript types
    │   ├── schemas/       # Zod validation schemas
    │   └── utils/         # Shared utility functions
    └── tests/             # Shared utilities tests
```

### Coding Standards

#### TypeScript
- Use **strict mode**
- Define proper interfaces for all props
- Use `type` for unions, `interface` for object shapes
- Avoid `any` - use proper typing

```typescript
// Good
interface UserProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
}

// Avoid
function UserComponent(props: any) {
  // ...
}
```

#### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use compound component patterns for complex UI

```typescript
// Component structure
interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AnnouncementCard({ 
  announcement, 
  onEdit, 
  onDelete 
}: AnnouncementCardProps) {
  // Component implementation
}
```

#### API Routes (Hono.js)
- Use proper HTTP status codes
- Implement input validation with Zod
- Add comprehensive error handling

```typescript
// API route structure
app.post('/api/announcements', async (c) => {
  try {
    const body = await c.req.json();
    const validated = createAnnouncementSchema.parse(body);
    
    const announcement = await createAnnouncement(validated);
    return c.json({ announcement }, 201);
  } catch (error) {
    return c.json({ error: 'Invalid input' }, 400);
  }
});
```

### Database Changes

#### Schema Modifications
1. Create a new migration:
   ```bash
   cd packages/db
   npx prisma migrate dev --name your-migration-name
   ```

2. Update seed data if necessary:
   ```bash
   npx prisma db seed
   ```

3. Update related TypeScript types in `packages/shared`

#### Database Best Practices
- Use descriptive model and field names
- Add proper indexes for performance
- Include created/updated timestamps
- Use proper relationships and constraints

```prisma
model Announcement {
  id          String   @id @default(cuid())
  title       String
  content     String
  type        AnnouncementType
  priority    Priority @default(NORMAL)
  isPublished Boolean  @default(false)
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author      User     @relation(fields: [authorId], references: [id])
  
  @@index([type, createdAt])
  @@index([isPublished, priority])
}
```

## 🎨 UI/UX Guidelines

### Islamic Design System

#### Colors
Use the predefined Islamic color palette:
```css
:root {
  --primary: 142 76% 36%;        /* Islamic Green */
  --secondary: 45 100% 51%;      /* Islamic Gold */
  --accent: 210 40% 25%;         /* Islamic Navy */
}
```

#### Typography
- **Body text**: Inter font family
- **Arabic text**: Amiri font with `.arabic` class
- **Numbers**: Use tabular numbers for prayer times

#### Components
- Follow existing component patterns
- Use Shadcn/UI components as base
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Support RTL languages for Arabic content

### Responsive Design
- Mobile-first approach
- Test on common screen sizes (320px, 768px, 1024px, 1440px)
- Ensure prayer times are readable on mobile devices

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// Component testing example
import { render, screen } from '@testing-library/react';
import { AnnouncementCard } from './AnnouncementCard';

describe('AnnouncementCard', () => {
  it('displays announcement title and content', () => {
    const announcement = {
      id: '1',
      title: 'Test Announcement',
      content: 'Test content',
      type: 'GENERAL',
      priority: 'NORMAL'
    };
    
    render(<AnnouncementCard announcement={announcement} />);
    
    expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

### API Testing
```typescript
// API route testing example
import { testClient } from 'hono/testing';
import { app } from '../src/index';

describe('Announcements API', () => {
  it('creates a new announcement', async () => {
    const res = await testClient(app).announcements.$post({
      json: {
        title: 'New Announcement',
        content: 'Test content',
        type: 'GENERAL'
      }
    });
    
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.announcement.title).toBe('New Announcement');
  });
});
```

### Test Coverage
- Aim for **70%+ code coverage**
- Test critical user journeys
- Include edge cases and error scenarios
- Test Islamic-specific features (prayer times, Arabic text)

## 📚 Documentation

### Code Documentation
- Use JSDoc for complex functions
- Document Islamic-specific logic clearly
- Include examples for Islamic calendar calculations

```typescript
/**
 * Calculates prayer times for a given location and date
 * Uses the Aladhan API for accurate Islamic prayer time calculations
 * 
 * @param location - Geographic coordinates
 * @param date - Date for prayer time calculation
 * @param method - Calculation method (default: Islamic Society of North America)
 * @returns Promise resolving to prayer times object
 */
async function getPrayerTimes(
  location: Coordinates,
  date: Date,
  method: CalculationMethod = 'ISNA'
): Promise<PrayerTimes> {
  // Implementation
}
```

### README Updates
When adding new features:
1. Update the main README.md
2. Add API documentation if applicable
3. Include setup instructions for new dependencies

## 🔒 Security Guidelines

### Authentication & Authorization
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Implement proper role-based access control
- Validate all user inputs

### Data Protection
- Hash passwords using bcrypt
- Implement rate limiting on API endpoints
- Sanitize HTML content in announcements
- Use HTTPS in production

### Code Security
- Avoid SQL injection with Prisma's type-safe queries
- Validate file uploads properly
- Implement CORS correctly
- Use security headers

## 🌟 Islamic Feature Contributions

### Prayer Times Integration
- Use reliable Islamic APIs (Aladhan, IslamicFinder)
- Support multiple calculation methods
- Include location-based automatic detection
- Handle timezone conversions properly

### Arabic Text Support
- Use proper Arabic fonts (Amiri)
- Implement RTL text direction
- Support Arabic numerals
- Test with Arabic content

### Islamic Calendar
- Support Hijri date calculations
- Include Islamic holidays and events
- Handle lunar calendar complexities
- Provide Gregorian-Hijri conversion

## 🚀 Performance Guidelines

### Frontend Optimization
- Use Next.js Image component for images
- Implement proper code splitting
- Cache API responses appropriately
- Optimize bundle size

### Backend Performance
- Add database indexes for common queries
- Implement caching for prayer times
- Use connection pooling for database
- Monitor API response times

### Monitoring
- Add error tracking
- Monitor performance metrics
- Track Islamic feature usage
- Set up alerts for critical issues

## 🤝 Community Guidelines

### Communication
- Be respectful and professional
- Use clear, descriptive commit messages
- Provide helpful code review feedback
- Support other contributors

### Islamic Considerations
- Respect Islamic values in all contributions
- Avoid controversial topics
- Focus on building tools for the Muslim community
- Consider diverse Islamic practices and schools of thought

### Code Review Process
- Review for Islamic compliance
- Check for security vulnerabilities
- Verify accessibility standards
- Test Islamic features thoroughly

## 📞 Getting Help

### Resources
- **GitHub Issues**: https://github.com/learnednomad/attaqwa-masjid/issues
- **Discussions**: https://github.com/learnednomad/attaqwa-masjid/discussions
- **Documentation**: Check README.md and CLAUDE.md

### Common Issues
- **Database Connection**: Ensure PostgreSQL is running
- **Prayer Times**: Check API keys and network connectivity
- **Build Errors**: Run `npm run typecheck` to identify issues
- **Test Failures**: Run `npm run test:watch` for debugging

### Islamic Features Help
- **Prayer Time Calculations**: Reference Islamic astronomical data
- **Arabic Text**: Use proper Unicode and RTL support
- **Calendar Conversions**: Implement accurate Hijri calculations

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

**جزاك الله خيراً (JazakAllahu Khayran) - May Allah reward you with good**

Thank you for contributing to the Muslim community through technology!