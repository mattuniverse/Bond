"use client";

import { useMemo, useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  claimLoveCode,
  generateLoveCode,
  respondToConnection,
} from "@/lib/connections/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface PendingRequest {
  id: string;
  requesterUsername: string;
}

interface ConnectionContentProps {
  hasActiveCode: string | null;
  pending: PendingRequest[];
}

export function ConnectionContent({ hasActiveCode, pending }: ConnectionContentProps) {
  const client = useMemo(() => createClient(), []);
  const [myCode, setMyCode] = useState<string | null>(hasActiveCode);
  const [codeLoading, setCodeLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [respondError, setRespondError] = useState<string | null>(null);
  const [pendingState, setPendingState] = useState<PendingRequest[]>(pending);
  const [isPending, startTransition] = useTransition();

  // Surface auth errors consistently later; keep the client available for future use.
  void client;

  async function onGenerate() {
    setCodeLoading(true);
    const res = await generateLoveCode();
    if ("code" in res) {
      setMyCode(res.code);
    } else {
      // eslint-disable-next-line no-alert
      alert(res.error);
    }
    setCodeLoading(false);
  }

  async function onClaim(fd: FormData) {
    setClaimError(null);
    setClaimSuccess(null);
    const res = await claimLoveCode(fd);
    if (res?.error) {
      setClaimError(res.error);
    } else {
      setClaimSuccess("Love Code accepted! They'll see your request. 🤍");
    }
  }

  async function onRespond(fd: FormData) {
    setRespondError(null);
    const connectionId = String(fd.get("connectionId") ?? "");
    const action = String(fd.get("action") ?? "");
    const res = await respondToConnection(fd);
    if (res?.error) {
      setRespondError(res.error);
    } else {
      setPendingState((prev) => prev.filter((p) => p.id !== connectionId));
      if (action === "accept") {
        setClaimSuccess("You're connected! 🎉");
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Connect with your person</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Your code */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-800">Your Love Code</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Share this with someone so you two can bond.
          </p>

          {myCode ? (
            <div className="mt-4 rounded-xl border border-dashed border-pink-300 bg-pink-50 p-4 text-center">
              <div className="text-3xl font-black tracking-[0.3em] text-pink-600">
                {myCode}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(myCode)}
                className="mt-3 text-xs font-medium text-pink-500 hover:underline"
              >
                Tap to copy
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-400">You don't have a Love Code yet.</p>
          )}

          <Button
            className="mt-4 w-full"
            variant="secondary"
            loading={codeLoading}
            onClick={onGenerate}
          >
            {myCode ? "Generate a fresh code" : "Generate my Love Code"}
          </Button>
          <p className="mt-2 text-xs text-zinc-400">
            Codes expire after 48 hours and can only be used once.
          </p>
        </Card>

        {/* Enter a code */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-800">Enter a Love Code</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Type the code your person shared with you.
          </p>

          <form action={(fd) => startTransition(() => onClaim(fd))} className="mt-4 space-y-3">
            <Input
              name="code"
              placeholder="e.g. BXK2PL"
              className="text-center font-mono text-lg uppercase tracking-widest"
              maxLength={6}
              autoComplete="off"
            />
            {claimError && <Alert>{claimError}</Alert>}
            {claimSuccess && <Alert tone="success">{claimSuccess}</Alert>}
            <Button type="submit" className="w-full" loading={isPending}>
              Connect
            </Button>
          </form>
        </Card>
      </div>

      {/* Pending requests */}
      {pendingState.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-zinc-800">Waiting for you</h2>
          <ul className="mt-3 space-y-3">
            {pendingState.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-zinc-700">
                  <span className="text-2xl align-middle" aria-hidden>
                    💌
                  </span>{" "}
                  {req.requesterUsername} wants to bond
                </span>
                <form
                  action={(fd) => startTransition(() => onRespond(fd))}
                  className="flex gap-2"
                >
                  <input type="hidden" name="connectionId" value={req.id} />
                  <Button
                    size="sm"
                    variant="secondary"
                    name="action"
                    value="decline"
                    type="submit"
                  >
                    Decline
                  </Button>
                  <Button size="sm" name="action" value="accept" type="submit">
                    Accept
                  </Button>
                </form>
              </li>
            ))}
          </ul>
          {respondError && (
            <div className="mt-3">
              <Alert>{respondError}</Alert>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
