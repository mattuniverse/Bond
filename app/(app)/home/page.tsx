import { getCurrentUser, getPartnerState } from "@/lib/queries";
import { HomeContent } from "./HomeContent";

export default async function HomePage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    return null; // middleware bounces logged-out users to /login
  }

  const partner = await getPartnerState(user.id);

  return (
    <HomeContent
      userId={user.id}
      username={profile?.username ?? "friend"}
      partner={partner}
    />
  );
}
