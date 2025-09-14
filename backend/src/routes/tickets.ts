import { Router, type Request, type Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import { AddCommentInput, CreateTicketInput, UpdateTicketStatusInput } from '@support/schemas';
import { requireRole } from '../middleware/auth';

export const ticketsRouter = (prisma: PrismaClient) => {
  const router = Router();

  // List tickets - customers see own, admins see all
  router.get('/', async (req: Request, res: Response) => {
    const user = req.user!;
    const where = user.role === 'ADMIN' ? {} : { userId: user.id };
    const tickets = await prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(tickets);
  });

  // Create ticket (customer)
  router.post('/', async (req: Request, res: Response) => {
    const parsed = CreateTicketInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const user = req.user!;
    const data = parsed.data;
    const ticket = await prisma.ticket.create({ data: { ...data, userId: user.id } });
    res.status(201).json(ticket);
  });

  // Get ticket by id (ensure access)
  router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json(ticket);
  });

  // Update status (admin)
  router.patch('/:id/status', requireRole('ADMIN'), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = UpdateTicketStatusInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const ticket = await prisma.ticket.update({ where: { id }, data: { status: parsed.data.status } });
    res.json(ticket);
  });

  // Comments
  router.get('/:id/comments', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) return res.status(403).json({ message: 'Forbidden' });
    const comments = await prisma.comment.findMany({ where: { ticketId: id }, orderBy: { createdAt: 'asc' } });
    res.json(comments);
  });

  router.post('/:id/comments', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = AddCommentInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) return res.status(403).json({ message: 'Forbidden' });
    const comment = await prisma.comment.create({
      data: { text: parsed.data.text, ticketId: id, userId: user.id },
    });
    res.status(201).json(comment);
  });

  return router;
};
