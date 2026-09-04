"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ConnectionResult = { error?: string } | undefined;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const CODE_TTL_HOURS = 48;

function randomCode(): string {
  let code = "";
  const rand = new Uint32Array(CODE_LENGTH);
  crypto.getRandomValues(rand);
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[rand[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function generateLoveCode(): Promise<{ code: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in to make a Love Code. 💕" };

  const existing = await supabase
    .from("love_codes")
    .select("id, code")
    .eq("owner_id", user.id)
    .is("used_by", null)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing.data?.code && !existing.error) {
    return { code: existing.data.code };
  }

  let code = randomCode();
  let inserted = false;
  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    const expiresAt = new Date(Date.now() + CODE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from("love_codes").insert({
      code,
      owner_id: user.id,
      expires_at: expiresAt,
    });
    if (!error) {
      inserted = true;
    } else {
      code = randomCode();
    }
  }

  if (!inserted) {
    return { error: "Couldn't make a Love Code right now. Try again in a moment. 🙈" };
  }

  revalidatePath("/connection");
  return { code };
}

export async function claimLoveCode(formData: FormData): Promise<ConnectionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in first, then we'll connect you. 💕" };

  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (raw.length !== CODE_LENGTH) {
    return { error: "That Love Code looks a little off — it should be 6 characters. 💕" };
  }

  const { data: codeRow, error: codeError } = await supabase
    .from("love_codes")
    .select("id, owner_id, used_by, expires_at")
    .eq("code", raw)
    .maybeSingle();

  if (codeError || !codeRow) {
    return { error: "Oops! That Love Code doesn't seem to work. 💕" };
  }

  if (codeRow.owner_id === user.id) {
    return { error: "That's your own Love Code — share it with your person instead. 💕" };
  }

  if (codeRow.used_by) {
    return { error: "That Love Code has already been claimed. 🤍" };
  }

  if (new Date(codeRow.expires_at).getTime() < Date.now()) {
    return { error: "That Love Code has expired. Ask for a fresh one! 💕" };
  }

  const { data: existing } = await supabase
    .from("connections")
    .select("id, status")
    .or(`and(user_id.eq.${user.id},partner_id.eq.${codeRow.owner_id}),and(user_id.eq.${codeRow.owner_id},partner_id.eq.${user.id})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      return { error: "You two are already connected. 💕" };
    }
    return { error: "There's already a connection here — check your pending requests. 💕" };
  }

  // Mark code used and create a pending connection (owner -> claimer).
  const { error: usedError } = await supabase
    .from("love_codes")
    .update({ used_by: user.id })
    .eq("id", codeRow.id);

  if (usedError) return { error: "That Love Code just got taken. Ask for a fresh one. 🙈" };

  const { error: connError } = await supabase.from("connections").insert({
    user_id: codeRow.owner_id,
    partner_id: user.id,
    status: "pending",
  });

  if (connError) {
    await supabase.from("love_codes").update({ used_by: null }).eq("id", codeRow.id);
    return { error: "Couldn't start the connection. Try again in a moment. 💕" };
  }

  revalidatePath("/connection");
  return undefined;
}

export async function respondToConnection(formData: FormData): Promise<ConnectionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in first, then we'll connect you. 💕" };

  const connectionId = String(formData.get("connectionId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (action !== "accept" && action !== "decline") {
    return { error: "Something went wrong with that request. 🙈" };
  }

  const { data: conn } = await supabase
    .from("connections")
    .select("id, partner_id, status")
    .eq("id", connectionId)
    .eq("partner_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!conn) return { error: "That request is no longer available. 🙈" };

  const { error } = await supabase
    .from("connections")
    .update({ status: action === "accept" ? "accepted" : "declined" })
    .eq("id", conn.id);

  if (error) return { error: "Couldn't update that request. Try again. 💕" };

  revalidatePath("/connection");
  return undefined;
}

export async function requireConnection() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
