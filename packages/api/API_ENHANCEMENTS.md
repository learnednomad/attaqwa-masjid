# API Enhancements - Attaqwa Masjid

This document outlines the comprehensive API enhancements made to support Islamic community needs with production-ready reliability and mobile optimization.

## 🕌 Enhanced Prayer Times API

### Features Added
- ✅ **Intelligent Caching** - 1-hour TTL with in-memory cache
- ✅ **Islamic Calendar Integration** - Hijri date calculation
- ✅ **Qibla Direction Calculation** - Precise bearing to Kaaba
- ✅ **Multiple Calculation Methods** - Support for different schools
- ✅ **Coordinate-based Lookup** - GPS coordinates support
- ✅ **Batch Operations** - Week/month prayer time fetching
- ✅ **Next Prayer Calculation** - Real-time next prayer info
- ✅ **Fallback System** - Graceful degradation when API fails
- ✅ **Health Monitoring** - Service health check endpoint

### New Endpoints

#### GET `/api/prayer-times`
Enhanced with caching, Islamic calendar, and better error handling.
```javascript
// Query parameters
{
  date?: string,          // YYYY-MM-DD format
  city?: string,          // Default: 'Toronto'
  country?: string,       // Default: 'Canada' 
  method?: string,        // Calculation method ID
  school?: string,        // Alternative to method
  latitude?: number,      // GPS coordinates
  longitude?: number      // GPS coordinates
}

// Response
{
  data: {
    date: string,
    fajr: string,
    sunrise: string,
    dhuhr: string,
    asr: string,
    maghrib: string,
    isha: string,
    qibla: number,
    location: {
      city: string,
      country: string,
      timezone: string,
      latitude?: number,
      longitude?: number
    },
    islamicDate: {
      day: number,
      month: number,
      year: number,
      monthName: string,
      formatted: string
    },
    method: {
      id: number,
      name: string
    }
  },
  success: boolean,
  cached: boolean,
  timestamp: string
}
```

#### GET `/api/prayer-times/qibla`
Calculate Qibla direction from any coordinates.
```javascript
// Query parameters
{
  latitude: number,    // Required: -90 to 90
  longitude: number    // Required: -180 to 180
}

// Response
{
  data: {
    latitude: number,
    longitude: number,
    qiblaDirection: number,     // Precise bearing
    compassBearing: number,     // Rounded for compass
    kaaba: {
      latitude: 21.4225,
      longitude: 39.8262
    }
  }
}
```

#### GET `/api/prayer-times/islamic-date`
Convert Gregorian to Islamic date.
```javascript
// Query parameters
{
  date?: string,        // YYYY-MM-DD, default: today
  adjustment?: number   // -2 to 2, default: 0
}
```

#### GET `/api/prayer-times/next-prayer`
Get next upcoming prayer with timing info.

## 📱 Comprehensive Notification System

### Features Added
- ✅ **Prayer Time Reminders** - Configurable reminders before prayers
- ✅ **Push Notifications** - iOS/Android/Web support
- ✅ **Email & SMS Support** - Multi-channel notifications
- ✅ **Islamic Event Alerts** - Ramadan, Eid, Hajj notifications
- ✅ **Webhook Integration** - Third-party system integration
- ✅ **User Preferences** - Granular notification control
- ✅ **Admin Broadcasting** - Mass notification system
- ✅ **Scheduling System** - Future notification scheduling
- ✅ **Delivery Tracking** - Success/failure monitoring

### Endpoints

#### GET/PUT `/api/notifications/preferences`
Manage user notification preferences.
```javascript
// Preference object
{
  prayerReminders: {
    enabled: boolean,
    beforeMinutes: number[],    // [5, 15, 30]
    prayers: string[]           // ['fajr', 'dhuhr', ...]
  },
  announcements: {
    enabled: boolean,
    categories: string[],       // ['general', 'events']
    priority: 'low'|'medium'|'high'|'urgent'
  },
  islamicEvents: {
    enabled: boolean,
    events: string[],           // ['ramadan', 'eid']
    beforeDays: number
  },
  methods: {
    push: boolean,
    email: boolean,
    sms: boolean
  }
}
```

#### POST `/api/notifications/push-token`
Register device for push notifications.
```javascript
{
  token: string,              // FCM/APNS token
  platform: 'ios'|'android'|'web',
  deviceId?: string
}
```

#### POST `/api/notifications/send` (Admin/Moderator)
Send notifications to users.
```javascript
{
  title: string,
  body: string,
  type: 'prayer'|'announcement'|'islamic_event'|'general',
  priority: 'low'|'medium'|'high'|'urgent',
  scheduledFor?: string,      // ISO datetime
  recipients: {
    userIds?: string[],
    roles?: string[],
    ageTiers?: string[],
    all?: boolean
  }
}
```

#### Webhook Management
- `POST /api/notifications/webhooks` - Create webhook
- `GET /api/notifications/webhooks` - List webhooks
- `DELETE /api/notifications/webhooks/:id` - Delete webhook

## 💰 Islamic Donations & Payment System

### Features Added
- ✅ **Zakat Calculator** - Comprehensive wealth assessment
- ✅ **Multiple Donation Types** - Zakat, Sadaqah, Fidya, Kaffarah
- ✅ **Stripe Integration** - Secure payment processing
- ✅ **Recurring Donations** - Automated giving
- ✅ **Islamic Receipts** - Tax-deductible receipts with Islamic elements
- ✅ **Nisab Tracking** - Real-time gold/silver prices
- ✅ **Anonymous Donations** - Privacy protection
- ✅ **Multi-currency Support** - USD, CAD, EUR, GBP
- ✅ **Admin Analytics** - Donation statistics and reporting

### Donation Types Supported
```javascript
{
  zakat: {
    name: 'Zakat',
    description: 'Obligatory charity - pillar of Islam',
    rate: 0.025,      // 2.5%
    minimumAmount: 1
  },
  sadaqah: {
    name: 'Sadaqah', 
    description: 'Voluntary charity',
    minimumAmount: 1
  },
  fidya: {
    name: 'Fidya',
    description: 'Compensation for missed fasts',
    minimumAmount: 10
  },
  kaffarah: {
    name: 'Kaffarah',
    description: 'Expiation for breaking oath/fast',
    minimumAmount: 600
  },
  // ... additional types
}
```

### Key Endpoints

#### POST `/api/donations/calculate-zakat`
Comprehensive zakat calculation.
```javascript
// Request
{
  assets: {
    cash: number,
    savings: number,
    gold: {
      weight: number,         // grams
      purity: number,         // karat (1-24)
      currentPrice?: number   // per gram
    },
    silver: {
      weight: number,
      currentPrice?: number
    },
    stocks: number,
    bonds: number,
    businessAssets: number,
    cryptocurrency: number,
    otherInvestments: number
  },
  liabilities: {
    debt: number,
    mortgages: number,
    loans: number,
    creditCards: number,
    otherLiabilities: number
  },
  currency: 'USD'|'CAD'|'EUR'|'GBP'
}

// Response
{
  data: {
    calculationId: string,
    totalAssets: number,
    totalLiabilities: number,
    netWealth: number,
    nisabThreshold: number,
    goldNisab: number,
    silverNisab: number,
    isEligible: boolean,
    zakatAmount: number,
    zakatRate: 0.025,
    currency: string,
    calculatedAt: string
  }
}
```

#### GET `/api/donations/nisab-rates`
Current nisab rates and precious metal prices.

#### POST `/api/donations/create-payment-intent`
Initiate donation payment.
```javascript
{
  amount: number,
  currency: string,
  type: string,               // donation type
  isRecurring?: boolean,
  recurringFrequency?: string,
  anonymousDonation?: boolean,
  dedicatedTo?: string,       // memorial/honor
  message?: string
}
```

#### GET `/api/donations/my-donations`
User's donation history with Islamic receipts.

## 📱 Mobile API Optimizations

### Features Added
- ✅ **Response Compression** - Gzip compression
- ✅ **Field Selection** - `?fields=name,date,amount`
- ✅ **Field Exclusion** - `?exclude=metadata,internal`
- ✅ **API Versioning** - Header/query parameter versioning
- ✅ **Mobile-Optimized Responses** - Smaller payloads for mobile
- ✅ **Network-Aware Optimization** - Save-Data header support
- ✅ **Rate Limiting** - Higher limits for mobile devices
- ✅ **Performance Monitoring** - Response size/time tracking
- ✅ **Caching Strategy** - Longer cache for mobile devices

### Usage Examples

#### Field Selection
```javascript
// Include only specific fields
GET /api/prayer-times?fields=date,fajr,maghrib,qibla

// Exclude heavy fields  
GET /api/announcements?exclude=content,imageUrl,pdfUrl

// Mobile-optimized format
GET /api/events?format=mobile
```

#### API Versioning
```javascript
// Via header
Headers: { 'API-Version': '2.0' }

// Via query parameter  
GET /api/prayer-times?v=2.0
```

#### Network-Aware Optimization
```javascript
// Client sends Save-Data header for slow connections
Headers: { 
  'Save-Data': 'on',
  'Connection-Type': '2g' 
}

// API responds with ultra-optimized payload
```

### Mobile Middleware Features

1. **Automatic Compression** - Gzip for responses > 1KB
2. **Intelligent Caching** - 2x longer cache for mobile devices
3. **Size Monitoring** - Track request/response sizes
4. **Rate Limiting** - 1000 req/hour for mobile vs 500 for desktop
5. **Error Optimization** - Simplified error responses for mobile

## 🔧 Infrastructure Enhancements

### Error Handling
- Comprehensive error types (ValidationError, AuthError)
- Request ID tracking for debugging
- Graceful fallback systems
- Detailed error logging

### Performance Features
- In-memory caching with TTL
- Request batching for external APIs  
- Connection pooling
- Response size optimization

### Security Improvements
- Rate limiting with user agent detection
- Input validation with Zod schemas
- CORS configuration for mobile apps
- Secure webhook signature verification

### Monitoring & Health Checks
- Service health endpoints for all modules
- Performance metrics collection
- Error rate tracking
- Islamic-specific analytics

## 🚀 Production Deployment Considerations

### Environment Variables Required
```env
# External APIs
ALADHAN_API_URL=https://api.aladhan.com
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# Notification Services
FIREBASE_SERVER_KEY=...
SENDGRID_API_KEY=...
TWILIO_AUTH_TOKEN=...

# App Configuration
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=...
DATABASE_URL=...
```

### Scaling Recommendations
1. **Redis Cache** - Replace in-memory cache with Redis
2. **Message Queue** - Use Redis/RabbitMQ for notifications
3. **Database Optimization** - Add indexes for prayer times, donations
4. **CDN Integration** - Serve static assets via CDN
5. **Load Balancing** - Multiple API instances behind load balancer

### Monitoring Setup
1. **Error Tracking** - Sentry integration
2. **Performance Monitoring** - New Relic/DataDog
3. **Uptime Monitoring** - Prayer times API availability
4. **Business Metrics** - Donation volumes, notification delivery rates

## 📚 Integration Examples

### React Native App Integration
```javascript
// Prayer times with caching
const prayerTimes = await api.get('/prayer-times', {
  params: { latitude: 43.6532, longitude: -79.3832 },
  headers: { 'API-Version': '2.0' }
});

// Zakat calculation
const zakatResult = await api.post('/donations/calculate-zakat', {
  assets: { cash: 10000, savings: 5000 },
  liabilities: { debt: 0 },
  currency: 'CAD'
});

// Register for notifications
await api.post('/notifications/push-token', {
  token: fcmToken,
  platform: 'android'
});
```

### Webhook Integration
```javascript
// External system webhook handler
app.post('/webhook/masjid-notifications', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = req.body;
  
  if (verifySignature(payload, signature, webhookSecret)) {
    handleNotification(payload);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Unauthorized');
  }
});
```

## 🎯 Key Benefits

1. **Islamic Community Focus** - Purpose-built for Islamic organizations
2. **Mobile-First Design** - Optimized for smartphone users
3. **Production Ready** - Comprehensive error handling and monitoring
4. **Extensible Architecture** - Easy to add new features
5. **Developer Friendly** - Full TypeScript support and clear documentation
6. **Performance Optimized** - Caching, compression, and field selection
7. **Secure by Design** - Rate limiting, input validation, secure payments

The API now provides a complete foundation for Islamic community applications with modern performance optimization and mobile-first design principles.