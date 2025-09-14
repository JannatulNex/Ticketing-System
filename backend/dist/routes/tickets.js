import { Router } from 'express';
import { AddCommentInput, CreateTicketInput, UpdateTicketStatusInput, UpdateTicketInput } from '@support/schemas';
import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';
import { requireRole } from '../middleware/auth.js';
export const ticketsRouter = (prisma) => {
    const router = Router();
    // Ensure uploads dir exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });
    const storage = diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
            const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const name = `${Date.now()}_${safe}`;
            cb(null, name);
        },
    });
    const upload = multer({ storage });
    // List tickets - customers see own, admins see all
    router.get('/', async (req, res) => {
        const user = req.user;
        const where = user.role === 'ADMIN' ? {} : { userId: user.id };
        const tickets = await prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' } });
        res.json(tickets);
    });
    // Create ticket (customer)
    router.post('/', async (req, res) => {
        const parsed = CreateTicketInput.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json(parsed.error.flatten());
        const user = req.user;
        const data = parsed.data;
        const ticket = await prisma.ticket.create({ data: { ...data, userId: user.id } });
        res.status(201).json(ticket);
    });
    // Get ticket by id (ensure access)
    router.get('/:id', async (req, res) => {
        const id = Number(req.params.id);
        const user = req.user;
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket)
            return res.status(404).json({ message: 'Not found' });
        if (user.role !== 'ADMIN' && ticket.userId !== user.id)
            return res.status(403).json({ message: 'Forbidden' });
        res.json(ticket);
    });
    // Update ticket (owner or admin)
    router.put('/:id', async (req, res) => {
        const id = Number(req.params.id);
        const parsed = UpdateTicketInput.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json(parsed.error.flatten());
        const user = req.user;
        const existing = await prisma.ticket.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ message: 'Not found' });
        if (user.role !== 'ADMIN' && existing.userId !== user.id)
            return res.status(403).json({ message: 'Forbidden' });
        const updated = await prisma.ticket.update({ where: { id }, data: parsed.data });
        res.json(updated);
    });
    // Update status (admin)
    router.patch('/:id/status', requireRole('ADMIN'), async (req, res) => {
        const id = Number(req.params.id);
        const parsed = UpdateTicketStatusInput.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json(parsed.error.flatten());
        const ticket = await prisma.ticket.update({ where: { id }, data: { status: parsed.data.status } });
        res.json(ticket);
    });
    // Comments
    router.get('/:id/comments', async (req, res) => {
        const id = Number(req.params.id);
        const user = req.user;
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket)
            return res.status(404).json({ message: 'Not found' });
        if (user.role !== 'ADMIN' && ticket.userId !== user.id)
            return res.status(403).json({ message: 'Forbidden' });
        const comments = await prisma.comment.findMany({ where: { ticketId: id }, orderBy: { createdAt: 'asc' } });
        res.json(comments);
    });
    router.post('/:id/comments', async (req, res) => {
        const id = Number(req.params.id);
        const parsed = AddCommentInput.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json(parsed.error.flatten());
        const user = req.user;
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket)
            return res.status(404).json({ message: 'Not found' });
        if (user.role !== 'ADMIN' && ticket.userId !== user.id)
            return res.status(403).json({ message: 'Forbidden' });
        const comment = await prisma.comment.create({
            data: { text: parsed.data.text, ticketId: id, userId: user.id },
        });
        res.status(201).json(comment);
    });
    // Upload attachment (owner or admin)
    router.post('/:id/attachment', upload.single('file'), async (req, res) => {
        const id = Number(req.params.id);
        const user = req.user;
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket)
            return res.status(404).json({ message: 'Not found' });
        if (user.role !== 'ADMIN' && ticket.userId !== user.id)
            return res.status(403).json({ message: 'Forbidden' });
        const anyReq = req;
        if (!anyReq.file?.filename)
            return res.status(400).json({ message: 'No file uploaded' });
        const urlPath = `/uploads/${anyReq.file.filename}`;
        const updated = await prisma.ticket.update({ where: { id }, data: { attachment: urlPath } });
        res.status(200).json(updated);
    });
    return router;
};
