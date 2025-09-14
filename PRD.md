# Product Requirements Document (PRD)

## Project: Customer Support Ticketing System with Real-Time Chat

### 1. Overview
A customer support platform where users can create support tickets and chat in real-time with admins.  
- **Customers**: Create and manage own tickets, comment, chat with admin.  
- **Admins**: Manage all tickets, update status, respond, comment, and chat.  

---

### 2. Objectives
- Provide secure role-based authentication.  
- Allow customers to create, update, and track tickets.  
- Enable real-time chat between customer and admin.  
- Deliver a responsive Next.js frontend and Prisma-powered backend API.  

---

### 3. User Roles
1. **Customer**
   - Register, login, logout.  
   - Create, view, update, delete **own tickets**.  
   - Add comments to tickets.  
   - Chat with admins in real-time.  

2. **Admin**
   - Login/logout.  
   - Manage all tickets.  
   - Update ticket status (Open, In Progress, Resolved, Closed).  
   - Comment and chat with customers.  

---

### 4. Features & Requirements

#### 4.1 Authentication
- Token-based (JWT).  
- Registration (Customer only).  
- Admin seeded manually.  
- Middleware for role-based access.  

#### 4.2 Ticket Management
- Ticket fields:  
  - Subject (string)  
  - Description (text)  
  - Category (enum: Billing, Technical, General, etc.)  
  - Priority (enum: Low, Medium, High, Urgent)  
  - Attachment (file upload, optional)  
  - Status (enum: Open, In Progress, Resolved, Closed)  
- CRUD APIs with access rules:  
  - Customers → Own tickets only.  
  - Admins → All tickets.  

#### 4.3 Comments
- Linked to ticketId.  
- Both roles can add comments.  
- Store commenter role and timestamp.  

#### 4.4 Real-Time Chat
- Ticket-based chat.  
- Implement with **WebSockets (Socket.IO)**.  
- Fallback: Polling/REST endpoints.  

#### 4.5 Frontend (Next.js)
- Pages:  
  - Auth: Register/Login  
  - Dashboard (Customer): My Tickets, Create/Edit Ticket, Ticket Details (comments + chat)  
  - Dashboard (Admin): All Tickets, Ticket Details, Change Status  
- Responsive design with **form validation (react-hook-form + zod)**.  

#### 4.6 Backend (Node.js + Prisma)
- **Database**: MySQL  
- **ORM**: Prisma  
- Models: User, Ticket, Comment, ChatMessage  
- REST API with JWT authentication  
- File upload handling (attachments)  
- Secure password storage (bcrypt)  

---

### 5. Non-Functional Requirements
- **Security**: Hashed passwords, JWT auth, role validation.  
- **Performance**: Real-time chat without page reload.  
- **Scalability**: Support multiple concurrent chats.  
- **Usability**: Mobile-friendly UI.  

---

### 6. Deliverables
- Next.js frontend  
- Node.js backend with Prisma + MySQL  
- API documentation  
- Deployment instructions (Docker optional)  
