"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTicketInput } from "@support/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { apiUrl } from "@/lib/config";

type FormValues = z.infer<typeof CreateTicketInput>;

export default function NewTicketPage() {
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(CreateTicketInput),
    defaultValues: { priority: "Low", category: "General" },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("subject", data.subject);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    try {
      const res = await fetch(apiUrl("tickets"), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      const created = await res.json();
      window.location.href = `/tickets/${created.id}`;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create ticket");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">New Ticket</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Subject</Label>
              <Input {...register("subject")} />
              {errors.subject?.message ? (
                <p className="text-sm text-red-600 mt-1">{errors.subject?.message as string}</p>
              ) : null}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} {...register("description")} />
              {errors.description?.message ? (
                <p className="text-sm text-red-600 mt-1">{errors.description?.message as string}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="h-9 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm"
                  {...register("category")}
                >
                  <option>Billing</option>
                  <option>Technical</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  className="h-9 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm"
                  {...register("priority")}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Attachment</Label>
              <FileDropzone
                value={attachment}
                onChange={setAttachment}
                hint="PDF, PNG, JPG, MP4 up to 25MB"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
