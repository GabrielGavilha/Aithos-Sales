import { redirect } from "next/navigation";
import { getCurrentAppContext } from "@/lib/auth/app-context";
import { getDashboardPayload } from "@/features/crm/data/repository";
import { DashboardScreen } from "@/features/dashboard/DashboardScreen";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage() {
  const context = await getCurrentAppContext();

  if (!context.user) {
    redirect("/login");
  }

  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const payload = await getDashboardPayload(context.workspace.id);
  return <DashboardScreen data={payload} />;
}
