import { z } from 'zod';
export const RoleEnum = z.enum(['ADMIN', 'CUSTOMER']);
export const StatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const UserSchema = z.object({
    id: z.number().int().positive(),
    username: z.string().min(2).max(50),
    email: z.string().email(),
    role: RoleEnum,
    createdAt: z.date().optional(),
});
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
export const CommentSchema = z.object({
    id: z.number().int().positive(),
    text: z.string().min(1),
    ticketId: z.number().int().positive(),
    userId: z.number().int().positive(),
    createdAt: z.date().optional(),
});
export const ChatMessageSchema = z.object({
    id: z.number().int().positive(),
    message: z.string().min(1),
    ticketId: z.number().int().positive(),
    senderId: z.number().int().positive(),
    createdAt: z.date().optional(),
});
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
export const UpdateTicketInput = z.object({
    subject: z.string().min(3).max(200).optional(),
    description: z.string().min(3).optional(),
    category: z.enum(['Billing', 'Technical', 'General']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
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
