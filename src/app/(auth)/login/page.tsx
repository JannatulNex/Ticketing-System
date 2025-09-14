"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput } from "@support/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type FormValues = z.infer<typeof LoginInput>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(LoginInput),
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Login failed");
      const json = await res.json();
      localStorage.setItem("token", json.token);
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e?.message || "Login failed");
    }
  };

  return (
    <main className="max-w-md mx-auto px-6 py-12">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Login</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
