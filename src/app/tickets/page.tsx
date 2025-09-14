"use client";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load tickets");
  return res.json();
};

export default function TicketsPage() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:4000/api/tickets",
    fetcher
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/tickets/new">New Ticket</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/tickets">Admin</Link>
          </Button>
        </div>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{String(error)}</p>}
      <div className="w-full overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
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
              data.map((t: any) => (
                <tr key={t.id}>
                  <td className="py-3 px-4">{t.id}</td>
                  <td className="py-3 px-4">{t.subject}</td>
                  <td className="py-3 px-4"><span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs">{t.status}</span></td>
                  <td className="py-3 px-4">{t.priority}</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" asChild>
                      <Link href={`/tickets/${t.id}`}>View</Link>
                    </Button>
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
