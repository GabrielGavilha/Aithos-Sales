import { redirect } from "next/navigation";
import { ExportScreen } from "@/features/export/ExportScreen";
import { getSettingsPayload } from "@/features/crm/data/repository";
import { getCurrentAppContext } from "@/lib/auth/app-context";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const context = await getCurrentAppContext();
  if (!context.user) {
    redirect("/login");
  }
  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const settings = await getSettingsPayload(context.workspace.id);
  return <ExportScreen workspaceId={context.workspace.id} stages={settings.stages} />;
}
