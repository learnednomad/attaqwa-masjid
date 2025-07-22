import { UserPayload } from '../lib/auth.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: UserPayload;
  }
}