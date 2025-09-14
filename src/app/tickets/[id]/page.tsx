"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decodeJwt } from "@/lib/jwt";

type Ticket = { id: number; subject: string; description: string; status: string; userId: number };

export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState<{ message: string; senderId: number; createdAt: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  useEffect(() => {
    const load = async () => {
      const tRes = await fetch(`http://localhost:4000/api/tickets/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (tRes.ok) setTicket(await tRes.json());
      const cRes = await fetch(`http://localhost:4000/api/tickets/${id}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (cRes.ok) setComments(await cRes.json());
    };
    if (id) load();
  }, [id, token]);

  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const s: Socket = io("http://localhost:4000");
    socketRef.current = s;
    s.emit("join-room", id);
    s.on("message", (msg) => {
      if (msg.ticketId === id) {
        setMessages((prev) => [{ message: msg.message, senderId: msg.senderId, createdAt: msg.createdAt }, ...prev]);
      }
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`http://localhost:4000/api/tickets/${id}/comments`, {
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

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const dt = decodeJwt(token);
    const senderId = typeof dt?.id === 'number' ? dt!.id : 0;
    const s = socketRef.current ?? io("http://localhost:4000");
    s.emit("message", { ticketId: id, message: chatInput, senderId });
    setChatInput("");
  };

  if (!ticket) return <main className="max-w-5xl mx-auto px-6 py-8">Loading...</main>;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
        <p className="text-neutral-500">{ticket.subject}</p>
        <div className="mt-2 text-sm"><span className="font-medium">Status:</span> {ticket.status}</div>
        <div className="mt-4 whitespace-pre-wrap text-sm">{ticket.description}</div>
        {ticket.attachment && (
          <div className="mt-2 text-sm">
            <a className="text-blue-600 underline" href={`http://localhost:4000${ticket.attachment}`} target="_blank">Attachment</a>
          </div>
        )}
      </div>
      <div>
        <Button variant="outline" onClick={() => (window.location.href = `/tickets/${id}/edit`)}>Edit</Button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-2 px-4 pt-4">Comments</h2>
          <div className="space-y-3 max-h-72 overflow-auto border-t border-neutral-200 dark:border-neutral-800 p-3">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="text-neutral-500">{new Date(c.createdAt).toLocaleString()}</div>
                <div>{c.text}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-neutral-500">No comments.</div>}
          </div>
          <div className="mt-3 space-y-2 p-4">
            <Textarea rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <Button onClick={submitComment}>Add Comment</Button>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold mb-2 px-4 pt-4">Chat</h2>
          <div className="space-y-3 max-h-72 overflow-auto border-t border-neutral-200 dark:border-neutral-800 p-3">
            {messages.map((m, idx) => (
              <div key={idx} className="text-sm">
                <div className="text-neutral-500">{new Date(m.createdAt).toLocaleString()}</div>
                <div>{m.message}</div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-sm text-neutral-500">No messages yet. Say hi!</div>}
          </div>
          <div className="mt-3 space-y-2 p-4">
            <Textarea rows={2} value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Attachment</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.querySelector('input[type="file"]') as HTMLInputElement | null;
            if (!input?.files?.[0]) return;
            const fd = new FormData();
            fd.append('file', input.files[0]);
            await fetch(`http://localhost:4000/api/tickets/${id}/attachment`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            }).then(async (r) => {
              if (r.ok) {
                const t = await r.json();
                setTicket(t);
                (input as HTMLInputElement).value = '';
              }
            });
          }}
          className="flex items-center gap-2"
        >
          <input type="file" accept="*/*" />
          <Button type="submit" variant="outline">Upload</Button>
        </form>
      </section>
    </main>
  );
}
