Project Setup Steps
1. Prepare Environment

Install required tools:

Node.js
 (LTS recommended, e.g. v20+)

MySQL

Yarn
 or npm

(Optional) Docker, if you want containerized DB

2. Setup Folder Structure

You can either use:

Monorepo (/frontend, /backend)
or

Two separate repos (one for Next.js, one for backend).

👉 I’ll assume monorepo for clarity.

customer-support-system/
  ├── frontend/   (Next.js)
  └── backend/    (Node.js + Prisma)

3. Initialize Backend
cd backend
yarn init -y
yarn add express cors dotenv bcrypt jsonwebtoken prisma @prisma/client socket.io
yarn add -D nodemon ts-node typescript @types/node @types/express @types/jsonwebtoken

3.1 Setup Prisma + MySQL
npx prisma init


In .env, configure MySQL:

DATABASE_URL="mysql://root:password@localhost:3306/support_system"

3.2 Define Prisma Schema

Edit prisma/schema.prisma:

model User {
  id       Int      @id @default(autoincrement())
  username String
  email    String   @unique
  password String
  role     Role     @default(CUSTOMER)
  tickets  Ticket[]
  comments Comment[]
  chats    ChatMessage[]
}

model Ticket {
  id          Int       @id @default(autoincrement())
  subject     String
  description String
  category    String
  priority    String
  status      Status    @default(OPEN)
  attachment  String?
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  comments    Comment[]
  chats       ChatMessage[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Comment {
  id        Int      @id @default(autoincrement())
  text      String
  ticketId  Int
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model ChatMessage {
  id        Int      @id @default(autoincrement())
  message   String
  ticketId  Int
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  senderId  Int
  sender    User     @relation(fields: [senderId], references: [id])
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  CUSTOMER
}

enum Status {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}


Run migration:

npx prisma migrate dev --name init

4. Build Backend Features

Auth (JWT)

Register (only customers)

Login (admin/customer)

Middleware: verify token, check role

Password hashing with bcrypt

Tickets API

CRUD (Customer: own tickets, Admin: all tickets)

Comments API

Add comments linked to ticketId

Chat (Socket.IO)

joinRoom(ticketId)

sendMessage / receiveMessage

Save to DB

File Uploads (Multer for attachments)

Run server
Add backend/index.ts:

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

server.listen(4000, () => console.log("Backend running on http://localhost:4000"));

5. Setup Frontend (Next.js)
cd ../frontend
npx create-next-app@latest .
yarn add axios react-hook-form zod socket.io-client

5.1 Pages

/login – login form

/register – registration form

/dashboard – role-based redirect

Customer → My Tickets

Admin → All Tickets

5.2 Components

Ticket List Table

Ticket Form (Add/Edit)

Ticket Details (Comments + Chat)

Chat Box (Socket.IO real-time)

5.3 API Integration

Setup axios instance with Authorization: Bearer <token>

Connect to backend REST APIs

5.4 Real-time Chat
import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

// Join ticket room
socket.emit("joinRoom", ticketId);

// Listen for messages
socket.on("receiveMessage", (msg) => {
  console.log("New message:", msg);
});

// Send message
socket.emit("sendMessage", { ticketId, message });