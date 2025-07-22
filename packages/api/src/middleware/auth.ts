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

export function requireRole(role: 'admin' | 'user') {
  return async function(c: Context, next: Next) {
    const user = c.get('user') as UserPayload;
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    if (role === 'admin' && user.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }
    
    await next();
  };
}

export async function optionalAuth(c: Context, next: Next) {
  const user = await getAuthUser(c);
  if (user) {
    c.set('user', user);
  }
  await next();
}