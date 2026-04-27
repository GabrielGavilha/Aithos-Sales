import { redirect } from "next/navigation";
import { FormsScreen } from "@/features/forms/FormsScreen";
import { getFormsPayload } from "@/features/crm/data/repository";
import { getCurrentAppContext } from "@/lib/auth/app-context";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  const context = await getCurrentAppContext();
  if (!context.user) {
    redirect("/login");
  }
  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const payload = await getFormsPayload(context.workspace.id, context.workspace.slug);
  return <FormsScreen workspaceId={context.workspace.id} payload={payload} />;
}
