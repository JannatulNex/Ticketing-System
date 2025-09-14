# TODO – Development Tasks

## 1. Setup
- [x] Initialize monorepo or separate frontend & backend repos.
- [x] Setup Next.js frontend with Tailwind CSS.
- [x] Setup Node.js backend with Prisma + Express/Nest.js.
- [x] Configure MySQL database and Prisma schema.

---

## 2. Database Schema (Prisma)
- [x] User model: id, username, email, password, role (enum: ADMIN, CUSTOMER).
- [x] Ticket model: id, subject, description, category, priority, status, attachment, userId, timestamps.
- [x] Comment model: id, text, ticketId, userId, timestamps.
- [x] ChatMessage model: id, message, ticketId, senderId, timestamps.

---

## 3. Authentication
- [x] Implement JWT-based registration/login/logout.
- [x] Middleware for role-based access.
- [x] Seed an Admin user.

---

## 4. Ticket Management
- [x] API routes for CRUD operations.
- [x] Restrict access: Customers → only own tickets.
- [x] Admins → access to all tickets.
- [x] Implement status updates workflow (Open → Closed).

---

## 5. Comments
- [x] API: Add comments linked to ticketId.
- [x] Include commenter role and timestamp.
- [x] Frontend: Display comments in ticket details.

---

## 6. Real-Time Chat
- [x] Setup Socket.IO server in backend.
- [x] Create API + WebSocket events for messages.
- [x] Store messages in DB with ticketId and senderId.
- [x] Frontend: Chat UI (real-time updates per ticket).

---

## 7. Frontend Pages (Next.js)
- [x] Register & Login pages.
- [x] Customer Dashboard:
  - [x] Ticket list (own tickets).
  - [x] Add/Edit Ticket form.
  - [x] Ticket details page (comments + chat).
- [ ] Admin Dashboard:
  - [x] All tickets view.
  - [x] Ticket details (change status, chat, comments) — status change enabled; uses same details page.
- [x] Responsive UI with Tailwind.
- [x] Form validation with react-hook-form + zod.

---

## 8. Enhancements
- [x] File upload support for ticket attachments.
- [x] Secure password hashing (bcrypt).
- [x] API error handling.
- [ ] Loading states & toasts on frontend (basic loading done; toasts pending).

---

## 9. Testing & Deployment
- [ ] Test backend APIs (Postman/Insomnia).
- [ ] Test frontend forms + validations.
- [ ] Deploy backend (Railway/Render/AWS).
- [ ] Deploy frontend (Vercel/Netlify).
