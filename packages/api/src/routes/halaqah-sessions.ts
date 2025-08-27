import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { PrismaClient } from '@attaqwa/db';
import { randomBytes } from 'crypto';

// JWT middleware with proper secret
const jwtAuth = jwt({ secret: process.env.JWT_SECRET || 'default-jwt-secret' });

const prisma = new PrismaClient();
const halaqah = new Hono();

// Validation schemas
const CreateSessionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  sessionType: z.enum(['live', 'scheduled', 'recorded']),
  ageGroups: z.array(z.string()),
  subjectId: z.string().optional(),
  maxParticipants: z.number().min(2).max(100).default(30),
  isPublic: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  language: z.string().default('en'),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  tags: z.array(z.string()).optional(),
});

const SessionInteractionSchema = z.object({
  sessionId: z.string(),
  interactionType: z.enum(['question', 'poll_response', 'quiz_answer', 'reaction', 'chat_message']),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  isAnonymous: z.boolean().default(false),
});

const BreakoutRoomSchema = z.object({
  sessionId: z.string(),
  roomName: z.string(),
  maxParticipants: z.number().min(2).max(10).default(5),
  topic: z.string().optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().min(5).max(30).default(10),
});

// WebRTC signaling server configuration
const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Generate unique room ID for WebRTC
function generateRoomId(): string {
  return randomBytes(16).toString('hex');
}

// Create new halaqah session
halaqah.post('/create', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const userRole = c.get('jwtPayload').role;
    
    // Check if user is a teacher or admin
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return c.json({ error: 'Only teachers can create sessions' }, 403);
    }
    
    const data = CreateSessionSchema.parse(await c.req.json());
    
    // Generate WebRTC room ID
    const meetingRoomId = generateRoomId();
    
    const session = await prisma.halaqahSession.create({
      data: {
        ...data,
        teacherId: userId,
        meetingRoomId,
        status: 'scheduled',
      },
    });
    
    // Auto-register teacher as participant
    await prisma.halaqahParticipant.create({
      data: {
        sessionId: session.id,
        userId,
        role: 'teacher',
        approvalStatus: 'approved',
      },
    });
    
    return c.json({
      session,
      webrtcConfig: WEBRTC_CONFIG,
      roomId: meetingRoomId,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// Get upcoming sessions - Public route but with optional auth for personalized results
halaqah.get('/upcoming', async (c) => {
  try {
    const ageGroup = c.req.query('ageGroup');
    const subject = c.req.query('subject');
    const language = c.req.query('language');
    
    const where: any = {
      scheduledStart: { gte: new Date() },
      status: { in: ['scheduled', 'live'] },
    };
    
    if (ageGroup) {
      where.ageGroups = { has: ageGroup };
    }
    
    if (subject) {
      where.subjectId = subject;
    }
    
    if (language) {
      where.language = language;
    }
    
    const sessions = await prisma.halaqahSession.findMany({
      where,
      orderBy: { scheduledStart: 'asc' },
      take: 20,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        subject: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
    
    return c.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

// Join session
halaqah.post('/join/:sessionId', jwtAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const userId = c.get('jwtPayload').sub;
    
    // Check if session exists and is joinable
    const session = await prisma.halaqahSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    if (session.status === 'ended' || session.status === 'cancelled') {
      return c.json({ error: 'Session has ended' }, 400);
    }
    
    // Check participant limit
    if (session._count.participants >= session.maxParticipants) {
      return c.json({ error: 'Session is full' }, 400);
    }
    
    // Check if already registered
    const existing = await prisma.halaqahParticipant.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });
    
    if (existing) {
      return c.json({
        participant: existing,
        webrtcConfig: WEBRTC_CONFIG,
        roomId: session.meetingRoomId,
      });
    }
    
    // Register participant
    const participant = await prisma.halaqahParticipant.create({
      data: {
        sessionId,
        userId,
        role: 'student',
        approvalStatus: session.requiresApproval ? 'pending' : 'approved',
      },
    });
    
    return c.json({
      participant,
      webrtcConfig: WEBRTC_CONFIG,
      roomId: session.meetingRoomId,
    });
  } catch (error) {
    console.error('Error joining session:', error);
    return c.json({ error: 'Failed to join session' }, 500);
  }
});

// Start session (teacher only)
halaqah.put('/start/:sessionId', jwtAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const userId = c.get('jwtPayload').sub;
    
    // Verify teacher
    const session = await prisma.halaqahSession.findUnique({
      where: { id: sessionId },
    });
    
    if (!session || session.teacherId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const updatedSession = await prisma.halaqahSession.update({
      where: { id: sessionId },
      data: {
        status: 'live',
        actualStart: new Date(),
      },
    });
    
    // Notify participants (webhook or WebSocket in production)
    
    return c.json({ session: updatedSession });
  } catch (error) {
    console.error('Error starting session:', error);
    return c.json({ error: 'Failed to start session' }, 500);
  }
});

// End session (teacher only)
halaqah.put('/end/:sessionId', jwtAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const userId = c.get('jwtPayload').sub;
    
    // Verify teacher
    const session = await prisma.halaqahSession.findUnique({
      where: { id: sessionId },
    });
    
    if (!session || session.teacherId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const updatedSession = await prisma.halaqahSession.update({
      where: { id: sessionId },
      data: {
        status: 'ended',
        actualEnd: new Date(),
      },
    });
    
    // Update participant attendance
    await prisma.halaqahParticipant.updateMany({
      where: {
        sessionId,
        joinedAt: { not: null },
      },
      data: {
        attendanceStatus: 'attended',
      },
    });
    
    return c.json({ session: updatedSession });
  } catch (error) {
    console.error('Error ending session:', error);
    return c.json({ error: 'Failed to end session' }, 500);
  }
});

// Send interaction (question, poll response, etc.)
halaqah.post('/interact', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const data = SessionInteractionSchema.parse(await c.req.json());
    
    // Verify participant is in session
    const participant = await prisma.halaqahParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: data.sessionId,
          userId,
        },
      },
    });
    
    if (!participant || participant.approvalStatus !== 'approved') {
      return c.json({ error: 'Not authorized to interact' }, 403);
    }
    
    const interaction = await prisma.sessionInteraction.create({
      data: {
        ...data,
        userId,
      },
    });
    
    // Broadcast to session participants (WebSocket in production)
    
    return c.json({ interaction });
  } catch (error) {
    console.error('Error creating interaction:', error);
    return c.json({ error: 'Failed to create interaction' }, 500);
  }
});

// Create breakout rooms
halaqah.post('/breakout/create', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const data = BreakoutRoomSchema.parse(await c.req.json());
    
    // Verify teacher
    const session = await prisma.halaqahSession.findUnique({
      where: { id: data.sessionId },
    });
    
    if (!session || session.teacherId !== userId) {
      return c.json({ error: 'Only teacher can create breakout rooms' }, 403);
    }
    
    // Get current room count
    const roomCount = await prisma.breakoutRoom.count({
      where: { sessionId: data.sessionId },
    });
    
    const breakoutRoom = await prisma.breakoutRoom.create({
      data: {
        ...data,
        roomNumber: roomCount + 1,
        status: 'waiting',
      },
    });
    
    return c.json({ breakoutRoom });
  } catch (error) {
    console.error('Error creating breakout room:', error);
    return c.json({ error: 'Failed to create breakout room' }, 500);
  }
});

// Get session recordings
halaqah.get('/recordings/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    
    const recordings = await prisma.sessionRecording.findMany({
      where: {
        sessionId,
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return c.json({ recordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return c.json({ error: 'Failed to fetch recordings' }, 500);
  }
});

// Submit session feedback
halaqah.post('/feedback/:sessionId', jwtAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const userId = c.get('jwtPayload').sub;
    const body = await c.req.json();
    
    // Check if user attended
    const participant = await prisma.halaqahParticipant.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });
    
    if (!participant || participant.attendanceStatus !== 'attended') {
      return c.json({ error: 'Only attendees can provide feedback' }, 403);
    }
    
    const feedback = await prisma.sessionFeedback.upsert({
      where: {
        sessionId_userId: { sessionId, userId },
      },
      update: body,
      create: {
        sessionId,
        userId,
        ...body,
      },
    });
    
    return c.json({ feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return c.json({ error: 'Failed to submit feedback' }, 500);
  }
});

// Get teacher's sessions
halaqah.get('/teacher/sessions', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    
    const sessions = await prisma.halaqahSession.findMany({
      where: { teacherId: userId },
      orderBy: { scheduledStart: 'desc' },
      include: {
        _count: {
          select: {
            participants: true,
            feedback: true,
          },
        },
        feedback: {
          select: {
            rating: true,
          },
        },
      },
    });
    
    // Calculate average ratings
    const sessionsWithRatings = sessions.map(session => {
      const avgRating = session.feedback.length > 0
        ? session.feedback.reduce((sum, f) => sum + f.rating, 0) / session.feedback.length
        : null;
      
      return {
        ...session,
        feedback: undefined,
        averageRating: avgRating,
      };
    });
    
    return c.json({ sessions: sessionsWithRatings });
  } catch (error) {
    console.error('Error fetching teacher sessions:', error);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

export default halaqah;