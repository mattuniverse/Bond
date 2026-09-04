"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "@/lib/realtime/use-realtime";
import type { PartnerState } from "@/lib/queries";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { Card } from "@/components/ui/Card";
import type { AvatarConfig } from "@/types";

interface HomeContentProps {
  userId: string;
  username: string;
  partner: PartnerState;
}

function toAvatarConfig(record: Record<string, string> | null): AvatarConfig | null {
  if (!record) return null;
  return {
    character: record.character,
    face: record.face,
    hair: record.hair,
    outfit: record.outfit,
    accessory: record.accessory,
  };
}

export function HomeContent({ userId, username, partner }: HomeContentProps) {
  const client = useMemo(() => createClient(), []);
  const myConfig = toAvatarConfig(partner.myAvatar);
  const partnerConfig = toAvatarConfig(partner.partnerAvatar);

  const { partnerOnline } = useRealtime(client, {
    userId,
    partnerId: partner.partnerId,
    enabled: !!partner.partnerId,
  });

  useEffect(() => {
    // Keep presence fresh while the page is open.
  }, []);

  const isConnected = partner.connectionStatus === "accepted";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome, {username} <span aria-hidden>💕</span>
        </h1>
      </div>

      {!isConnected ? (
        <Card className="text-center">
          <div className="mb-3 text-5xl">🤍</div>
          <h2 className="text-xl font-semibold text-zinc-800">You're not connected yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Share a Love Code with your person to start sending affection.
          </p>
          <Link
            href="/connection"
            className="mt-4 inline-flex rounded-full bg-pink-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-600"
          >
            Connect with someone
          </Link>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-end gap-6">
              <div className="flex flex-col items-center gap-1">
                <AvatarRenderer config={myConfig ?? defaultConfig} size={88} />
                <span className="text-xs font-medium text-zinc-500">You</span>
              </div>
              <span className="pb-8 text-2xl text-pink-300" aria-hidden>
                💗
              </span>
              <div className="flex flex-col items-center gap-1">
                <AvatarRenderer
                  config={partnerConfig ?? defaultConfig}
                  size={88}
                  className="opacity-80"
                />
                <span className="text-xs font-medium text-zinc-500">
                  {partner.partnerUsername}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  partnerOnline ? "bg-emerald-500" : "bg-zinc-300"
                }`}
              />
              <span className="text-sm text-zinc-600">
                {partnerOnline ? "Online now" : "Away for now"}
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/affection"
                className="rounded-full bg-pink-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-600"
              >
                Send affection
              </Link>
              <Link
                href="/history"
                className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-medium text-pink-600 hover:bg-pink-50"
              >
                View history
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

const defaultConfig: AvatarConfig = {
  character: "cat",
  face: "happy",
  hair: "short",
  outfit: "tee",
  accessory: "none",
};
