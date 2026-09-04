import { getCurrentUser, getPartnerState } from "@/lib/queries";
import { AffectionContent } from "./AffectionContent";

export default async function AffectionPage() {
  const { user } = await getCurrentUser();
  if (!user) return null;

  const partner = await getPartnerState(user.id);

  return <AffectionContent userId={user.id} partner={partner} />;
}
