import { getCurrentUser } from "@/lib/queries";
import { ConnectionContent } from "./ConnectionContent";

export default async function ConnectionPage() {
  const { supabase, user } = await getCurrentUser();

  if (!user) return null;

  const now = new Date().toISOString();

  const [codeRes, pendingRes] = await Promise.all([
    supabase
      .from("love_codes")
      .select("code")
      .eq("owner_id", user.id)
      .is("used_by", null)
      .gte("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id, user_id")
      .eq("partner_id", user.id)
      .eq("status", "pending"),
  ]);

  const myCode = codeRes.data?.code ?? null;

  let pending: { id: string; requesterUsername: string }[] = [];
  if (pendingRes.data?.length) {
    const requesterIds = pendingRes.data.map((c) => c.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", requesterIds);
    const byId = new Map(profiles?.map((p) => [p.id, p.username]));
    pending = pendingRes.data.map((c) => ({
      id: c.id,
      requesterUsername: byId.get(c.user_id) ?? "someone",
    }));
  }

  return <ConnectionContent hasActiveCode={myCode} pending={pending} />;
}
