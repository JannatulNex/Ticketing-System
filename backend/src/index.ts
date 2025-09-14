import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './config/env';
import { authRouter } from './routes/auth';
import { authenticate } from './middleware/auth';
import { ticketsRouter } from './routes/tickets';

dotenv.config();
const env = loadEnv();

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.CORS_ORIGIN } });
const prisma = new PrismaClient();

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Auth
app.use('/api/auth', authRouter(prisma, env.JWT_SECRET));

// Protected routes
app.use('/api', authenticate(env.JWT_SECRET));
app.use('/api/tickets', ticketsRouter(prisma));

// Socket.IO
io.use((socket, next) => {
  // Optionally validate token here via query or headers in a real app
  next();
});

io.on('connection', (socket) => {
  socket.on('join-room', (ticketId: number) => {
    socket.join(`ticket-${ticketId}`);
  });
  socket.on('message', async (payload: { ticketId: number; message: string; senderId: number }) => {
    const { ticketId, message, senderId } = payload;
    await prisma.chatMessage.create({ data: { ticketId, message, senderId } });
    io.to(`ticket-${ticketId}`).emit('message', { ticketId, message, senderId, createdAt: new Date() });
  });
});

const port = env.PORT || 4000;
server.listen(port, () => console.log(`Backend running on http://localhost:${port}`));

