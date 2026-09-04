"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { useRealtime, type RealtimeInteraction } from "@/lib/realtime/use-realtime";
import { INTERACTIONS } from "@/lib/interactions/catalog";
import { sendInteraction } from "@/lib/interactions/actions";
import type { PartnerState } from "@/lib/queries";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { PlaceholderAnimation } from "@/components/interaction/PlaceholderAnimation";
import { Alert } from "@/components/ui/Alert";
import type { AvatarConfig } from "@/types";

interface AffectionContentProps {
  userId: string;
  partner: PartnerState;
}

function toConfig(record: Record<string, string> | null): AvatarConfig | null {
  if (!record) return null;
  return {
    character: record.character,
    face: record.face,
    hair: record.hair,
    outfit: record.outfit,
    accessory: record.accessory,
  };
}

export function AffectionContent({ userId, partner }: AffectionContentProps) {
  const client = useMemo(() => createClient(), []);
  const partnerConfig = toConfig(partner.partnerAvatar);
  const [active, setActive] = useState<RealtimeInteraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const connected = partner.connectionStatus === "accepted";

  useRealtime(client, {
    userId,
    partnerId: partner.partnerId,
    enabled: connected,
    onInteraction: (row) => setActive(row),
  });

  async function onSend(id: string) {
    if (!partner.partnerId) return;
    setError(null);
    setSendingId(id);
    const res = await sendInteraction(partner.partnerId, id);
    setSendingId(null);
    if (res?.error) setError(res.error);
  }

  if (!connected) {
    return (
      <div className="text-center">
        <div className="mb-3 text-5xl">💌</div>
        <h1 className="text-2xl font-bold text-zinc-900">Connect first</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
          You need to be connected to someone before you can send affection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Send affection</h1>
        <div className="flex items-center gap-2">
          {partnerConfig && <AvatarRenderer config={partnerConfig} size={40} />}
          <span className="text-sm font-medium text-zinc-600">{partner.partnerUsername}</span>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INTERACTIONS.map((interaction) => (
          <button
            key={interaction.id}
            type="button"
            onClick={() => onSend(interaction.id)}
            disabled={!!sendingId}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-pink-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md disabled:opacity-60"
          >
            <span className="text-4xl transition-transform group-hover:scale-110">
              {interaction.icon}
            </span>
            <span className="text-sm font-semibold text-zinc-700">
              {interaction.name}
            </span>
            {sendingId === interaction.id && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500" />
            )}
          </button>
        ))}
      </div>

      {/* Incoming animation overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PlaceholderAnimation animationId={active.animation_id} />
              <button
                type="button"
                onClick={() => setActive(null)}
                className="w-full border-t border-pink-100 py-3 text-sm font-medium text-pink-600 hover:bg-pink-50"
              >
                Aww, thanks 💕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
