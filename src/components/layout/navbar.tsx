"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { decodeJwt } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const role = useMemo(() => decodeJwt(token)?.role, [token]);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-neutral-200 bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Support System</Link>
          <nav className="hidden gap-3 text-sm md:flex">
            <Link className="hover:underline" href="/dashboard">Dashboard</Link>
            <Link className="hover:underline" href="/tickets">Tickets</Link>
            {role === 'ADMIN' ? (
              <Link className="hover:underline" href="/admin/tickets">Admin</Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {role ? (
            <Badge variant={role === 'ADMIN' ? 'warning' : 'info'}>Role: {role}</Badge>
          ) : null}
          <button className="md:hidden rounded-md border px-3 py-1 text-sm" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">Menu</button>
          {token ? (
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden ${open ? 'block' : 'hidden'} border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90`}> 
        <div className="mx-auto max-w-6xl px-6 py-3 space-y-2">
          <nav className="flex flex-col gap-2 text-sm">
            <Link className="hover:underline" href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link className="hover:underline" href="/tickets" onClick={() => setOpen(false)}>Tickets</Link>
            {role === 'ADMIN' ? (
              <Link className="hover:underline" href="/admin/tickets" onClick={() => setOpen(false)}>Admin</Link>
            ) : null}
          </nav>
          {!token ? (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
