import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AithosSalesLanding } from "@/components/landing/AithosSalesLanding";
import { getCurrentSessionUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aithos Sales",
  description: "CRM comercial com funil Kanban, captura pública e follow-up inteligente"
};

export default async function HomePage() {
  const user = await getCurrentSessionUser();

  if (user) {
    redirect("/app");
  }

  return <AithosSalesLanding />;
}
