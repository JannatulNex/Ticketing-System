import { z } from 'zod';
export declare const RoleEnum: z.ZodEnum<["ADMIN", "CUSTOMER"]>;
export type Role = z.infer<typeof RoleEnum>;
export declare const StatusEnum: z.ZodEnum<["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]>;
export type Status = z.infer<typeof StatusEnum>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodNumber;
    username: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["ADMIN", "CUSTOMER"]>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: number;
    username: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
    createdAt?: Date | undefined;
}, {
    id: number;
    username: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
    createdAt?: Date | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const TicketSchema: z.ZodObject<{
    id: z.ZodNumber;
    subject: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["Billing", "Technical", "General"]>;
    priority: z.ZodEnum<["Low", "Medium", "High", "Urgent"]>;
    status: z.ZodEnum<["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]>;
    attachment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    userId: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    id: number;
    subject: string;
    description: string;
    category: "Billing" | "Technical" | "General";
    priority: "Low" | "Medium" | "High" | "Urgent";
    userId: number;
    createdAt?: Date | undefined;
    attachment?: string | null | undefined;
    updatedAt?: Date | undefined;
}, {
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    id: number;
    subject: string;
    description: string;
    category: "Billing" | "Technical" | "General";
    priority: "Low" | "Medium" | "High" | "Urgent";
    userId: number;
    createdAt?: Date | undefined;
    attachment?: string | null | undefined;
    updatedAt?: Date | undefined;
}>;
export type Ticket = z.infer<typeof TicketSchema>;
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodNumber;
    text: z.ZodString;
    ticketId: z.ZodNumber;
    userId: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: number;
    userId: number;
    text: string;
    ticketId: number;
    createdAt?: Date | undefined;
}, {
    id: number;
    userId: number;
    text: string;
    ticketId: number;
    createdAt?: Date | undefined;
}>;
export type Comment = z.infer<typeof CommentSchema>;
export declare const ChatMessageSchema: z.ZodObject<{
    id: z.ZodNumber;
    message: z.ZodString;
    ticketId: z.ZodNumber;
    senderId: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    message: string;
    id: number;
    ticketId: number;
    senderId: number;
    createdAt?: Date | undefined;
}, {
    message: string;
    id: number;
    ticketId: number;
    senderId: number;
    createdAt?: Date | undefined;
}>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export declare const RegisterInput: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    password: string;
}, {
    username: string;
    email: string;
    password: string;
}>;
export declare const LoginInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const CreateTicketInput: z.ZodObject<{
    subject: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["Billing", "Technical", "General"]>;
    priority: z.ZodDefault<z.ZodEnum<["Low", "Medium", "High", "Urgent"]>>;
    attachment: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, "strip", z.ZodTypeAny, {
    subject: string;
    description: string;
    category: "Billing" | "Technical" | "General";
    priority: "Low" | "Medium" | "High" | "Urgent";
    attachment?: string | undefined;
}, {
    subject: string;
    description: string;
    category: "Billing" | "Technical" | "General";
    priority?: "Low" | "Medium" | "High" | "Urgent" | undefined;
    attachment?: string | undefined;
}>;
export declare const UpdateTicketInput: z.ZodObject<{
    subject: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["Billing", "Technical", "General"]>>;
    priority: z.ZodOptional<z.ZodEnum<["Low", "Medium", "High", "Urgent"]>>;
}, "strip", z.ZodTypeAny, {
    subject?: string | undefined;
    description?: string | undefined;
    category?: "Billing" | "Technical" | "General" | undefined;
    priority?: "Low" | "Medium" | "High" | "Urgent" | undefined;
}, {
    subject?: string | undefined;
    description?: string | undefined;
    category?: "Billing" | "Technical" | "General" | undefined;
    priority?: "Low" | "Medium" | "High" | "Urgent" | undefined;
}>;
export declare const UpdateTicketStatusInput: z.ZodObject<{
    status: z.ZodEnum<["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]>;
}, "strip", z.ZodTypeAny, {
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}, {
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}>;
export declare const AddCommentInput: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export declare const SendMessageInput: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
