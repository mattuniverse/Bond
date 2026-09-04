import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import { getCurrentUser } from "@/lib/queries";

export default async function AvatarPage() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const { data: avatar } = await supabase
    .from("avatars")
    .select("character, face, hair, outfit, accessory")
    .eq("owner_id", user.id)
    .maybeSingle();

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
