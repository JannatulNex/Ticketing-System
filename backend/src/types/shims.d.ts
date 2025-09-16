// Temporary shims to satisfy TypeScript in editor without installed deps.
// These are safe to remove once `npm install` and `prisma generate` are run.

declare module 'express' {
  export interface Request {
    params: Record<string, string>;
    body: any;
    headers: Record<string, string>;
    user?: { id: number; role: 'ADMIN' | 'CUSTOMER' };
    file?: any;
  }
  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
    end(body?: any): Response;
  }
  export type NextFunction = (...args: any[]) => any;
  export interface ExpressApp {
    use: (...args: any[]) => any;
    get: (...args: any[]) => any;
    post: (...args: any[]) => any;
  }
  export function Router(): any;
  const _default: {
    (): ExpressApp;
    json: (...args: any[]) => any;
    static: (...args: any[]) => any;
  };
  export default _default;
}

declare module '@prisma/client' {
  export class PrismaClient {
    ticket: any;
    comment: any;
    user: any;
    chatMessage: any;
    $disconnect: () => Promise<void>;
    $connect?: () => Promise<void>;
  }
}

declare module '@support/schemas' {
  export const AddCommentInput: any;
  export const CreateTicketInput: any;
  export const UpdateTicketStatusInput: any;
  export const UpdateTicketInput: any;
  export const LoginInput: any;
  export const RegisterInput: any;
}

declare module 'cors' {
  const cors: (...args: any[]) => any
  export default cors
}

declare module 'dotenv' {
  const dotenv: { config: (...args: any[]) => any }
  export default dotenv
}

declare module 'socket.io' {
  export class Server {
    constructor(...args: any[])
    use: (...args: any[]) => any
    on: (...args: any[]) => any
    to: (...args: any[]) => { emit: (...args: any[]) => any }
  }
}

declare module 'multer' {
  type StorageEngine = any
  interface File { originalname: string }
  function diskStorage(opts: {
    destination: (req: any, file: File, cb: (err: any, dest: string) => void) => void
    filename: (req: any, file: File, cb: (err: any, filename: string) => void) => void
  }): StorageEngine
  interface Multer {
    single: (field: string) => any
  }
  function multer(opts: { storage: StorageEngine }): Multer
  export default multer
  export { diskStorage }
}
