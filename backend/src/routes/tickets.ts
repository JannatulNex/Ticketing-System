import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { AddCommentInput, CreateTicketInput, UpdateTicketStatusInput, UpdateTicketInput } from "@support/schemas";
import multer, { diskStorage } from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { requireRole } from "../middleware/auth.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(currentDir, "../../uploads");
const legacyUploadsRoot = path.resolve(process.cwd(), "uploads");

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(uploadsRoot);

const storage = diskStorage({
  destination: (_req: any, _file: any, cb: (err: any, dest: string) => void) => cb(null, uploadsRoot),
  filename: (_req: any, file: any, cb: (err: any, name: string) => void) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const name = `${Date.now()}_${safe}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

const removeAttachmentFile = async (relative?: string | null) => {
  if (!relative) return;
  const cleaned = relative.replace(/^\/+/, "").replace(/^uploads\//, "");
  if (!cleaned) return;
  const primaryPath = path.join(uploadsRoot, cleaned);
  const legacyPath = path.join(legacyUploadsRoot, cleaned);
  const targetPath = fs.existsSync(primaryPath) ? primaryPath : legacyPath;
  try {
    if (targetPath && fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }
  } catch (err) {
    console.error("Failed to delete attachment", err);
  }
};

const createTicketBody = CreateTicketInput.omit({ attachment: true });

export const ticketsRouter = (prisma: PrismaClient) => {
  const router = Router();

  // List tickets - customers see own, admins see all
  router.get("/", async (req: Request, res: Response) => {
    const user = req.user!;
    const where = user.role === "ADMIN" ? {} : { userId: user.id };
    const tickets = await prisma.ticket.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json(tickets);
  });

  // Create ticket (customer)
  router.post("/", upload.single("attachment"), async (req: Request, res: Response) => {
    const parsed = createTicketBody.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) await removeAttachmentFile(`/uploads/${req.file.filename}`);
      return res.status(400).json(parsed.error.flatten());
    }
    const user = req.user!;
    const attachmentPath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const ticket = await prisma.ticket.create({
      data: {
        ...parsed.data,
        attachment: attachmentPath,
        userId: user.id,
      },
    });
    res.status(201).json(ticket);
  });

  // Get ticket by id (ensure access)
  router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Not found" });
    if (user.role !== "ADMIN" && ticket.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    res.json(ticket);
  });

  // Update ticket (owner or admin)
  router.put("/:id", upload.single("attachment"), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const uploadedAttachment = req.file ? `/uploads/${req.file.filename}` : undefined;
    const parsed = UpdateTicketInput.safeParse(req.body);
    if (!parsed.success) {
      await removeAttachmentFile(uploadedAttachment);
      return res.status(400).json(parsed.error.flatten());
    }
    const user = req.user!;
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      await removeAttachmentFile(uploadedAttachment);
      return res.status(404).json({ message: "Not found" });
    }
    if (user.role !== "ADMIN" && existing.userId !== user.id) {
      await removeAttachmentFile(uploadedAttachment);
      return res.status(403).json({ message: "Forbidden" });
    }
    const data: Record<string, unknown> = { ...parsed.data };
    const removeAttachment = req.body.removeAttachment === "true";
    if (uploadedAttachment) {
      data.attachment = uploadedAttachment;
    } else if (removeAttachment) {
      data.attachment = null;
    }
    const updated = await prisma.ticket.update({ where: { id }, data });
    if (uploadedAttachment) await removeAttachmentFile(existing.attachment);
    if (!uploadedAttachment && removeAttachment) await removeAttachmentFile(existing.attachment);
    res.json(updated);
  });

  // Update status (admin)
  router.patch("/:id/status", requireRole("ADMIN"), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = UpdateTicketStatusInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const ticket = await prisma.ticket.update({ where: { id }, data: { status: parsed.data.status } });
    res.json(ticket);
  });

  // Delete ticket (owner or admin)
  router.delete("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Not found" });
    if (user.role !== "ADMIN" && ticket.userId !== user.id) return res.status(403).json({ message: "Forbidden" });

    await prisma.comment.deleteMany({ where: { ticketId: id } });
    await prisma.chatMessage.deleteMany({ where: { ticketId: id } });
    await prisma.ticket.delete({ where: { id } });

    await removeAttachmentFile(ticket.attachment);

    res.status(204).end();
  });

  // Comments
  router.get("/:id/comments", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Not found" });
    if (user.role !== "ADMIN" && ticket.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const comments = await prisma.comment.findMany({ where: { ticketId: id }, orderBy: { createdAt: "asc" } });
    res.json(comments);
  });

  router.post("/:id/comments", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = AddCommentInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Not found" });
    if (user.role !== "ADMIN" && ticket.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const comment = await prisma.comment.create({
      data: { text: parsed.data.text, ticketId: id, userId: user.id },
    });
    res.status(201).json(comment);
  });

  // Chat messages (history)
  router.get("/:id/messages", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Not found" });
    if (user.role !== "ADMIN" && ticket.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const messages = await prisma.chatMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, username: true, role: true } } },
    });
    res.json(messages);
  });

  // Upload attachment (owner or admin)
  router.post("/:id/attachment", upload.single("file"), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user!;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      if (req.file?.filename) await removeAttachmentFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ message: "Not found" });
    }
    if (user.role !== "ADMIN" && ticket.userId !== user.id) {
      if (req.file?.filename) await removeAttachmentFile(`/uploads/${req.file.filename}`);
      return res.status(403).json({ message: "Forbidden" });
    }
    const anyReq = req as Request & { file?: { filename?: string } };
    if (!anyReq.file?.filename) return res.status(400).json({ message: "No file uploaded" });
    const urlPath = `/uploads/${anyReq.file.filename}`;
    const updated = await prisma.ticket.update({ where: { id }, data: { attachment: urlPath } });
    await removeAttachmentFile(ticket.attachment);
    res.status(200).json(updated);
  });

  return router;
};
