export type UserRole = "Admin" | "Manager" | "SalesExecutive";

export type Resource =
  | "customers"
  | "leads"
  | "opportunities"
  | "followups"
  | "activities"
  | "users"
  | "audit"
  | "reports";

export type Action =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "assign"
  | "convert"
  | "export"
  | "administer";

export interface UserContext {
  id: string;
  role: UserRole;
  teamId?: string;
}

// Single Permission Matrix Definition
const PERMISSION_MATRIX: Record<UserRole, Record<Resource, Action[]>> = {
  Admin: {
    customers: ["read", "create", "update", "delete", "assign", "convert", "export", "administer"],
    leads: ["read", "create", "update", "delete", "assign", "convert", "export", "administer"],
    opportunities: ["read", "create", "update", "delete", "assign", "convert", "export", "administer"],
    followups: ["read", "create", "update", "delete", "assign", "convert", "export", "administer"],
    activities: ["read", "create", "update", "delete", "assign", "convert", "export", "administer"],
    users: ["read", "create", "update", "delete", "assign", "convert", "export", "administer"],
    audit: ["read", "export", "administer"],
    reports: ["read", "export"],
  },
  Manager: {
    customers: ["read", "create", "update", "assign", "convert", "export"],
    leads: ["read", "create", "update", "assign", "convert", "export"],
    opportunities: ["read", "create", "update", "assign", "convert", "export"],
    followups: ["read", "create", "update", "assign", "export"],
    activities: ["read", "create", "update", "assign", "export"],
    users: [],
    audit: ["read"],
    reports: ["read", "export"],
  },
  SalesExecutive: {
    customers: ["read", "create", "update"],
    leads: ["read", "create", "update", "convert"],
    opportunities: ["read", "create", "update"],
    followups: ["read", "create", "update"],
    activities: ["read", "create", "update"],
    users: [],
    audit: [],
    reports: ["read"],
  },
};

export function can(
  user: UserContext | null | undefined,
  action: Action,
  resource: Resource
): boolean {
  if (!user) return false;
  const allowedActions = PERMISSION_MATRIX[user.role]?.[resource] || [];
  return allowedActions.includes(action);
}

export function isOwnerOrAdmin(user: UserContext, recordOwnerId: string): boolean {
  if (user.role === "Admin" || user.role === "Manager") return true;
  return user.id === recordOwnerId;
}

/**
 * Returns Prisma `where` clause filtered at the database query level based on user role and ownership.
 */
export function getScopeWhereClause(user: UserContext, resource: Resource): Record<string, any> {
  if (user.role === "Admin" || user.role === "Manager") {
    return {};
  }

  // SalesExecutive limited to records owned by or assigned to them
  if (resource === "customers") {
    return { ownerId: user.id };
  }
  if (resource === "leads" || resource === "opportunities" || resource === "followups" || resource === "activities") {
    return { assignedToId: user.id };
  }

  return {};
}
