Backend (Express + Prisma + Socket.IO)

Commands
- `npm run dev` start dev server
- `npm run prisma:generate` generate Prisma client
- `npm run prisma:migrate -- --name init` run DB migration
- `npm run seed` create admin user (from .env)

Env
- Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.

API
- `POST /api/auth/register` { username, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/tickets` (auth)
- `POST /api/tickets` (auth)
- `GET /api/tickets/:id` (auth, access controlled)
- `PATCH /api/tickets/:id/status` (admin)
- `GET /api/tickets/:id/comments` (auth, access controlled)
- `POST /api/tickets/:id/comments` (auth, access controlled)

Sockets
- connect → `join-room` with ticketId → receive `message`
- emit `message` { ticketId, message, senderId }

