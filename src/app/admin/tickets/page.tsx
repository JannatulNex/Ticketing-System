"use client";
import useSWR from "swr";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { decodeJwt } from "@/lib/jwt";
import { useEffect, useMemo, useState } from "react";

type AdminTicketRow = { id: number; subject: string; status: string; userId: number };

const fetcher = async <T,>(url: string): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load tickets");
  return res.json() as Promise<T>;
};

export default function AdminTicketsPage() {
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
  const role = decodeJwt(token)?.role;
  useEffect(() => {
    if (role !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [role]);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data, error, isLoading, mutate } = useSWR<AdminTicketRow[]>(
    "http://localhost:4000/api/tickets",
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!token) {
      alert('You must be logged in to delete this ticket.');
      return;
    }
    try {
      setDeletingId(id);
      const res = await fetch(`http://localhost:4000/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        mutate();
      } else {
        alert('Failed to delete ticket');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`http://localhost:4000/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) mutate();
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">Admin: All Tickets</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{String(error)}</p>}
      <div className="w-full overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-neutral-50/60 dark:bg-neutral-900/30">
            <tr className="text-left">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Change</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 px-4">{t.id}</td>
                  <td className="py-3 px-4">{t.subject}</td>
                  <td className="py-3 px-4">{t.userId}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusToBadgeVariant(t.status)}>{t.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      className="h-9 rounded-md border border-neutral-300 bg-background px-2 text-sm"
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                    >
                      <option>OPEN</option>
                      <option>IN_PROGRESS</option>
                      <option>RESOLVED</option>
                      <option>CLOSED</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete ticket</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deleting this ticket removes it for everyone. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}>
                            {deletingId === t.id ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4" colSpan={6}>No tickets.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
