"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AVATAR_LAYERS } from "@/lib/avatar/catalog";
import type { AvatarLayer } from "@/types";

export type AvatarResult = { error?: string } | undefined;

const VALID = new Set<AvatarLayer>(AVATAR_LAYERS.map((l) => l.key));

/**
 * Validates and upserts the current user's avatar config. Only known layer
 * keys and option ids (checked against the catalog) are accepted.
 */
export async function saveAvatar(config: Record<AvatarLayer, string>): Promise<AvatarResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to save your avatar. 💕" };

  for (const layer of AVATAR_LAYERS) {
    const value = config[layer.key];
    if (!layer.options.some((o) => o.id === value)) {
      return { error: "Something didn't look right in your avatar. Try again. 🙈" };
    }
  }

  const { error } = await supabase.from("avatars").upsert(
    {
      owner_id: user.id,
      character: config.character,
      face: config.face,
      hair: config.hair,
      outfit: config.outfit,
      accessory: config.accessory,
    },
    { onConflict: "owner_id" },
  );

  if (error) {
    return { error: "Couldn't save your avatar right now. Try again. 🙈" };
  }

  revalidatePath("/home");
  revalidatePath("/avatar");
  return undefined;
}

export async function saveAndContinue(config: Record<AvatarLayer, string>): Promise<void> {
  const res = await saveAvatar(config);
  if (res?.error) throw new Error(res.error);
  revalidatePath("/", "layout");
  redirect("/home");
}
