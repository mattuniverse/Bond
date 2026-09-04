"use server";

import { createClient } from "@/lib/supabase/server";
import { getInteraction } from "@/lib/interactions/catalog";

export type SendResult = { error?: string } | undefined;

/**
 * Server-side trust: the client never supplies a `receiverId` we blindly trust
 * outside of what the DB RLS enforces. This action validates that the sender is
 * authed, the interaction type is real, and the RLS insert enforces that the
 * sender↔receiver have an accepted connection row.
 */
export async function sendInteraction(receiverId: string, interactionId: string): Promise<SendResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to send something sweet. 💕" };

  const def = getInteraction(interactionId);
  if (!def) return { error: "Hmm, that interaction doesn't exist yet. 🙈" };

  const { error } = await supabase.from("interactions").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    type: def.id,
    animation_id: def.animationId,
  });

  if (error) {
    if (error.code === "42501" || error.message.toLowerCase().includes("policy")) {
      return {
        error: "You can only send to someone you're connected with. 💕",
      };
    }
    if (error.message.toLowerCase().includes("connection")) {
      return { error: "You two aren't connected yet. 💕" };
    }
    return { error: "Couldn't send that right now. Try again in a moment. 🙈" };
  }

  return undefined;
}
