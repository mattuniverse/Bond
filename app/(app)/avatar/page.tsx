import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import { getCurrentUser } from "@/lib/queries";

export default async function AvatarPage() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  let avatar: Record<string, string> | null = null;
  try {
    const { data } = await supabase
      .from("avatars")
      .select("character, face, hair, outfit, accessory")
      .eq("owner_id", user.id)
      .maybeSingle();
    avatar = data as Record<string, string> | null;
  } catch (err) {
    console.error("AvatarPage load failed:", err);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Your avatar</h1>
      <AvatarBuilder
        initial={
          avatar
            ? {
                character: avatar.character,
                face: avatar.face,
                hair: avatar.hair,
                outfit: avatar.outfit,
                accessory: avatar.accessory,
              }
            : null
        }
      />
    </div>
  );
}
