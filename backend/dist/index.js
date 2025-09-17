import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { authenticate } from './middleware/auth.js';
import { ticketsRouter } from './routes/tickets.js';
const env = loadEnv();
console.log('✅ Loaded ENV:', env); // Debug: দেখাবে env ঠিকমতো লোড হয়েছে
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../uploads');
const legacyUploadsDir = path.resolve(process.cwd(), 'uploads');
const ensureUploadsDir = (dir) => {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
};
ensureUploadsDir(uploadsDir);
ensureUploadsDir(legacyUploadsDir);
const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(legacyUploadsDir));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins.includes('*') ? '*' : allowedOrigins, credentials: true } });
const prisma = new PrismaClient();
// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
// Auth
app.use('/api/auth', authRouter(prisma, env.JWT_SECRET));
// Protected routes
app.use('/api', authenticate(env.JWT_SECRET));
app.use('/api/tickets', ticketsRouter(prisma));
// Direct message history endpoint (mirror of router, ensures availability)
app.get('/api/tickets/:id/messages', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        if (!Number.isFinite(id))
            return res.status(400).json({ message: 'Invalid id' });
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket)
            return res.status(404).json({ message: 'Not found' });
        if (user?.role !== 'ADMIN' && ticket.userId !== user?.id)
            return res.status(403).json({ message: 'Forbidden' });
        const messages = await prisma.chatMessage.findMany({
            where: { ticketId: id },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, username: true, role: true } } },
        });
        return res.json(messages);
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
});
// Socket.IO
io.use((socket, next) => {
    next();
});
io.on('connection', (socket) => {
    socket.on('join-room', (ticketId) => {
        socket.join(`ticket-${ticketId}`);
    });
    socket.on('message', async (payload) => {
        const { ticketId, message, senderId } = payload;
        const saved = await prisma.chatMessage.create({
            data: { ticketId, message, senderId },
            include: { sender: { select: { id: true, username: true, role: true } } },
        });
        io.to(`ticket-${ticketId}`).emit('message', saved);
    });
});
const port = env.PORT;
server.listen(port, () => console.log(`✅ Backend running on http://localhost:${port}`));
