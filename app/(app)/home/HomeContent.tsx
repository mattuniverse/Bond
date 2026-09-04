"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "@/lib/realtime/use-realtime";
import type { PartnerState } from "@/lib/queries";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { Button } from "@/components/ui/Button";
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
        <h1 className="text-2xl font-light text-zinc-900">
          Welcome, {username}
        </h1>
      </div>

      {!isConnected ? (
        <Card className="text-center">
          <svg className="mx-auto mb-3 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2 className="text-xl font-medium text-zinc-800">You&apos;re not connected yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#9C8878]">
            Share a Love Code with your person to start sending affection.
          </p>
          <Link href="/connection" className="mt-4 inline-block">
            <Button>Connect with someone</Button>
          </Link>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-end gap-6">
              <div className="flex flex-col items-center gap-1">
                <AvatarRenderer config={myConfig ?? defaultConfig} size={88} />
                <span className="text-xs font-medium text-[#9C8878]">You</span>
              </div>
              <span className="pb-8 text-2xl text-[#C4A882]" aria-hidden>
                ×
              </span>
              <div className="flex flex-col items-center gap-1">
                <AvatarRenderer
                  config={partnerConfig ?? defaultConfig}
                  size={88}
                  className="opacity-80"
                />
                <span className="text-xs font-medium text-[#9C8878]">
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
              <span className="text-sm text-[#7A6355]">
                {partnerOnline ? "Online now" : "Away for now"}
              </span>
            </div>
            <div className="flex gap-3">
              <Link href="/affection">
                <Button>Send affection</Button>
              </Link>
              <Link href="/history">
                <Button variant="secondary">View history</Button>
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
