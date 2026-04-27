import { notFound, redirect } from "next/navigation";
import { getCurrentAppContext } from "@/lib/auth/app-context";
import { getLeadDetailsPayload } from "@/features/crm/data/repository";
import { LeadDetailsScreen } from "@/features/lead-detail/LeadDetailsScreen";

export const dynamic = "force-dynamic";

export default async function LeadDetailsPage({
  params
}: {
  params: Promise<{ leadId: string }>;
}) {
  const context = await getCurrentAppContext();

  if (!context.user) {
    redirect("/login");
  }

  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const { leadId } = await params;
  const data = await getLeadDetailsPayload(context.workspace.id, leadId);

  if (!data) {
    notFound();
  }

  return <LeadDetailsScreen workspaceId={context.workspace.id} payload={data} />;
}
