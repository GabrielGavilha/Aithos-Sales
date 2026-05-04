import { NextResponse } from "next/server";
import { updateWorkspacePreferences } from "@aithos/db";
import { ApiAuthError, requireApiSessionUser } from "@/lib/auth/require-api-user";
import { requireWorkspaceAccess, WorkspaceAccessError } from "@/lib/auth/workspace-access";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiSessionUser();
    const workspaceId = new URL(request.url).searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ message: "workspaceId obrigatorio." }, { status: 400 });
    }

    await requireWorkspaceAccess(user.uid, workspaceId);

    const body = await request.json();
    const patch: { alertInactiveDays?: number; timezone?: string } = {};

    if (typeof body.alertInactiveDays === "number" && body.alertInactiveDays > 0) {
      patch.alertInactiveDays = Math.round(body.alertInactiveDays);
    }
    if (typeof body.timezone === "string" && body.timezone.trim()) {
      patch.timezone = body.timezone.trim();
    }

    await updateWorkspacePreferences(workspaceId, patch);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    if (error instanceof WorkspaceAccessError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "Falha ao salvar preferencias." }, { status: 500 });
  }
}
