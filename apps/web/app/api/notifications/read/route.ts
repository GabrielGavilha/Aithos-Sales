import { NextResponse } from "next/server";
import { markNotificationsAsRead } from "@aithos/db";
import { ApiAuthError, requireApiSessionUser } from "@/lib/auth/require-api-user";
import { getCurrentAppContext } from "@/lib/auth/app-context";

export const runtime = "nodejs";

export async function PATCH() {
  try {
    const user = await requireApiSessionUser();
    const context = await getCurrentAppContext();

    if (!context.workspace) {
      return NextResponse.json({ message: "Workspace nao encontrado." }, { status: 400 });
    }

    await markNotificationsAsRead(context.workspace.id, user.uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Falha ao marcar notificacoes." }, { status: 500 });
  }
}
