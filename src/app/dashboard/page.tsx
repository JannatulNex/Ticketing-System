"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => setToken(localStorage.getItem("token")), []);

  const role = token ? (JSON.parse(atob((token as string).split('.')[1] || 'null') || 'null')?.role as 'ADMIN' | 'CUSTOMER' | undefined) : undefined;
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {token ? (
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">Logged in as <span className="font-medium">{role || 'User'}</span></p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/tickets">My Tickets</Link>
            </Button>
            {role === 'ADMIN' ? (
              <Button variant="outline" asChild>
                <Link href="/admin/tickets">Admin Tickets</Link>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <p>Please login to continue.</p>
      )}
    </main>
  );
}
