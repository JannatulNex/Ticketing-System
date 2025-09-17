import { API_BASE_URL, SOCKET_BASE_URL, apiUrl, backendUrl } from "@/lib/config";
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
  const { data, error, isLoading, mutate } = useSWR(
    apiUrl("tickets"),
    fetcher
  );

  return (
    <main className="container py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Button asChild>
          <Link href="/tickets/new">New Ticket</Link>
        </Button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{String(error)}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((t: any) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2 pr-4">{t.id}</td>
                  <td className="py-2 pr-4">{t.subject}</td>
                  <td className="py-2 pr-4">{t.status}</td>
                  <td className="py-2 pr-4">
                    <Button variant="outline" asChild>
                      <Link href={`/tickets/${t.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4" colSpan={4}>
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

