// Temporary shims to satisfy TypeScript in editor without installed deps.
// These are safe to remove once `npm install` and `prisma generate` are run.

declare module 'express' {
  export interface Request {
    params: Record<string, string>;
    body: any;
    headers: Record<string, string>;
    user?: { id: number; role: 'ADMIN' | 'CUSTOMER' };
  }
  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
  }
  export type NextFunction = (...args: any[]) => any;
  export function Router(): any;
}

declare module '@prisma/client' {
  export class PrismaClient {
    ticket: any;
    comment: any;
    user: any;
  }
}

declare module '@support/schemas' {
  export const AddCommentInput: any;
  export const CreateTicketInput: any;
  export const UpdateTicketStatusInput: any;
}
