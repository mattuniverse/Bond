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
          <svg className="mx-auto mb-3 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="#2C1A0E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h1 className="text-3xl font-light tracking-wide text-zinc-900">Join Bond</h1>
          <p className="mt-1 text-[#9C8878]">A tiny world for exactly two of you.</p>
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

        <p className="mt-6 text-center text-sm text-[#9C8878]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#2C1A0E] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
