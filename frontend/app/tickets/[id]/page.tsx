"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
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

export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newComment, setNewComment] = useState("");
  const [chatInput, setChatInput] = useState("");

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
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

    if (id) void load();
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

    socket.on("message", (msg: Message) => {
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
    });

    socket.on("connect_error", (error) => {
      console.warn("Socket connection error", error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(apiUrl(`tickets/${id}/comments`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
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

  if (!ticket) return <main className="container py-8">Loading...</main>;

  const attachmentName = ticket.attachment ? ticket.attachment.split("/").pop() ?? "attachment" : null;

  return (
    <main className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
        <p className="text-muted-foreground">{ticket.subject}</p>
        <div className="mt-2 text-sm">
          <span className="font-medium">Status:</span> {ticket.status}
        </div>
        <div className="mt-4 whitespace-pre-wrap text-sm">{ticket.description}</div>
        {ticket.attachment ? (
          <div className="mt-4 text-sm flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">File</span>
            <a className="text-blue-600 underline" href={backendUrl(ticket.attachment)} target="_blank" rel="noreferrer">
              {attachmentName}
            </a>
          </div>
        ) : null}
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold mb-2">Comments</h2>
          <div className="space-y-3 max-h-72 overflow-auto border rounded-md p-3">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <div className="text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</div>
                <div>{comment.text}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-muted-foreground">No comments.</div>}
          </div>
          <div className="mt-3 space-y-2">
            <Textarea rows={3} value={newComment} onChange={(event) => setNewComment(event.target.value)} />
            <Button onClick={submitComment}>Add Comment</Button>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Chat</h2>
          <div className="space-y-3 max-h-72 overflow-auto border rounded-md p-3">
            {messages.map((message, idx) => {
              const decoded = decodeJwt(getToken());
              const isMe = decoded?.id === message.senderId;
              const name = isMe ? "You" : message.sender?.username ?? `User ${message.senderId}`;
              return (
                <div key={message.id ?? idx} className={`text-sm flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${isMe ? "text-right" : "text-left"}`}>
                    <div className="text-[11px] text-muted-foreground mb-0.5">
                      {name} - {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                    <div className={`inline-block rounded-md px-3 py-2 ${isMe ? "bg-blue-600 text-white" : "bg-neutral-100"}`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <div className="text-sm text-muted-foreground">No messages yet. Say hi!</div>}
          </div>
          <div className="mt-3 space-y-2">
            <Textarea rows={2} value={chatInput} onChange={(event) => setChatInput(event.target.value)} />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
