import { Context, Next } from 'hono';
import { compress } from 'hono/compress';
import { z } from 'zod';

// API versioning middleware
export const apiVersioning = () => {
  return async (c: Context, next: Next) => {
    const version = c.req.header('API-Version') || c.req.query('v') || '1.0';
    const acceptedVersions = ['1.0', '1.1', '2.0'];
    
    if (!acceptedVersions.includes(version)) {
      return c.json({
        error: 'Unsupported API version',
        message: `Supported versions: ${acceptedVersions.join(', ')}`,
        currentVersion: version,
        supportedVersions: acceptedVersions,
        success: false
      }, 400);
    }
    
    c.set('apiVersion', version);
    c.header('API-Version', version);
    c.header('API-Supported-Versions', acceptedVersions.join(', '));
    
    await next();
  };
};

// Response compression middleware
export const mobileCompression = () => {
  return compress({
    encoding: 'gzip',
  });
};

// Field selection middleware for reducing payload size
export const fieldSelection = () => {
  return async (c: Context, next: Next) => {
    await next();
    
    // Only process JSON responses
    const contentType = c.res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return;
    }
    
    const fields = c.req.query('fields');
    const exclude = c.req.query('exclude');
    
    if (!fields && !exclude) {
      return;
    }
    
    try {
      const responseBody = await c.res.json();
      
      if (responseBody && typeof responseBody === 'object') {
        let modifiedBody = responseBody;
        
        // Apply field selection
        if (fields) {
          const selectedFields = fields.split(',').map(f => f.trim());
          modifiedBody = selectFields(modifiedBody, selectedFields);
        }
        
        // Apply field exclusion
        if (exclude) {
          const excludedFields = exclude.split(',').map(f => f.trim());
          modifiedBody = excludeFields(modifiedBody, excludedFields);
        }
        
        // Create new response with modified body
        const newResponse = new Response(JSON.stringify(modifiedBody), {
          status: c.res.status,
          headers: {
            ...Object.fromEntries(c.res.headers.entries()),
            'X-Fields-Applied': 'true',
          },
        });
        
        // Replace the response
        c.res = newResponse;
      }
    } catch (error) {
      console.error('Field selection error:', error);
      // Continue with original response on error
    }
  };
};

// Pagination middleware optimized for mobile
export const mobilePagination = () => {
  return async (c: Context, next: Next) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100); // Max 100 items
    const offset = (page - 1) * limit;
    
    // Detect mobile user agent for smaller default page sizes
    const userAgent = c.req.header('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    const mobileLimit = isMobile ? Math.min(limit, 10) : limit; // Smaller pages for mobile
    
    c.set('pagination', {
      page: Math.max(1, page),
      limit: mobileLimit,
      offset: Math.max(0, offset),
      isMobile,
    });
    
    await next();
  };
};

// Response caching middleware for mobile
export const mobileCache = (maxAge = 300) => {
  return async (c: Context, next: Next) => {
    const userAgent = c.req.header('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    // Longer cache for mobile devices to reduce data usage
    const cacheMaxAge = isMobile ? maxAge * 2 : maxAge;
    
    c.header('Cache-Control', `public, max-age=${cacheMaxAge}`);
    c.header('X-Mobile-Optimized', isMobile.toString());
    
    await next();
  };
};

// Request/Response size monitoring
export const sizeMonitoring = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    
    // Get request size
    const requestSize = c.req.header('Content-Length') || '0';
    
    await next();
    
    // Get response size (approximate)
    const responseBody = await c.res.text();
    const responseSize = new TextEncoder().encode(responseBody).length;
    
    // Log metrics for mobile optimization
    const userAgent = c.req.header('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    if (isMobile) {
      console.log('Mobile API Metrics:', {
        endpoint: c.req.path,
        method: c.req.method,
        requestSize: parseInt(requestSize),
        responseSize,
        processingTime: Date.now() - startTime,
        userAgent: userAgent.substring(0, 50),
      });
    }
    
    // Add performance headers
    c.header('X-Response-Size', responseSize.toString());
    c.header('X-Processing-Time', `${Date.now() - startTime}ms`);
    
    // Recreate response with original body
    c.res = new Response(responseBody, {
      status: c.res.status,
      headers: c.res.headers,
    });
  };
};

// Lightweight response format for mobile
export const mobileFormat = () => {
  return async (c: Context, next: Next) => {
    const format = c.req.query('format');
    const userAgent = c.req.header('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    // Auto-apply mobile format for mobile devices
    const shouldOptimize = format === 'mobile' || (isMobile && format !== 'full');
    
    if (shouldOptimize) {
      c.set('mobileFormat', true);
    }
    
    await next();
    
    if (shouldOptimize) {
      try {
        const responseBody = await c.res.json();
        const optimizedBody = optimizeForMobile(responseBody);
        
        c.res = new Response(JSON.stringify(optimizedBody), {
          status: c.res.status,
          headers: {
            ...Object.fromEntries(c.res.headers.entries()),
            'X-Mobile-Optimized': 'true',
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Mobile format optimization error:', error);
      }
    }
  };
};

// Rate limiting with mobile considerations
export const mobileRateLimit = () => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 
                    c.req.header('X-Forwarded-For') || 
                    c.req.header('X-Real-IP') || 
                    'unknown';
    
    const userAgent = c.req.header('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    // Higher limits for mobile devices (they tend to make more frequent small requests)
    const limit = isMobile ? 1000 : 500; // per hour
    const windowMs = 60 * 60 * 1000; // 1 hour
    
    const key = `${clientIP}-${isMobile ? 'mobile' : 'desktop'}`;
    const now = Date.now();
    
    let requestInfo = requestCounts.get(key);
    
    if (!requestInfo || now > requestInfo.resetTime) {
      requestInfo = { count: 0, resetTime: now + windowMs };
    }
    
    requestInfo.count++;
    requestCounts.set(key, requestInfo);
    
    if (requestInfo.count > limit) {
      return c.json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${limit} per hour`,
        retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000),
        success: false,
      }, 429);
    }
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', (limit - requestInfo.count).toString());
    c.header('X-RateLimit-Reset', requestInfo.resetTime.toString());
    
    await next();
  };
};

// Utility functions

function selectFields(obj: any, fields: string[]): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => selectFields(item, fields));
  }
  
  const result: any = {};
  
  for (const field of fields) {
    if (field.includes('.')) {
      // Handle nested fields like 'user.name'
      const [parent, ...rest] = field.split('.');
      if (obj[parent] && !result[parent]) {
        result[parent] = selectFields(obj[parent], [rest.join('.')]);
      }
    } else if (obj.hasOwnProperty(field)) {
      result[field] = obj[field];
    }
  }
  
  return result;
}

function excludeFields(obj: any, excludeFields: string[]): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => excludeFields(item, excludeFields));
  }
  
  const result = { ...obj };
  
  for (const field of excludeFields) {
    if (field.includes('.')) {
      // Handle nested fields
      const [parent, ...rest] = field.split('.');
      if (result[parent]) {
        result[parent] = excludeFields(result[parent], [rest.join('.')]);
      }
    } else {
      delete result[field];
    }
  }
  
  return result;
}

function optimizeForMobile(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => optimizeForMobile(item));
  }
  
  const optimized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip null/undefined values to reduce payload
    if (value == null) {
      continue;
    }
    
    // Truncate long strings (except for content fields)
    if (typeof value === 'string' && value.length > 200 && !['content', 'description', 'body'].includes(key)) {
      optimized[key] = value.substring(0, 200) + '...';
    }
    // Recursively optimize objects
    else if (typeof value === 'object') {
      const optimizedValue = optimizeForMobile(value);
      if (Object.keys(optimizedValue).length > 0) {
        optimized[key] = optimizedValue;
      }
    }
    // Keep other values as is
    else {
      optimized[key] = value;
    }
  }
  
  return optimized;
}

// Validation schemas for mobile optimization parameters
export const mobileQuerySchema = z.object({
  fields: z.string().optional(),
  exclude: z.string().optional(),
  format: z.enum(['full', 'mobile']).optional(),
  compress: z.boolean().optional(),
  v: z.string().optional(), // API version
});

// Error response formatter optimized for mobile
export const mobileErrorHandler = () => {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      console.error('API Error:', error);
      
      const userAgent = c.req.header('User-Agent') || '';
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      
      const errorResponse = {
        error: error instanceof Error ? error.message : 'Internal Server Error',
        success: false,
        timestamp: new Date().toISOString(),
        // Include additional debug info for non-mobile or development
        ...((!isMobile || process.env.NODE_ENV === 'development') && {
          stack: error instanceof Error ? error.stack : undefined,
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        }),
      };
      
      return c.json(errorResponse, 500);
    }
  };
};

// Network-aware response optimization
export const networkAwareOptimization = () => {
  return async (c: Context, next: Next) => {
    const networkHint = c.req.header('Save-Data') || c.req.header('Network-Information');
    const connectionType = c.req.header('Connection-Type');
    
    // Detect slow connection indicators
    const isSlowConnection = networkHint === 'on' || 
                           connectionType === '2g' || 
                           connectionType === 'slow-2g';
    
    if (isSlowConnection) {
      c.set('optimizeForSlowConnection', true);
      c.header('X-Optimized-For-Slow-Connection', 'true');
    }
    
    await next();
    
    // Apply additional optimizations for slow connections
    if (isSlowConnection) {
      try {
        const responseBody = await c.res.json();
        const ultraOptimized = ultraOptimizeForSlowConnection(responseBody);
        
        c.res = new Response(JSON.stringify(ultraOptimized), {
          status: c.res.status,
          headers: {
            ...Object.fromEntries(c.res.headers.entries()),
            'X-Ultra-Optimized': 'true',
          },
        });
      } catch (error) {
        console.error('Network-aware optimization error:', error);
      }
    }
  };
};

function ultraOptimizeForSlowConnection(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    // Limit array size for slow connections
    const limited = data.slice(0, 5);
    return limited.map(item => ultraOptimizeForSlowConnection(item));
  }
  
  const optimized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip optional fields for slow connections
    const optionalFields = [
      'imageUrl', 'imageAlt', 'pdfUrl', 'description', 
      'metadata', 'extras', 'createdAt', 'updatedAt'
    ];
    
    if (optionalFields.includes(key)) {
      continue;
    }
    
    if (value != null) {
      if (typeof value === 'string' && value.length > 100) {
        optimized[key] = value.substring(0, 100) + '...';
      } else if (typeof value === 'object') {
        const optimizedValue = ultraOptimizeForSlowConnection(value);
        if (Object.keys(optimizedValue).length > 0) {
          optimized[key] = optimizedValue;
        }
      } else {
        optimized[key] = value;
      }
    }
  }
  
  return optimized;
}