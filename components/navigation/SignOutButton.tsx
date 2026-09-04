"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={pending}
      onClick={() => startTransition(() => signOut())}
    >
      Sign out
    </Button>
  );
}
