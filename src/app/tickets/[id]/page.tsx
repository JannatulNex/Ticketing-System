"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { decodeJwt } from "@/lib/jwt";
import { apiUrl, backendUrl, SOCKET_BASE_URL } from "@/lib/config";

type Ticket = {
  id: number;
  subject: string;
  description: string;
  status: string;
  userId: number;
  attachment?: string | null;
};

type CommentRow = { id: number; text: string; createdAt: string };

type Message = {
  id?: number;
  message: string;
  senderId: number;
  createdAt: string;
  ticketId: number;
  sender?: { id: number; username: string; role: string };
};

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newComment, setNewComment] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUserId = decodeJwt(getToken())?.id ?? null;

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const ticketRes = await fetch(apiUrl(`tickets/${id}`), { headers: getAuthHeaders() });
      if (ticketRes.ok) {
        setTicket(await ticketRes.json());
      }

      const commentsRes = await fetch(apiUrl(`tickets/${id}/comments`), { headers: getAuthHeaders() });
      if (commentsRes.ok) {
        setComments(await commentsRes.json());
      }

      const messagesRes = await fetch(apiUrl(`tickets/${id}/messages`), { headers: getAuthHeaders() });
      if (messagesRes.ok) {
        const history: Message[] = await messagesRes.json();
        setMessages(
          history.map((message) => ({
            id: message.id,
            message: message.message,
            senderId: message.senderId,
            createdAt: message.createdAt,
            sender: message.sender,
            ticketId: message.ticketId,
          })),
        );
      } else {
        setMessages([]);
      }
    };

    void load();
  }, [id, getAuthHeaders]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) return;

    const socket: Socket = io(SOCKET_BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;
    socket.emit("join-room", id);

    const handleMessage = (msg: Message) => {
      if (msg.ticketId === id) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            message: msg.message,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
            sender: msg.sender,
            ticketId: msg.ticketId,
          },
        ]);
      }
    };

    socket.on("message", handleMessage);
    socket.on("connect_error", (error) => {
      console.warn("Socket connection error", error.message);
    });

    return () => {
      socket.off("message", handleMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const token = getToken();
    const res = await fetch(apiUrl(`tickets/${id}/comments`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text: newComment }),
    });
    if (res.ok) {
      const created: CommentRow = await res.json();
      setComments((prev) => [...prev, created]);
      setNewComment("");
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;

    const token = getToken();
    if (!token) {
      alert("You must be logged in to send a message.");
      return;
    }

    const decoded = decodeJwt(token);
    const senderId = typeof decoded?.id === "number" ? decoded.id : undefined;
    if (!senderId) {
      alert("Unable to determine the sender. Please log in again.");
      return;
    }

    let socket = socketRef.current;
    if (!socket) {
      socket = io(SOCKET_BASE_URL, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
      socketRef.current = socket;
      socket.emit("join-room", id);
    }

    socket.emit("message", { ticketId: id, message: chatInput, senderId });
    setChatInput("");
  };

  const handleDelete = async () => {
    const authToken = getToken();
    if (!authToken) {
      alert("You must be logged in to delete this ticket.");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(apiUrl(`tickets/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        const decoded = decodeJwt(authToken);
        const redirect = decoded?.role === "ADMIN" ? "/admin/tickets" : "/tickets";
        window.location.href = redirect;
      } else {
        alert("Failed to delete ticket");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!ticket) {
    return <main className="max-w-5xl mx-auto px-6 py-8">Loading...</main>;
  }

  const attachmentName = ticket.attachment ? ticket.attachment.split("/").pop() ?? "attachment" : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div>
          <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
          <p className="text-neutral-500">{ticket.subject}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-300">
          <span>
            <span className="font-medium">Status:</span> {ticket.status}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-200">{ticket.description}</div>
        <div className="border-t border-dashed border-neutral-200 pt-4 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Attachment</h2>
          {ticket.attachment ? (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-200">
                File
              </span>
              <a className="text-blue-600 underline" href={backendUrl(ticket.attachment)} target="_blank" rel="noreferrer">
                {attachmentName}
              </a>
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No attachment uploaded.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => (window.location.href = `/tickets/${id}/edit`)}>
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete ticket</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the ticket, its comments, and chat history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-2 px-4 pt-4">Comments</h2>
          <div className="space-y-3 max-h-72 overflow-auto border-t border-neutral-200 dark:border-neutral-800 p-3">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <div className="text-neutral-500">{new Date(comment.createdAt).toLocaleString()}</div>
                <div>{comment.text}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-neutral-500">No comments.</div>}
          </div>
          <div className="mt-3 space-y-2 p-4">
            <Textarea rows={3} value={newComment} onChange={(event) => setNewComment(event.target.value)} />
            <Button onClick={submitComment}>Add Comment</Button>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-2 px-4 pt-4">Chat</h2>
          <div className="space-y-3 max-h-72 overflow-auto border-t border-neutral-200 dark:border-neutral-800 p-3">
            {messages.map((message, idx) => {
              const isMe = currentUserId === message.senderId;
              const name = isMe ? "You" : message.sender?.username ?? `User ${message.senderId}`;
              return (
                <div key={message.id ?? idx} className={`text-sm flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${isMe ? "text-right" : "text-left"}`}>
                    <div className="text-[11px] text-neutral-500 mb-0.5">
                      {name} - {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                    <div className={`inline-block rounded-md px-3 py-2 ${isMe ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <div className="text-sm text-neutral-500">No messages yet. Say hi!</div>}
          </div>
          <div className="mt-3 space-y-2 p-4">
            <Textarea rows={2} value={chatInput} onChange={(event) => setChatInput(event.target.value)} />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
