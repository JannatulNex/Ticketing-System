**Customer Support System**

- Monorepo with `frontend` (Next.js + Tailwind + shadcn-style components) and `backend` (Express + Prisma + Socket.IO).
- Shared Zod schemas live in `packages/schemas` for DRY validation/types across FE/BE.

**Requirements**
- Node.js 20+
- MySQL running locally (or Docker)

**Setup**
- Copy `backend/.env.example` to `backend/.env` and adjust values.
- Install deps:
  - `npm install` (from repo root; uses workspaces)
- Database:
  - `npm -w backend run prisma:generate`
  - `npm -w backend run prisma:migrate -- --name init`
  - `npm -w backend run seed`

**Run**
- Backend: `cd my-app/backend && npm install && npm run dev` (http://localhost:4000)
- Frontend (existing app in `my-app`): `cd my-app && npm install && npm run dev` (http://localhost:3000)

**Notes**
- UI components are shadcn-style and colocated under `frontend/components/ui` to avoid CLI dependency and keep DRY.
- Validation schemas are shared via `@support/schemas` package.
- Socket.IO room key: `ticket-${ticketId}`.

**Next Steps**
- Finish admin dashboard and status update UI.
- Implement file upload (attachments) with Multer + FE uploader.
- Add auth guard and role-based redirects on FE.
- Harden Socket.IO auth via JWT handshake and persist userId from JWT.
