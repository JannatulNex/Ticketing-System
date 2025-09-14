import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'CUSTOMER']);
export type Role = z.infer<typeof RoleEnum>;

export const StatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export type Status = z.infer<typeof StatusEnum>;

export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(2).max(50),
  email: z.string().email(),
  role: RoleEnum,
  createdAt: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const TicketSchema = z.object({
  id: z.number().int().positive(),
  subject: z.string().min(3).max(200),
  description: z.string().min(3),
  category: z.enum(['Billing', 'Technical', 'General']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: StatusEnum,
  attachment: z.string().url().nullable().optional(),
  userId: z.number().int().positive(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const CommentSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1),
  ticketId: z.number().int().positive(),
  userId: z.number().int().positive(),
  createdAt: z.date().optional(),
});
export type Comment = z.infer<typeof CommentSchema>;

export const ChatMessageSchema = z.object({
  id: z.number().int().positive(),
  message: z.string().min(1),
  ticketId: z.number().int().positive(),
  senderId: z.number().int().positive(),
  createdAt: z.date().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Input schemas
export const RegisterInput = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const CreateTicketInput = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(3),
  category: z.enum(['Billing', 'Technical', 'General']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Low'),
  attachment: z.string().url().optional().or(z.literal('')).optional(),
});

export const UpdateTicketStatusInput = z.object({
  status: StatusEnum,
});

export const AddCommentInput = z.object({
  text: z.string().min(1),
});

export const SendMessageInput = z.object({
  message: z.string().min(1),
});

