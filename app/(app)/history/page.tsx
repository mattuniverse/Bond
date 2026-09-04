import { getCurrentUser } from "@/lib/queries";
import { INTERACTIONS } from "@/lib/interactions/catalog";
import { Card } from "@/components/ui/Card";

async function loadHistory(supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>, userId: string, partnerId: string | null) {
  const { data } = await supabase
    .from("interactions")
    .select("id, sender_id, receiver_id, type, animation_id, created_at")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function HistoryPage() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const { data: conn } = await supabase
    .from("connections")
    .select("user_id, partner_id")
    .or(`and(user_id.eq.${user.id},status.eq.accepted),and(partner_id.eq.${user.id},status.eq.accepted)`)
    .limit(1)
    .maybeSingle();

  const partnerId = conn ? (conn.user_id === user.id ? conn.partner_id : conn.user_id) : null;

  let partnerUsername: string | null = null;
  if (partnerId) {
    const { data: p } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", partnerId)
      .maybeSingle();
    partnerUsername = p?.username ?? "them";
  }

  const rows = await loadHistory(supabase, user.id, partnerId);

  const byId = new Map(INTERACTIONS.map((i) => [i.id, i]));
  const iconById = (id: string) => byId.get(id)?.icon ?? "💞";
  const nameById = (id: string) => byId.get(id)?.name ?? "affection";

  // Group by day.
  const groups: { day: string; label: string; items: typeof rows }[] = [];
  for (const row of rows) {
    const day = new Date(row.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.items.push(row);
    } else {
      groups.push({ day, label: day, items: [row] });
    }
  }

  const today = new Date().toDateString();

  if (!conn || rows.length === 0) {
    return (
      <div className="text-center">
        <div className="mb-3 text-5xl">📖</div>
        <h1 className="text-2xl font-bold text-zinc-900">History</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
          Once you're connected and start sharing moments, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">History</h1>
      {groups.length === 0 ? (
        <Card className="text-center text-sm text-zinc-400">
          No moments yet — send your first one! 💕
        </Card>
      ) : (
        groups.map((group) => (
          <section key={group.day}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              {group.day === today ? "Today" : group.label}
            </h2>
            <ul className="space-y-2">
              {group.items.map((item) => {
                const outgoing = item.sender_id === user.id;
                const label = outgoing ? `You sent a ${nameById(item.type)}` : `${partnerUsername ?? "They"} sent a ${nameById(item.type)}`;
                const time = new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li key={item.id}>
                    <Card className="flex items-center gap-3 py-3">
                      <span className="text-2xl" aria-hidden>
                        {iconById(item.type)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-800">{label}</p>
                        <p className="text-xs text-zinc-400">{time}</p>
                      </div>
                      {outgoing && <span className="text-xs text-pink-400">sent ↗</span>}
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
