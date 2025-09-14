import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Customer Support System</h1>
      <p className="text-muted-foreground max-w-prose">
        Create and track tickets, chat with admins in real-time. Please login or register to
        continue.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </main>
  );
}

