"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { FileDropzone } from "@/components/ui/file-dropzone";

const UpdateTicketInput = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(3),
  category: z.enum(["Billing", "Technical", "General"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
});
type FormValues = z.infer<typeof UpdateTicketInput>;

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

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(UpdateTicketInput),
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`http://localhost:4000/api/tickets/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const t = await res.json();
      setValue('subject', t.subject);
      setValue('description', t.description);
      setValue('category', t.category);
      setValue('priority', t.priority);
      setCurrentAttachment(t.attachment ?? null);
      setRemoveAttachment(false);
      setNewAttachment(null);
    };
    if (id) load();
  }, [id, setValue, token]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    if (newAttachment) {
      formData.append('attachment', newAttachment);
    } else if (removeAttachment && currentAttachment) {
      formData.append('removeAttachment', 'true');
    }

    const res = await fetch(`http://localhost:4000/api/tickets/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (res.ok) {
      router.push(`/tickets/${id}`);
    } else {
      setError('Failed to update ticket');
    }
  };

  const existingFile = !removeAttachment && currentAttachment
    ? {
        name: extractFileName(currentAttachment) ?? 'attachment',
        url: `http://localhost:4000${currentAttachment}`,
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
                <p className="text-sm text-red-600 mt-1">{errors.subject?.message as string}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} {...register("description")} />
              {errors.description?.message && (
                <p className="text-sm text-red-600 mt-1">{errors.description?.message as string}</p>
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
