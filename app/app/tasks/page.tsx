import { redirect } from "next/navigation";
import { TasksScreen } from "@/features/tasks/TasksScreen";
import { getTasksPayload } from "@/features/crm/data/repository";
import { getCurrentAppContext } from "@/lib/auth/app-context";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const context = await getCurrentAppContext();
  if (!context.user) {
    redirect("/login");
  }
  if (!context.workspace) {
    redirect("/app/onboarding");
  }

  const payload = await getTasksPayload(context.workspace.id);
  return <TasksScreen payload={payload} />;
}
