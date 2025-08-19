import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { generateToken, hashPassword, verifyPassword } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '@attaqwa/db';
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
  ageTier: z.enum(['CHILDREN', 'YOUTH', 'ADULTS', 'SENIORS', 'ALL_AGES']).optional(),
});

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        ageTier: true,
        isActive: true,
      },
    });
    
    if (!user || !user.isActive || !(await verifyPassword(password, user.password))) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase() as 'admin' | 'moderator' | 'user',
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
        role: user.role.toLowerCase(),
        ageTier: user.ageTier,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, name, ageTier } = c.req.valid('json');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }
    
    const hashedPassword = await hashPassword(password);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        ageTier: ageTier || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ageTier: true,
      },
    });
    
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role.toLowerCase() as 'admin' | 'moderator' | 'user',
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
        role: newUser.role.toLowerCase(),
        ageTier: newUser.ageTier,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/auth/me
auth.get('/me', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ageTier: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    if (!userData || !userData.isActive) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role.toLowerCase(),
        ageTier: userData.ageTier,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
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