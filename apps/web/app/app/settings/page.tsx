import { redirect } from "next/navigation";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { getSettingsPayload } from "@/features/crm/data/repository";
import { getCurrentAppContext } from "@/lib/auth/app-context";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const context = await getCurrentAppContext();

  if (!context.user) {
    redirect("/login");
  }

  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const payload = await getSettingsPayload(context.workspace.id);
  return <SettingsScreen workspaceId={context.workspace.id} payload={payload} />;
}
