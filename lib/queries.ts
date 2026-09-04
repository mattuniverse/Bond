import { createClient } from "@/lib/supabase/server";

export interface PartnerState {
  partnerId: string | null;
  partnerUsername: string | null;
  partnerAvatar: Record<string, string> | null;
  myAvatar: Record<string, string> | null;
  connectionId: string | null;
  connectionStatus: string | null;
}

/**
 * Loads the signed-in user plus their profile. Throws/redirects handled by
 * callers — use with the middleware for protection.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { supabase, user: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", user.id)
      .maybeSingle();

    return { supabase, user, profile };
  } catch (err) {
    console.error("getCurrentUser failed:", err);
    return { supabase, user: null, profile: null };
  }
}

/** Loads the current user's avatar, accepted connection, and partner data. */
export async function getPartnerState(userId: string): Promise<PartnerState> {
  const supabase = await createClient();
  const empty = {
    partnerId: null,
    partnerUsername: null,
    partnerAvatar: null,
    myAvatar: null,
    connectionId: null,
    connectionStatus: null,
  } satisfies PartnerState;

  try {
    const { data: myAvatar } = await supabase
      .from("avatars")
      .select("character, face, hair, outfit, accessory")
      .eq("owner_id", userId)
      .maybeSingle();

    const { data: conn } = await supabase
      .from("connections")
      .select("id, user_id, partner_id, status")
      .or(`and(user_id.eq.${userId},status.eq.accepted),and(partner_id.eq.${userId},status.eq.accepted)`)
      .limit(1)
      .maybeSingle();

  if (!conn || conn.status !== "accepted") {
    return {
      partnerId: null,
      partnerUsername: null,
      partnerAvatar: null,
      myAvatar: myAvatar
        ? {
            character: myAvatar.character,
            face: myAvatar.face,
            hair: myAvatar.hair,
            outfit: myAvatar.outfit,
            accessory: myAvatar.accessory,
          }
        : null,
      connectionId: conn?.id ?? null,
      connectionStatus: conn?.status ?? null,
    };
  }

  const partnerId = conn.user_id === userId ? conn.partner_id : conn.user_id;
  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", partnerId)
    .maybeSingle();

  const { data: partnerAvatar } = await supabase
    .from("avatars")
    .select("character, face, hair, outfit, accessory")
    .eq("owner_id", partnerId)
    .maybeSingle();

  return {
    partnerId,
    partnerUsername: partnerProfile?.username ?? "them",
    partnerAvatar: partnerAvatar
      ? {
          character: partnerAvatar.character,
          face: partnerAvatar.face,
          hair: partnerAvatar.hair,
          outfit: partnerAvatar.outfit,
          accessory: partnerAvatar.accessory,
        }
      : null,
    myAvatar: myAvatar
      ? {
          character: myAvatar.character,
          face: myAvatar.face,
          hair: myAvatar.hair,
          outfit: myAvatar.outfit,
          accessory: myAvatar.accessory,
        }
      : null,
    connectionId: conn.id,
    connectionStatus: conn.status,
  };
  } catch (err) {
    console.error("getPartnerState failed:", err);
    return empty;
  }
}
