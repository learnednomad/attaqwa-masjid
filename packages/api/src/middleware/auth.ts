import { Context, Next } from 'hono';
import { getAuthUser, UserPayload } from '../lib/auth.js';

export interface AuthContext extends Context {
  get(key: 'user'): UserPayload;
  set(key: 'user', value: UserPayload): void;
}

export async function requireAuth(c: Context, next: Next) {
  const user = await getAuthUser(c);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('user', user);
  await next();
}

export function requireRole(...allowedRoles: ('admin' | 'teacher' | 'moderator' | 'user')[]) {
  return async function(c: Context, next: Next) {
    const user = c.get('user') as UserPayload;
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userRole = user.role || 'user';
    
    if (!allowedRoles.includes(userRole as any)) {
      return c.json({ 
        error: `Forbidden - Required role: ${allowedRoles.join(' or ')}` 
      }, 403);
    }
    
    await next();
  };
}

export const adminOnly = requireRole('admin');
export const teacherOrAdmin = requireRole('admin', 'teacher');
export const moderatorOrHigher = requireRole('admin', 'moderator');

export async function optionalAuth(c: Context, next: Next) {
  const user = await getAuthUser(c);
  if (user) {
    c.set('user', user);
  }
  await next();
}