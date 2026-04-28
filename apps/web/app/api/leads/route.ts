import { NextResponse } from "next/server";
import { createLead, createLeadSchema } from "@aithos/db";
import { ApiAuthError, requireApiSessionUser } from "@/lib/auth/require-api-user";
import { requireWorkspaceAccess, WorkspaceAccessError } from "@/lib/auth/workspace-access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireApiSessionUser();
    const workspaceId = new URL(request.url).searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ message: "workspaceId obrigatorio." }, { status: 400 });
    }

    await requireWorkspaceAccess(user.uid, workspaceId);

    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados invalidos.", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const leadId = await createLead({
      workspaceId,
      userId: user.uid,
      data: parsed.data
    });

    return NextResponse.json({ ok: true, leadId }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    if (error instanceof WorkspaceAccessError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Nenhuma etapa configurada no workspace.") {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }
    return NextResponse.json({ message: "Falha ao criar lead." }, { status: 500 });
  }
}
