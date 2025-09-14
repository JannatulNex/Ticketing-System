import { Router, type Request, type Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput } from '@support/schemas';

export const authRouter = (prisma: PrismaClient, jwtSecret: string) => {
  const router = Router();

  router.post('/register', async (req: Request, res: Response) => {
    const parsed = RegisterInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const { username, email, password } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hash, role: 'CUSTOMER' },
      select: { id: true, role: true },
    });
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    return res.status(201).json({ token });
  });

  router.post('/login', async (req: Request, res: Response) => {
    const parsed = LoginInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    return res.json({ token });
  });

  return router;
};
