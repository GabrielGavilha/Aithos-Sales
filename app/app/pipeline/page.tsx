import { redirect } from "next/navigation";
import { getCurrentAppContext } from "@/lib/auth/app-context";
import { getPipelinePayload } from "@/features/crm/data/repository";
import { PipelineScreen } from "@/features/pipeline/PipelineScreen";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const context = await getCurrentAppContext();

  if (!context.user) {
    redirect("/login");
  }

  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const payload = await getPipelinePayload(context.workspace.id);
  return <PipelineScreen workspaceId={context.workspace.id} payload={payload} />;
}
