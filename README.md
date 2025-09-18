# Customer Support Ticketing System

Live demo: https://ticketing-system-3a8u.onrender.com

A full-stack help desk platform that combines a Next.js frontend with an Express + Prisma backend. Customers can raise support tickets, attach files, leave comments, and chat with administrators in real time. Admins oversee all tickets, manage statuses, and respond through the same interface.

## Key Features
- JWT authentication with customer self-registration and seeded admin account.
- Role-based access control that scopes ticket visibility and status management.
- Ticket CRUD with categories, priority levels, and optional file attachments.
- Comment timeline on every ticket to keep a permanent record of updates.
- Real-time per-ticket chat powered by Socket.IO for instant collaboration.
- Shared Zod schemas across frontend and backend to keep validation in sync.

## Tech Stack
- Next.js 15, React 19, SWR, Tailwind CSS (shadcn-inspired components).
- Express 4, TypeScript, Prisma ORM, Socket.IO.
- PostgreSQL database.
- Zod shared validation library via `packages/schemas`.

## Repository Structure
```
my-app/
  backend/          Express API, Prisma schema, Socket.IO server
    src/
    prisma/
    dist/
  packages/
    schemas/        Shared Zod schemas for inputs and entities
  src/              Next.js application
    app/
    components/
    lib/
```

## Getting Started

### Prerequisites
- Node.js 20 or newer.
- npm 10+.
- PostgreSQL 14+ (local instance or hosted connection string).
- OpenSSL-compatible environment for bcrypt password hashing.

### Installation
1. Clone the repository and move into the project folder.
2. Install frontend dependencies from the repo root:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Configure environment variables
Create the following files (replace placeholder values as needed):

```
# backend/.env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing
JWT_SECRET=replace-with-a-long-random-string
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPass123!
```

```
# .env.local (frontend)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

For production deployments you can mirror the above values in `.env` files or platform-specific configuration. The backend will automatically create an `uploads/` directory for attachments if it is missing.

### Database setup
From `backend/` run the Prisma commands:

```bash
cd backend

# Apply migrations (use a descriptive name on first run)
npx prisma migrate dev --name init

# Generate Prisma client (also run after schema changes)
npm run prisma:generate

# Seed the admin user (uses ADMIN_EMAIL / ADMIN_PASSWORD)
npm run seed
```

### Start development servers
Run backend and frontend in separate terminals:

```bash
# Terminal 1 - backend
cd backend
npm run dev   # compiles TypeScript and serves on http://localhost:4000

# Terminal 2 - frontend
cd ..
npm run dev   # Next.js dev server on http://localhost:3000
```

The backend `dev` script recompiles before starting. Re-run the command after backend code changes (or swap to `npx ts-node-dev src/index.ts` if you prefer live reload).

### Production build
```bash
# Backend
cd backend
npm run build
npm run start

# Frontend (from repo root)
npm run build
npm run start
```

## Environment Variables

### Backend
| Variable       | Required | Default     | Description |
| -------------- | -------- | ----------- | ----------- |
| NODE_ENV       | no       | development | Runtime mode. |
| PORT           | no       | 4000        | HTTP port for the Express server. |
| DATABASE_URL   | yes      | -           | PostgreSQL connection string used by Prisma. |
| JWT_SECRET     | yes      | -           | Secret used to sign and verify JWT tokens (16+ chars). |
| CORS_ORIGIN    | no       | *           | Comma-separated list of allowed origins for the API and Socket.IO. |
| ADMIN_EMAIL    | yes      | -           | Email used when seeding the initial admin user. |
| ADMIN_PASSWORD | yes      | -           | Password used when seeding the initial admin user. |

### Frontend
| Variable                | Required | Default                   | Description |
| ----------------------- | -------- | ------------------------- | ----------- |
| NEXT_PUBLIC_API_URL     | no       | http://localhost:4000/api | Base URL for REST requests. |
| NEXT_PUBLIC_SOCKET_URL  | no       | http://localhost:4000     | Socket.IO connection URL. |

## API Reference

Base URL: `http://localhost:4000/api`
All endpoints return JSON. Unless noted otherwise, requests must include an `Authorization: Bearer <token>` header obtained from the auth endpoints.

### Health
- `GET /health` (no auth): returns `{ "ok": true }` so you can confirm the server is live.

### Authentication
New customers must register before logging in. If you already have an account, simply log in to continue.
- `POST /api/auth/register`
  - Body: `{ "username": string, "email": string, "password": string }`
  - Creates a customer account and returns `{ "token": string }`.
  - Errors: `400` validation failure, `409` when the email already exists.
- `POST /api/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Returns `{ "token": string }` on success or `401` for invalid credentials.

### Tickets
- `GET /api/tickets`
  - Customers receive only their own tickets. Admins receive all tickets.
- `POST /api/tickets`
  - Accepts `multipart/form-data` with fields `subject`, `description`, `category` (`Billing|Technical|General`), `priority` (`Low|Medium|High|Urgent`), and optional `attachment` file.
  - Returns the created ticket with a `201` status.
- `GET /api/tickets/:id`
  - Returns the ticket if the requester owns it or is an admin, else `403`.
- `PUT /api/tickets/:id`
  - Accepts `multipart/form-data`.
  - Optional text fields: `subject`, `description`, `category`, `priority`.
  - Optional file field `attachment`. To remove an existing attachment without uploading a new file send `removeAttachment=true`.
  - Returns the updated ticket.
- `PATCH /api/tickets/:id/status` (admin only)
  - Body: `{ "status": "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }`
  - Updates the ticket status.
- `DELETE /api/tickets/:id`
  - Owner or admin can delete a ticket. Removes associated comments, chat history, and attachment. Returns `204 No Content`.

### Comments
- `GET /api/tickets/:id/comments`
  - Returns comments in chronological order (requires access to the ticket).
- `POST /api/tickets/:id/comments`
  - Body: `{ "text": string }`
  - Adds a comment by the current user.

### Chat history
- `GET /api/tickets/:id/messages`
  - Returns messages ordered by `createdAt` along with sender metadata. This endpoint is available both in the dedicated router and at the app level (`/api/tickets/:id/messages`).

### Attachments
- `POST /api/tickets/:id/attachment`
  - Accepts a `multipart/form-data` upload where the file field is named `file`.
  - Replaces the current attachment, deleting the previous file if one existed.
- `GET /uploads/<filename>`
  - Public static route for previously uploaded files.

## Real-time Chat

The Socket.IO server runs on the same host as the API (`NEXT_PUBLIC_SOCKET_URL`). Clients connect without additional authentication (the JWT flow happens outside the socket layer) and must join the ticket room before sending or receiving messages.

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", { withCredentials: true });

// Join a ticket room
socket.emit("join-room", ticketId);

// Receive new messages
socket.on("message", (payload) => {
  console.log("Received", payload);
});

// Send a message
socket.emit("message", {
  ticketId,
  message: "Hello there",
  senderId: currentUserId, // match the JWT user id
});
```

- Room naming convention: `ticket-${ticketId}`.
- Every inbound `message` event is persisted via Prisma and then broadcast to the room.
- When running in production, align `NEXT_PUBLIC_SOCKET_URL` with your deployed backend origin.

## Default Admin Account

Running `npm run seed` creates an administrator using `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Update those values before seeding in production. Demo deployments currently ship with:

- Email: `admin@example.com`
- Password: `AdminPass12025!`

Use the login page to authenticate as the admin and access the admin ticket dashboard.

## Useful npm scripts
- `npm run dev` (root): Next.js development server.
- `npm run build` / `npm run start` (root): Frontend production build and serve.
- `npm run dev` (backend): Compile & start Express API.
- `npm run build` / `npm run start` (backend): TypeScript build and production start.
- `npm run prisma:generate`, `npm run prisma:migrate`, `npm run seed` (backend): Database tooling.
