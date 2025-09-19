# Islamic Services Grid Style Guide

**Version**: 2.0 - Production Ready  
**Last Updated**: August 28, 2025  
**Component**: `IslamicServicesGrid`  
**Inspired By**: Mosque Theme Demo - Clean, Professional Islamic Design

## Overview

This style guide documents the design patterns, layout specifications, and interaction behaviors for the Islamic Services Grid component. The design is inspired by modern mosque website themes and follows clean, professional Islamic design principles.

## 🎨 Design Philosophy

### Core Principles
- **Clean & Minimalist**: White backgrounds with subtle borders for professional appearance
- **Islamic Color Harmony**: Green accent colors representing Islamic identity and growth
- **Responsive Excellence**: Mobile-first approach with seamless desktop scaling
- **Accessibility First**: High contrast, keyboard navigation, and screen reader support
- **Community Focused**: Content and design optimized for Islamic community engagement

### Visual Hierarchy
1. **Section Header**: "OUR SERVICES" subtitle with decorative lines
2. **Main Title**: "What We Offer" - Large, prominent typography
3. **Service Grid**: 4x2 responsive grid with uniform card sizing
4. **Call to Action**: Centered contact section with Islamic styling

## 📐 Layout Specifications

### Container Structure
```css
/* Section Container */
.islamic-services-section {
  position: relative;
  padding: 4rem 1rem; /* py-16 px-4 */
  
  /* Responsive padding */
  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem; /* sm:px-6 */
  }
  
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem; /* lg:px-8 */
  }
}

/* Content Container */
.islamic-services-container {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
}
```

### Grid Layout
```css
/* Services Grid */
.islamic-services-grid {
  display: grid;
  gap: 2rem; /* gap-8 */
  
  /* Responsive grid columns */
  grid-template-columns: 1fr; /* mobile: 1 column */
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr); /* tablet: 2 columns */
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr); /* desktop: 4 columns */
  }
}
```

### Spacing System
```css
/* Consistent spacing scale */
:root {
  --spacing-xs: 0.5rem;    /* 8px */
  --spacing-sm: 1rem;      /* 16px */
  --spacing-md: 1.5rem;    /* 24px */
  --spacing-lg: 2rem;      /* 32px */
  --spacing-xl: 3rem;      /* 48px */
  --spacing-2xl: 4rem;     /* 64px */
}

/* Applied spacing */
.header-spacing {
  margin-bottom: 4rem; /* mb-16 */
}

.section-spacing {
  margin-top: 4rem; /* mt-16 */
}

.card-inner-spacing {
  padding: 2rem; /* p-8 */
}
```

## 🎯 Card Design Specifications

### Card Structure
```html
<!-- Service Card Template -->
<div class="service-card">
  <div class="card-content">
    <div class="service-icon">
      <span role="img" aria-label="Service Icon">🕌</span>
    </div>
    <h3 class="service-title">Service Name</h3>
    <p class="service-description">Service description text</p>
  </div>
</div>
```

### Card Styling
```css
/* Base Card Styles */
.service-card {
  position: relative;
  overflow: hidden;
  background-color: white;
  border: 1px solid #e5e7eb; /* border-gray-200 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  height: 16rem; /* h-64 - Fixed height for consistency */
  transition: all 0.3s ease; /* transition-all duration-300 */
}

/* Card Content */
.card-content {
  padding: 2rem; /* p-8 */
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Service Icon */
.service-icon {
  margin-bottom: 1.5rem; /* mb-6 */
  width: 4rem; /* w-16 */
  height: 4rem; /* h-16 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.875rem; /* text-3xl */
  transition: transform 0.3s ease;
  filter: grayscale(1); /* Start grayscale */
}

/* Service Title */
.service-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 700; /* font-bold */
  color: #111827; /* text-gray-900 */
  margin-bottom: 0.5rem; /* mb-2 */
  transition: color 0.3s ease;
}

/* Service Description */
.service-description {
  font-size: 0.875rem; /* text-sm */
  color: #4b5563; /* text-gray-600 */
  line-height: 1.6;
  transition: color 0.3s ease;
}
```

## ✨ Hover Interaction Patterns

### Primary Hover Effects
```css
/* Card Hover State */
.service-card:hover {
  background-color: #10b981; /* bg-islamic-green-500 */
  border-color: #059669; /* border-islamic-green-600 */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05); /* hover:shadow-lg */
}

/* Icon Hover Effects */
.service-card:hover .service-icon {
  transform: scale(1.1); /* group-hover:scale-110 */
  filter: grayscale(0) brightness(0) invert(1); /* White icon on green */
}

/* Text Color Changes */
.service-card:hover .service-title {
  color: white; /* group-hover:text-white */
}

.service-card:hover .service-description {
  color: rgba(255, 255, 255, 0.9); /* group-hover:text-white/90 */
}
```

### Animation Timing
```css
/* Smooth transitions for all interactive elements */
.service-card,
.service-icon,
.service-title,
.service-description {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Slightly faster icon scaling */
.service-icon {
  transition-duration: 300ms;
}
```

## 🎨 Color Palette

### Islamic Green Theme
```css
:root {
  /* Primary Islamic Green */
  --islamic-green-50: #f0fdf4;
  --islamic-green-100: #dcfce7;
  --islamic-green-200: #bbf7d0;
  --islamic-green-300: #86efac;
  --islamic-green-400: #4ade80;
  --islamic-green-500: #10b981;  /* Primary hover color */
  --islamic-green-600: #059669;  /* Border accent */
  --islamic-green-700: #047857;
  --islamic-green-800: #065f46;
  --islamic-green-900: #064e3b;
}

/* Neutral Grays */
:root {
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;   /* Card borders */
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;   /* Description text */
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;   /* Title text */
}
```

### Usage Guidelines
```css
/* Text Colors */
.primary-text { color: var(--gray-900); }      /* Main titles */
.secondary-text { color: var(--gray-600); }   /* Descriptions */
.accent-text { color: var(--islamic-green-600); } /* Subtitles */

/* Background Colors */
.card-bg { background-color: white; }
.hover-bg { background-color: var(--islamic-green-500); }
.section-bg { background-color: var(--gray-50); }

/* Border Colors */
.card-border { border-color: var(--gray-200); }
.hover-border { border-color: var(--islamic-green-400); }
```

## 📱 Responsive Behavior

### Breakpoint System
```css
/* Mobile First Approach */
.islamic-services-grid {
  /* Mobile: 1 column, full width cards */
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .islamic-services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

/* Desktop: 4 columns */
@media (min-width: 1024px) {
  .islamic-services-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

/* Large Desktop: Maintain 4 columns with max-width */
@media (min-width: 1280px) {
  .islamic-services-container {
    max-width: 80rem; /* Prevent cards from becoming too wide */
  }
}
```

### Card Responsiveness
```css
/* Consistent card height across all screens */
.service-card {
  height: 16rem; /* h-64 */
  min-height: 16rem;
}

/* Icon scaling for different screens */
@media (max-width: 639px) {
  .service-icon {
    font-size: 2rem; /* Slightly smaller on mobile */
  }
}

/* Typography scaling */
@media (max-width: 639px) {
  .service-title {
    font-size: 1.125rem; /* text-lg on mobile */
  }
}
```

## 🎪 Header Design Specifications

### Section Header Structure
```html
<div class="section-header">
  <div class="header-decoration">
    <div class="decoration-line"></div>
    <span class="header-subtitle">OUR SERVICES</span>
    <div class="decoration-line"></div>
  </div>
  <h2 class="section-title">What We Offer</h2>
  <p class="section-description">
    Comprehensive Islamic services and community support programs 
    designed to strengthen our faith and brotherhood
  </p>
</div>
```

### Header Styling
```css
/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 4rem; /* mb-16 */
}

/* Decorative Header Elements */
.header-decoration {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
  margin-bottom: 1.5rem; /* mb-6 */
}

.decoration-line {
  width: 3rem; /* w-12 */
  height: 0.125rem; /* h-0.5 */
  background: linear-gradient(to right, transparent, var(--islamic-green-400));
}

.header-subtitle {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: var(--islamic-green-600);
  text-transform: uppercase;
  letter-spacing: 0.1em; /* tracking-wider */
}

/* Main Title */
.section-title {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700; /* font-bold */
  color: var(--gray-900);
  margin-bottom: 1.5rem; /* mb-6 */
  line-height: 1.1;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 3rem; /* lg:text-5xl */
  }
}

/* Section Description */
.section-description {
  font-size: 1.125rem; /* text-lg */
  color: var(--gray-600);
  max-width: 48rem; /* max-w-3xl */
  margin: 0 auto;
  line-height: 1.6;
}
```

## 🎯 Call to Action Section

### CTA Structure
```html
<div class="cta-section">
  <div class="cta-container">
    <p class="cta-description">
      Need assistance with any of our services? 
      Our dedicated team is here to help you.
    </p>
    <a href="/contact" class="cta-button">
      <span>Contact Us</span>
      <span>📞</span>
    </a>
  </div>
</div>
```

### CTA Styling
```css
/* CTA Section */
.cta-section {
  margin-top: 4rem; /* mt-16 */
  text-align: center;
}

.cta-container {
  padding: 2rem; /* p-8 */
  border-radius: 0.75rem; /* rounded-xl */
  background: linear-gradient(
    to right,
    var(--islamic-green-50),
    white,
    var(--islamic-green-50)
  );
  border: 1px solid var(--islamic-green-200);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-width: 32rem; /* max-w-2xl */
  margin: 0 auto;
}

.cta-description {
  color: var(--islamic-navy-600);
  margin-bottom: 1.5rem; /* mb-6 */
  font-size: 1.125rem; /* text-lg */
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
  padding: 1rem 2rem; /* px-8 py-4 */
  background-color: var(--islamic-green-600);
  color: white;
  font-weight: 500; /* font-medium */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
}

.cta-button:hover {
  background-color: var(--islamic-green-700);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
```

## 🔧 Implementation Guidelines

### Component Props Interface
```typescript
interface IslamicServicesGridProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

interface IslamicService {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  iconAlt: string;
}
```

### Service Configuration
```typescript
const islamicServices: IslamicService[] = [
  {
    id: 'salah-prayer',
    name: 'Salah & Prayer',
    description: 'Daily prayer services, Jummah prayers, and spiritual guidance',
    href: '/services/salah-prayer',
    icon: '🕌',
    iconAlt: 'Mosque icon representing prayer services'
  },
  // ... additional services
];
```

### Accessibility Requirements
```html
<!-- ARIA Labels and Roles -->
<section 
  aria-labelledby="islamic-services-heading"
  class="islamic-services-section"
>
  <h2 id="islamic-services-heading" class="section-title">
    What We Offer
  </h2>
  
  <div class="islamic-services-grid" role="grid">
    <a 
      href="/services/salah-prayer"
      class="service-card"
      role="gridcell"
      aria-describedby="service-salah-desc"
    >
      <span 
        role="img" 
        aria-label="Mosque icon representing prayer services"
      >
        🕌
      </span>
      <h3>Salah & Prayer</h3>
      <p id="service-salah-desc">
        Daily prayer services, Jummah prayers, and spiritual guidance
      </p>
    </a>
  </div>
</section>
```

## 🎨 Theme Variations

### Compact Mode
```css
/* Compact variant for sidebar or condensed layouts */
.islamic-services-grid.compact .service-card {
  height: 12rem; /* h-48 */
  padding: 1rem; /* p-4 */
}

.islamic-services-grid.compact .service-icon {
  width: 3rem; /* w-12 */
  height: 3rem; /* h-12 */
  font-size: 1.25rem; /* text-xl */
  margin-bottom: 1rem; /* mb-4 */
}

.islamic-services-grid.compact .service-title {
  font-size: 0.875rem; /* text-sm */
}

.islamic-services-grid.compact .service-description {
  display: none; /* Hide descriptions in compact mode */
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  .service-card {
    background-color: #1f2937; /* bg-gray-800 */
    border-color: #374151; /* border-gray-700 */
  }
  
  .service-title {
    color: #f9fafb; /* text-gray-50 */
  }
  
  .service-description {
    color: #d1d5db; /* text-gray-300 */
  }
  
  .service-card:hover {
    background-color: var(--islamic-green-600);
  }
}
```

## 📋 Quality Checklist

### Pre-Implementation Checklist
- [ ] Confirm Islamic color palette compliance
- [ ] Verify responsive breakpoints work across devices
- [ ] Test hover interactions on touch devices
- [ ] Validate WCAG 2.1 AA accessibility compliance
- [ ] Ensure proper semantic HTML structure
- [ ] Test with screen readers
- [ ] Validate keyboard navigation
- [ ] Check print stylesheet compatibility

### Post-Implementation Validation
- [ ] Visual regression testing across browsers
- [ ] Performance audit (Lighthouse score >90)
- [ ] Cross-device compatibility testing
- [ ] RTL language support validation
- [ ] Color contrast ratio verification (min 4.5:1)
- [ ] Animation performance on low-end devices
- [ ] SEO meta tag validation
- [ ] Analytics event tracking setup

## 🚀 Performance Considerations

### CSS Optimization
```css
/* Use CSS custom properties for efficient theming */
:root {
  --card-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Optimize for GPU acceleration */
.service-card {
  transform: translateZ(0); /* Force GPU layer */
  will-change: transform, background-color;
}

/* Reduce paint operations */
.service-icon {
  contain: layout style paint;
}
```

### Bundle Size Impact
- Base component: ~2.5KB gzipped
- With all animations: ~3.2KB gzipped
- Icons (emoji): No additional bundle size
- Accessibility features: ~0.8KB additional

---

## 📞 Support & Maintenance

**Contact Information**:  
- **Component Owner**: Frontend Team
- **Design Review**: Islamic Design Committee  
- **Accessibility**: A11y Team
- **Performance**: Core Web Vitals Team

**Update Schedule**:  
- Minor updates: Monthly design review
- Major updates: Quarterly with community feedback
- Security patches: As needed
- Performance optimization: Bi-annually

---

*This style guide serves as the single source of truth for Islamic Services Grid implementation. All future development should reference this document to ensure design consistency and brand alignment.*