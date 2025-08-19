import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'attaqwa-api',
    audience: 'attaqwa-web'
  });
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(c: Context): Promise<UserPayload | null> {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '') || getCookie(c, 'token');
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}