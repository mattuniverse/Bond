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
  if (!user) return { error: "You need to be logged in to make a Love Code." };

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
    return { error: "Couldn't make a Love Code right now. Try again in a moment." };
  }

  revalidatePath("/connection");
  return { code };
}

export async function claimLoveCode(formData: FormData): Promise<ConnectionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in first, then we'll connect you." };

  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (raw.length !== CODE_LENGTH) {
    return { error: "That Love Code looks a little off — it should be 6 characters." };
  }

  const { data, error } = await supabase.rpc("claim_love_code", { p_code: raw });

  if (error) {
    return { error: "Couldn't claim that Love Code right now. Try again in a moment." };
  }

  const result = (data ?? {}) as { ok?: boolean; error?: string };
  if (!result.ok) {
    return { error: result.error ?? "That Love Code doesn't seem to work." };
  }

  revalidatePath("/connection");
  return undefined;
}

export async function respondToConnection(formData: FormData): Promise<ConnectionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in first, then we'll connect you." };

  const connectionId = String(formData.get("connectionId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (action !== "accept" && action !== "decline") {
    return { error: "Something went wrong with that request." };
  }

  const { data: conn } = await supabase
    .from("connections")
    .select("id, partner_id, status")
    .eq("id", connectionId)
    .eq("partner_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!conn) return { error: "That request is no longer available." };

  const { error } = await supabase
    .from("connections")
    .update({ status: action === "accept" ? "accepted" : "declined" })
    .eq("id", conn.id);

  if (error) return { error: "Couldn't update that request. Try again." };

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
