"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

import { signUp } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">💘</div>
          <h1 className="text-3xl font-bold text-zinc-900">Join Bond</h1>
          <p className="mt-1 text-zinc-500">A tiny world for exactly two of you.</p>
        </div>

        <form
          ref={formRef}
          action={(fd) =>
            startTransition(async () => {
              const res = await signUp(fd);
              if (res?.error) {
                setError(res.error);
                formRef.current?.reset();
              }
            })
          }
          className="space-y-4"
        >
          <Input label="Username" name="username" autoComplete="nickname" required />
          <Input label="Email" name="email" type="email" autoComplete="email" required />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="At least 6 characters."
            required
          />

          {error && <Alert>{error}</Alert>}

          <Button type="submit" className="w-full" size="lg" loading={pending}>
            Create my account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-pink-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
