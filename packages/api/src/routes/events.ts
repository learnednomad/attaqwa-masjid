import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js';
import '../types/hono.js';

const events = new Hono();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  date: z.string().datetime(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  isIndoor: z.boolean().default(false),
  isOutdoor: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().optional(),
});

const updateEventSchema = createEventSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  upcoming: z.string().transform(val => val === 'true').optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
});

// Mock data store
let events_store: Array<{
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  isIndoor: boolean;
  isOutdoor: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: '1',
    title: 'Friday Prayer',
    description: 'Weekly Friday prayer service',
    date: '2024-01-26T12:30:00Z',
    startTime: '12:30',
    endTime: '13:00',
    location: 'Main Prayer Hall',
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    imageAlt: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Community Iftar',
    description: 'Join us for a community iftar during Ramadan',
    date: '2024-03-15T18:00:00Z',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Community Hall',
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    imageAlt: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/events
events.get('/', zValidator('query', querySchema), optionalAuth, async (c) => {
  const { page, limit, upcoming, isActive } = c.req.valid('query');
  
  let filtered = events_store.filter(event => {
    if (isActive !== undefined && event.isActive !== isActive) return false;
    if (upcoming !== undefined) {
      const eventDate = new Date(event.date);
      const now = new Date();
      if (upcoming && eventDate <= now) return false;
      if (!upcoming && eventDate > now) return false;
    }
    return true;
  });
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  const paginatedData = filtered
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(offset, offset + limit);
  
  return c.json({
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    success: true,
  });
});

// GET /api/events/:id
events.get('/:id', optionalAuth, async (c) => {
  const id = c.req.param('id');
  const event = events_store.find(e => e.id === id);
  
  if (!event) {
    return c.json({ error: 'Event not found' }, 404);
  }
  
  return c.json({
    data: event,
    success: true,
  });
});

// POST /api/events
events.post('/', requireAuth, requireRole('admin'), zValidator('json', createEventSchema), async (c) => {
  const data = c.req.valid('json');
  
  const newEvent = {
    id: Date.now().toString(),
    title: data.title,
    description: data.description,
    date: data.date,
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    location: data.location || null,
    isIndoor: data.isIndoor,
    isOutdoor: data.isOutdoor,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  events_store.push(newEvent);
  
  return c.json({
    data: newEvent,
    success: true,
  }, 201);
});

// PUT /api/events/:id
events.put('/:id', requireAuth, requireRole('admin'), zValidator('json', updateEventSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  const index = events_store.findIndex(e => e.id === id);
  if (index === -1) {
    return c.json({ error: 'Event not found' }, 404);
  }
  
  events_store[index] = {
    ...events_store[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  return c.json({
    data: events_store[index],
    success: true,
  });
});

// DELETE /api/events/:id
events.delete('/:id', requireAuth, requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const index = events_store.findIndex(e => e.id === id);
  
  if (index === -1) {
    return c.json({ error: 'Event not found' }, 404);
  }
  
  events_store.splice(index, 1);
  
  return c.json({
    message: 'Event deleted successfully',
    success: true,
  });
});

export { events as eventRoutes };