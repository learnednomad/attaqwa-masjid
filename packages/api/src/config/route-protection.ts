/**
 * Route Protection Configuration
 * Defines which routes require authentication and what roles can access them
 */

export const RouteProtection = {
  // Public routes - no authentication required
  public: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/prayer-times',
    '/api/prayer-times/qibla',
    '/api/announcements/public',
    '/api/events/public',
    '/api/quran/structure',
    '/api/quran/surah/:number', // Public but shows personalized data if authenticated
    '/api/quran/qaris',
    '/api/quran/audio/:surah/:ayah',
    '/api/halaqah/upcoming', // Public but can be filtered if authenticated
    '/api/halaqah/recordings/:sessionId', // Only public recordings shown
  ],

  // Authenticated user routes - any logged-in user
  authenticated: [
    '/api/auth/me',
    '/api/auth/logout',
    '/api/user/profile',
    '/api/user/settings',
    '/api/user/family',
    '/api/education/content/age-appropriate',
    '/api/education/progress',
    '/api/education/enroll',
    '/api/quran/progress',
    '/api/quran/recording',
    '/api/quran/overview',
    '/api/quran/goals',
    '/api/quran/session/start',
    '/api/quran/session/:id/end',
    '/api/halaqah/join/:sessionId',
    '/api/halaqah/interact',
    '/api/halaqah/feedback/:sessionId',
    '/api/donations/create',
    '/api/donations/history',
    '/api/notifications/subscribe',
    '/api/notifications/unsubscribe',
  ],

  // Parent-only routes
  parent: [
    '/education/parent/dashboard',
    '/education/parent/children',
    '/education/parent/restrictions',
    '/education/parent/screen-time',
    '/education/parent/progress/:childId',
  ],

  // Teacher routes
  teacher: [
    '/teacher/content/create',
    '/teacher/content/my',
    '/teacher/content/save',
    '/teacher/content/publish',
    '/teacher/templates',
    '/teacher/media/upload',
    '/teacher/media/library',
    '/teacher/assessments/create',
    '/teacher/questions/bank',
    '/teacher/analytics',
    '/halaqah/create',
    '/halaqah/start/:sessionId',
    '/halaqah/end/:sessionId',
    '/halaqah/breakout/create',
    '/halaqah/teacher/sessions',
    '/education/classes/create',
    '/education/homework/assign',
    '/education/students/progress',
  ],

  // Moderator routes
  moderator: [
    '/announcements/create',
    '/announcements/update/:id',
    '/announcements/delete/:id',
    '/events/create',
    '/events/update/:id',
    '/events/delete/:id',
    '/content/review',
    '/content/approve/:id',
    '/content/reject/:id',
    '/users/reports',
    '/moderation/flags',
  ],

  // Admin-only routes
  admin: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/users/:id/role',
    '/admin/users/:id/suspend',
    '/admin/analytics',
    '/admin/settings',
    '/admin/backup',
    '/admin/logs',
    '/monitoring/metrics',
    '/monitoring/health',
    '/monitoring/errors',
    '/system/cache/clear',
    '/system/maintenance',
  ],

  // Rate-limited routes (requests per minute)
  rateLimited: {
    '/api/auth/login': 5,
    '/api/auth/register': 3,
    '/api/auth/forgot-password': 3,
    '/api/donations/create': 10,
    '/api/teacher/media/upload': 5,
    '/api/quran/recording': 10,
    '/api/halaqah/create': 5,
  },

  // Routes requiring special validation
  specialValidation: {
    '/donations/create': ['payment-validation'],
    '/teacher/content/publish': ['content-moderation'],
    '/halaqah/create': ['schedule-conflict-check'],
    '/education/parent/restrictions': ['age-verification'],
  },
};

/**
 * Helper function to check if a route requires authentication
 */
export function requiresAuth(path: string): boolean {
  // Check if it's explicitly public
  if (RouteProtection.public.some(route => matchRoute(path, route))) {
    return false;
  }
  
  // Everything else requires auth by default
  return true;
}

/**
 * Helper function to get required role for a route
 */
export function getRequiredRole(path: string): string[] | null {
  if (RouteProtection.admin.some(route => matchRoute(path, route))) {
    return ['admin'];
  }
  
  if (RouteProtection.moderator.some(route => matchRoute(path, route))) {
    return ['admin', 'moderator'];
  }
  
  if (RouteProtection.teacher.some(route => matchRoute(path, route))) {
    return ['admin', 'teacher'];
  }
  
  if (RouteProtection.parent.some(route => matchRoute(path, route))) {
    return ['parent', 'admin'];
  }
  
  if (RouteProtection.authenticated.some(route => matchRoute(path, route))) {
    return ['user', 'parent', 'teacher', 'moderator', 'admin'];
  }
  
  return null;
}

/**
 * Helper function to get rate limit for a route
 */
export function getRateLimit(path: string): number | null {
  for (const [route, limit] of Object.entries(RouteProtection.rateLimited)) {
    if (matchRoute(path, route)) {
      return limit;
    }
  }
  return null;
}

/**
 * Helper function to match route patterns
 */
function matchRoute(path: string, pattern: string): boolean {
  // Convert route pattern to regex
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
    .replace(/\//g, '\\/'); // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Middleware factory to protect routes based on configuration
 */
export function createRouteProtection() {
  return async (c: any, next: any) => {
    const path = c.req.path;
    
    // Check if route requires authentication
    if (!requiresAuth(path)) {
      return next();
    }
    
    // For authenticated routes, let the route-specific middleware handle auth
    // This middleware only handles role-based protection after auth
    const requiredRoles = getRequiredRole(path);
    if (requiredRoles) {
      // Import auth function dynamically to avoid circular dependency
      const { getAuthUser } = await import('../lib/auth.js');
      const user = await getAuthUser(c);
      
      if (!user) {
        return c.json({ error: 'Authentication required' }, 401);
      }
      
      // Set user in context for route handlers
      c.set('user', user);
      
      const userRole = user.role || 'user';
      if (!requiredRoles.includes(userRole)) {
        return c.json({ 
          error: `Forbidden - Required role: ${requiredRoles.join(' or ')}` 
        }, 403);
      }
    }
    
    // Check rate limiting
    const rateLimit = getRateLimit(path);
    if (rateLimit) {
      // Implement rate limiting logic here
      // This would typically use Redis or in-memory store
    }
    
    return next();
  };
}