import express, { type Request, type Response } from 'express';
import path from 'path';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { authenticate } from './middleware/auth.js';
import { ticketsRouter } from './routes/tickets.js';

const env = loadEnv();
console.log('✅ Loaded ENV:', env);  // Debug: দেখাবে env ঠিকমতো লোড হয়েছে

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const server = http.createServer(app as any);
const io = new Server(server, { cors: { origin: env.CORS_ORIGIN } });
const prisma = new PrismaClient();

// Health
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Auth
app.use('/api/auth', authRouter(prisma, env.JWT_SECRET));

// Protected routes
app.use('/api', authenticate(env.JWT_SECRET));
app.use('/api/tickets', ticketsRouter(prisma));

// Socket.IO
io.use((socket: any, next: any) => {
  next();
});

io.on('connection', (socket: any) => {
  socket.on('join-room', (ticketId: number) => {
    socket.join(`ticket-${ticketId}`);
  });
  socket.on('message', async (payload: { ticketId: number; message: string; senderId: number }) => {
    const { ticketId, message, senderId } = payload;
    await prisma.chatMessage.create({ data: { ticketId, message, senderId } });
    io.to(`ticket-${ticketId}`).emit('message', { ticketId, message, senderId, createdAt: new Date() });
  });
});

const port = env.PORT;
server.listen(port, () => console.log(`✅ Backend running on http://localhost:${port}`));
