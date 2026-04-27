import "server-only";

import { getUserWorkspaceMemberships } from "@aithos/db";

export class WorkspaceAccessError extends Error {}

export const requireWorkspaceAccess = async (userId: string, workspaceId: string) => {
  const memberships = await getUserWorkspaceMemberships(userId);
  const match = memberships.find((item) => item.workspace.id === workspaceId);

  if (!match) {
    throw new WorkspaceAccessError("Sem acesso a este workspace.");
  }

  return match;
};
