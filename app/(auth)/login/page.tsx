"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

import { signIn } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Change these to match the two test accounts you created in Supabase.
const TEST_ACCOUNTS = [
  { label: "Test Account A", email: "a@test.com", password: "password123" },
  { label: "Test Account B", email: "b@test.com", password: "password123" },
];

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [defaults, setDefaults] = useState({ email: "", password: "" });

  function applyDefaults(account: { email: string; password: string }) {
    setDefaults(account);
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <svg className="mx-auto mb-3 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="#2C1A0E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h1 className="text-3xl font-light tracking-wide text-zinc-900">Welcome back</h1>
          <p className="mt-1 text-[#9C8878]">Your someone missed you.</p>
        </div>

        <form
          ref={formRef}
          action={(fd) =>
            startTransition(async () => {
              const res = await signIn(fd);
              if (res?.error) {
                setError(res.error);
                formRef.current?.reset();
              }
            })
          }
          className="space-y-4"
        >
          <Input label="Email" name="email" type="email" autoComplete="email" defaultValue={defaults.email} required />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue={defaults.password}
            required
          />

          {error && <Alert>{error}</Alert>}

          <Button type="submit" className="w-full" size="lg" loading={pending}>
            Come back in
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#B8A898]">Quick fill for testing</span>
          <div className="flex gap-2">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => applyDefaults(account)}
                className="rounded-full border border-[#E8DACE] bg-[#FDFAF6] px-3 py-1.5 text-xs font-medium text-[#7A6355] transition-colors hover:border-[#C4A882] hover:text-[#2C1A0E]"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#9C8878]">
          New to Bond?{" "}
          <Link href="/register" className="font-medium text-[#2C1A0E] hover:underline">
            Make an account
          </Link>
        </p>
      </div>
    </div>
  );
}
