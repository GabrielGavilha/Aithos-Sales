import { redirect } from "next/navigation";
import { MetricsScreen } from "@/features/metrics/MetricsScreen";
import { getMetricsPayload } from "@/features/crm/data/repository";
import { getCurrentAppContext } from "@/lib/auth/app-context";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const context = await getCurrentAppContext();
  if (!context.user) {
    redirect("/login");
  }
  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const payload = await getMetricsPayload(context.workspace.id);
  return <MetricsScreen payload={payload} />;
}
