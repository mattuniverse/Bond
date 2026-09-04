"use client";

import { useEffect, useState } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

export interface RealtimeInteraction {
  id: string;
  sender_id: string;
  receiver_id: string;
  type: string;
  animation_id: string;
  created_at: string;
}

export interface RealtimePresence {
  user_id: string;
  online_at: number;
}

export interface UseRealtimeOptions {
  userId: string;
  partnerId?: string | null;
  onInteraction?: (event: RealtimeInteraction) => void;
  onPresence?: (presence: RealtimePresence | null) => void;
  enabled?: boolean;
}

/**
 * Subscribes to interactions received by the current user and, optionally,
 * the partner's presence channel. The realtime event is a *trigger* that
 * reflects an already-validated DB row (see lib/interactions/actions.ts).
 */
export function useRealtime(client: SupabaseClient, opts: UseRealtimeOptions) {
  const {
    userId,
    partnerId,
    onInteraction,
    onPresence,
    enabled = true,
  } = opts;

  const [incoming, setIncoming] = useState<RealtimeInteraction[]>([]);
  const [partnerOnline, setPartnerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let presenceChannel: any = null;

    const interactionsChannel = client
      .channel(`interactions:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as unknown as RealtimeInteraction;
          setIncoming((prev) => [row, ...prev]);
          onInteraction?.(row);
        },
      )
      .subscribe();

    if (partnerId) {
      presenceChannel = client
        .channel(`presence:${partnerId}`)
        .on(
          "presence",
          { event: "sync" },
          () => {
            const state = presenceChannel?.presenceState?.() ?? {};
            setPartnerOnline(Object.keys(state).length > 0);
            onPresence?.(Object.keys(state).length > 0 ? { user_id: partnerId, online_at: Date.now() } : null);
          },
        )
        .on(
          "presence",
          { event: "join" },
          () => {
            setPartnerOnline(true);
            onPresence?.({ user_id: partnerId, online_at: Date.now() });
          },
        )
        .on(
          "presence",
          { event: "leave" },
          () => {
            setPartnerOnline(false);
            onPresence?.(null);
          },
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            presenceChannel?.track({ user_id: userId, online_at: Date.now() });
          }
        });
    }

    return () => {
      client.removeChannel(interactionsChannel);
      if (presenceChannel) client.removeChannel(presenceChannel);
    };
  }, [client, userId, partnerId, enabled, onInteraction, onPresence]);

  return { incoming, partnerOnline };
}
