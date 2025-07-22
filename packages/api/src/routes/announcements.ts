import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { 
  createAnnouncementSchema, 
  updateAnnouncementSchema, 
  announcementQuerySchema,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
  type AnnouncementQuery
} from '@attaqwa/shared';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';
import '../types/hono.js';

const announcements = new Hono();

// Using shared validation schemas from @attaqwa/shared

// Mock data store (replace with Prisma later)
let announcements_store: Array<{
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  imageAlt: string | null;
  pdfUrl: string | null;
  isEvent: boolean;
  eventDate: string | null;
  isActive: boolean;
  isArchived: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: '1',
    title: 'Welcome to Masjid At-Taqwa',
    content: 'We are pleased to announce the opening of our new community center.',
    imageUrl: null,
    imageAlt: null,
    pdfUrl: null,
    isEvent: false,
    eventDate: null,
    isActive: true,
    isArchived: false,
    authorId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Eid ul-Fitr Celebration',
    content: 'Join us for the Eid celebration at the mosque.',
    imageUrl: null,
    imageAlt: null,
    pdfUrl: null,
    isEvent: true,
    eventDate: '2024-04-10T09:00:00Z',
    isActive: true,
    isArchived: false,
    authorId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/announcements
announcements.get('/', zValidator('query', announcementQuerySchema), optionalAuth, async (c) => {
  const { page, limit, isEvent, isActive } = c.req.valid('query');
  
  let filtered = announcements_store.filter(announcement => {
    if (isEvent !== undefined && announcement.isEvent !== isEvent) return false;
    if (isActive !== undefined && announcement.isActive !== isActive) return false;
    return true;
  });
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  const paginatedData = filtered
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

// GET /api/announcements/:id
announcements.get('/:id', optionalAuth, async (c) => {
  const id = c.req.param('id');
  const announcement = announcements_store.find(a => a.id === id);
  
  if (!announcement) {
    return c.json({ error: 'Announcement not found' }, 404);
  }
  
  return c.json({
    data: announcement,
    success: true,
  });
});

// POST /api/announcements
announcements.post('/', requireAuth, requireRole('admin'), zValidator('json', createAnnouncementSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  const newAnnouncement = {
    id: Date.now().toString(),
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt || null,
    pdfUrl: data.pdfUrl || null,
    isEvent: data.isEvent,
    eventDate: data.eventDate || null,
    isActive: true,
    isArchived: false,
    authorId: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  announcements_store.push(newAnnouncement);
  
  return c.json({
    data: newAnnouncement,
    success: true,
  }, 201);
});

// PUT /api/announcements/:id
announcements.put('/:id', requireAuth, requireRole('admin'), zValidator('json', updateAnnouncementSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  const index = announcements_store.findIndex(a => a.id === id);
  if (index === -1) {
    return c.json({ error: 'Announcement not found' }, 404);
  }
  
  const updatedAnnouncement = {
    ...announcements_store[index],
    ...(data.title !== undefined && { title: data.title }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
    ...(data.pdfUrl !== undefined && { pdfUrl: data.pdfUrl }),
    ...(data.isEvent !== undefined && { isEvent: data.isEvent }),
    ...(data.eventDate !== undefined && { eventDate: data.eventDate }),
    updatedAt: new Date().toISOString(),
  };
  
  announcements_store[index] = updatedAnnouncement;
  
  return c.json({
    data: announcements_store[index],
    success: true,
  });
});

// DELETE /api/announcements/:id
announcements.delete('/:id', requireAuth, requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const index = announcements_store.findIndex(a => a.id === id);
  
  if (index === -1) {
    return c.json({ error: 'Announcement not found' }, 404);
  }
  
  announcements_store.splice(index, 1);
  
  return c.json({
    message: 'Announcement deleted successfully',
    success: true,
  });
});

export { announcements as announcementRoutes };