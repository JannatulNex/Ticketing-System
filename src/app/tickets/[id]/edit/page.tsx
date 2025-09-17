"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { apiUrl, backendUrl } from "@/lib/config";

const UpdateTicketInput = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(3),
  category: z.enum(["Billing", "Technical", "General"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
});

const extractFileName = (path?: string | null) => {
  if (!path) return null;
  try {
    const segments = path.split("/");
    return segments[segments.length - 1];
  } catch {
    return path;
  }
};

export default function EditTicketPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  const [newAttachment, setNewAttachment] = useState<File | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<string | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof UpdateTicketInput>>({
    resolver: zodResolver(UpdateTicketInput),
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(apiUrl(`tickets/${id}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const ticket = await res.json();
      setValue("subject", ticket.subject);
      setValue("description", ticket.description);
      setValue("category", ticket.category);
      setValue("priority", ticket.priority);
      setCurrentAttachment(ticket.attachment ?? null);
      setRemoveAttachment(false);
      setNewAttachment(null);
    };
    if (id) void load();
  }, [id, setValue, token]);

  const onSubmit = async (data: z.infer<typeof UpdateTicketInput>) => {
    setError(null);
    const formData = new FormData();
    formData.append("subject", data.subject);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    if (newAttachment) formData.append("attachment", newAttachment);
    if (!newAttachment && removeAttachment && currentAttachment) {
      formData.append("removeAttachment", "true");
    }

    const res = await fetch(apiUrl(`tickets/${id}`), {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (res.ok) {
      router.push(`/tickets/${id}`);
    } else {
      setError("Failed to update ticket");
    }
  };

  const existingFile = !removeAttachment && currentAttachment
    ? {
        name: extractFileName(currentAttachment) ?? "attachment",
        url: backendUrl(currentAttachment),
      }
    : null;

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Edit Ticket</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Subject</Label>
              <Input {...register("subject")} />
              {errors.subject?.message && (
                <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} {...register("description")} />
              {errors.description?.message && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
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
                value={newAttachment}
                onChange={(file) => {
                  setNewAttachment(file);
                  if (file) setRemoveAttachment(false);
                }}
                existingFile={existingFile}
                onRemoveExisting={currentAttachment ? () => setRemoveAttachment(true) : undefined}
                hint="Upload a new file to replace the current attachment"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
