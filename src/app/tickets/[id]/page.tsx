"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decodeJwt } from "@/lib/jwt";

type Ticket = { id: number; subject: string; description: string; status: string; userId: number; attachment?: string | null };

export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState<{ id?: number; message: string; senderId: number; createdAt: string; sender?: { id: number; username: string; role: string } }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  useEffect(() => {
    const load = async () => {
      const tRes = await fetch(`http://localhost:4000/api/tickets/${id}`, {
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      });
      if (tRes.ok) setTicket(await tRes.json());
      const cRes = await fetch(`http://localhost:4000/api/tickets/${id}/comments`, {
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      });
      if (cRes.ok) setComments(await cRes.json());
      const mRes = await fetch(`http://localhost:4000/api/tickets/${id}/messages`, {
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      });
      if (mRes.ok) {
        const history = await mRes.json();
        setMessages(history.map((m: any) => ({ id: m.id, message: m.message, senderId: m.senderId, createdAt: m.createdAt, sender: m.sender })));
      } else {
        // Clear to avoid stale UI when unauthorized
        setMessages([]);
      }
    };
    if (id) load();
  }, [id]);

  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const s: Socket = io("http://localhost:4000");
    socketRef.current = s;
    s.emit("join-room", id);
    s.on("message", (msg: any) => {
      if (msg.ticketId === id) {
        setMessages((prev) => [...prev, { id: msg.id, message: msg.message, senderId: msg.senderId, createdAt: msg.createdAt, sender: msg.sender }]);
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
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
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
    const dt = decodeJwt(getToken());
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
            {messages.map((m, idx) => {
              const me = decodeJwt(getToken())?.id === m.senderId;
              const name = me ? 'You' : (m.sender?.username || `User ${m.senderId}`);
              return (
                <div key={m.id ?? idx} className={`text-sm flex ${me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${me ? 'text-right' : 'text-left'}`}>
                    <div className="text-[11px] text-neutral-500 mb-0.5">{name} • {new Date(m.createdAt).toLocaleTimeString()}</div>
                    <div className={`inline-block rounded-md px-3 py-2 ${me ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>{m.message}</div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <div className="text-sm text-neutral-500">No messages yet. Say hi!</div>}
          </div>
          <div className="mt-3 space-y-2 p-4">
            <Textarea rows={2} value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Attachment</h2>
        {ticket.attachment ? (
          <div className="text-sm">
            Current file: {" "}
            <a className="text-blue-600 underline" href={`http://localhost:4000${ticket.attachment}`} target="_blank">
              View attachment
            </a>
          </div>
        ) : (
          <div className="text-sm text-neutral-500">No attachment yet.</div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedFile) return;
            const fd = new FormData();
            fd.append('file', selectedFile);
            const res = await fetch(`http://localhost:4000/api/tickets/${id}/attachment`, {
              method: 'POST',
              headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
              body: fd,
            });
            if (res.ok) {
              const t = await res.json();
              setTicket(t);
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept="*/*"
            className="block w-full max-w-xs text-sm file:mr-4 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-50"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm">
              <span className="truncate max-w-[220px]" title={selectedFile.name}>{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove
              </Button>
            </div>
          ) }
          <Button type="submit" variant="outline" disabled={!selectedFile}>
            Upload
          </Button>
        </form>
      </section>
    </main>
  );
}
