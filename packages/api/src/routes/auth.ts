import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { generateToken, hashPassword, verifyPassword } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import '../types/hono.js';

const auth = new Hono();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// Mock user store (replace with Prisma later)  
const users = new Map<string, {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}>([
  ['admin@attaqwa.org', {
    id: '1',
    email: 'admin@attaqwa.org',
    password: '$2a$12$iKUAW6sSl2XQKcHXioulhutX9RoAGqV96QJTi3O4mnWvIwaYSEkJy', // 'admin123'
    name: 'Admin User',
    role: 'admin',
  }]
]);

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  const user = users.get(email);
  if (!user || !(await verifyPassword(password, user.password))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  
  // Set HTTP-only cookie
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
});

// POST /api/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');
  
  if (users.has(email)) {
    return c.json({ error: 'User already exists' }, 409);
  }
  
  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name,
    role: 'user' as const,
  };
  
  users.set(email, newUser);
  
  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });
  
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });
  
  return c.json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    token,
  }, 201);
});

// GET /api/auth/me
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  const userData = users.get(user.email);
  
  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
  });
});

// POST /api/auth/logout
auth.post('/logout', (c) => {
  setCookie(c, 'token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  
  return c.json({ message: 'Logged out successfully' });
});

export { auth as authRoutes };