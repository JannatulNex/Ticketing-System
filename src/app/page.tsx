import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-10">
      <section className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Customer Support Ticketing System
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-base md:text-lg">
          Create and track tickets, add comments, and chat in real-time with admins. Secure JWT
          auth with role-based access for customers and admins.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Register</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-16 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
          <h3 className="font-semibold mb-1">Ticket Management</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Create, view, and update your tickets with categories, priorities, and attachments.
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
          <h3 className="font-semibold mb-1">Real-Time Chat</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Chat with admins inside each ticket using WebSockets for instant updates.
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
          <h3 className="font-semibold mb-1">Comments & History</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Keep context with timestamped comments from both customers and admins.
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
          <h3 className="font-semibold mb-1">Admin Controls</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Manage all tickets and update statuses from Open to Closed.
          </p>
        </div>
      </section>
    </main>
  );
}

