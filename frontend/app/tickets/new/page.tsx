"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTicketInput } from "@support/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FormValues = z.infer<typeof CreateTicketInput>;

export default function NewTicketPage() {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(CreateTicketInput),
    defaultValues: { priority: "Low", category: "General" } as any,
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      const created = await res.json();
      window.location.href = `/tickets/${created.id}`;
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  };

  return (
    <main className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-2xl font-semibold">New Ticket</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Subject</label>
          <Input {...register("subject")} />
          {errors.subject && (
            <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <Textarea rows={5} {...register("description")} />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("category")}
            >
              <option>Billing</option>
              <option>Technical</option>
              <option>General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("priority")}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Ticket"}
        </Button>
      </form>
    </main>
  );
}

