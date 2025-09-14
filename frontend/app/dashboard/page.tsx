"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => setToken(localStorage.getItem("token")), []);

  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {token ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">You are logged in.</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/tickets">Go to Tickets</Link>
            </Button>
            <Button
              variant="outline"
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

