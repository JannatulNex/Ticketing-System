"use client";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMemo, useState } from "react";
import { decodeJwt } from "@/lib/jwt";
import {  apiUrl  } from "@/lib/config";

type TicketRow = { id: number; subject: string; status: string; priority?: string };

function fetcher<T>(url: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load tickets");
      return res.json() as Promise<T>;
    });
}

export default function TicketsPage() {
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const role = decodeJwt(token)?.role;
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data, error, isLoading, mutate } = useSWR<TicketRow[]>(
    apiUrl("tickets"),
    fetcher
  );

  const handleDelete = async (ticketId: number) => {
    if (!token) {
      alert('You must be logged in to delete this ticket.');
      return;
    }
    try {
      setDeletingId(ticketId);
      const res = await fetch(apiUrl(`tickets/${ticketId}`), {
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

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/tickets/new">New Ticket</Link>
          </Button>
          {role === 'ADMIN' ? (
            <Button variant="outline" asChild>
              <Link href="/admin/tickets">Admin</Link>
            </Button>
          ) : null}
        </div>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{String(error)}</p>}
      <div className="w-full overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50/60 dark:bg-neutral-900/30">
            <tr className="text-left">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 px-4">{t.id}</td>
                  <td className="py-3 px-4">{t.subject}</td>
                  <td className="py-3 px-4"><span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs">{t.status}</span></td>
                  <td className="py-3 px-4">{t.priority}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/tickets/${t.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" onClick={() => (window.location.href = `/tickets/${t.id}/edit`)}>Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete ticket</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The ticket and all related messages will be permanently removed.
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
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4" colSpan={5}>
                  No tickets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
