import { API_BASE_URL, SOCKET_BASE_URL, apiUrl, backendUrl } from "@/lib/config";
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Ticket = { id: number; subject: string; description: string; status: string; userId: number };

export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState<{ message: string; senderId: number; createdAt: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  useEffect(() => {
    const load = async () => {
      const tRes = await fetch(apiUrl(`tickets/${id}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (tRes.ok) setTicket(await tRes.json());
      const cRes = await fetch(apiUrl(`tickets/${id}/comments`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (cRes.ok) setComments(await cRes.json());
    };
    if (id) load();
  }, [id, token]);

  useEffect(() => {
    const s: Socket = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("✅ Connected to socket:", SOCKET_BASE_URL);
      s.emit("join-room", id);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    s.on("message", (msg) => {
      if (msg.ticketId === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(apiUrl(`tickets/${id}/comments`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text: newComment }),
    });
    if (res.ok) {
      const created = await res.json();
      setComments((prev) => [...prev, created]);
      setNewComment("");
    }
  };

const sendChat = () => {
  if (!chatInput.trim()) return;
  if (socketRef.current) {
    socketRef.current.emit("message", { ticketId: id, message: chatInput, senderId: 0 });
    setChatInput("");
  }
};
  if (!ticket) return <main className="container py-8">Loading...</main>;

  return (
    <main className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
        <p className="text-muted-foreground">{ticket.subject}</p>
        <div className="mt-2 text-sm"><span className="font-medium">Status:</span> {ticket.status}</div>
        <div className="mt-4 whitespace-pre-wrap text-sm">{ticket.description}</div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-2">Comments</h2>
          <div className="space-y-3 max-h-72 overflow-auto border rounded-md p-3">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                <div>{c.text}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-muted-foreground">No comments.</div>}
          </div>
          <div className="mt-3 space-y-2">
            <Textarea rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <Button onClick={submitComment}>Add Comment</Button>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Chat</h2>
          <div className="space-y-3 max-h-72 overflow-auto border rounded-md p-3">
            {messages.map((m, idx) => (
              <div key={idx} className="text-sm">
                <div className="text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
                <div>{m.message}</div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-sm text-muted-foreground">No messages yet. Say hi!</div>}
          </div>
          <div className="mt-3 space-y-2">
            <Textarea rows={2} value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

