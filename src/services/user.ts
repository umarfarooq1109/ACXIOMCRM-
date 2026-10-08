import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UserContext, requireRole } from "@/lib/rbac";
import { recordAuditLog } from "@/services/audit";

export async function listUsers(
  userCtx: UserContext,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }
) {
  requireRole(userCtx, ["Admin", "Manager"]);

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (params.search) {
    const q = params.search.trim();
    andConditions.push({
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ],
    });
  }

  if (params.role) andConditions.push({ role: params.role });
  if (typeof params.isActive === "boolean") andConditions.push({ isActive: params.isActive });

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        failedLoginCount: true,
        lockoutEnd: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserRole(userId: string, newRole: "Admin" | "Manager" | "SalesExecutive", userCtx: UserContext, ipAddress?: string) {
  requireRole(userCtx, ["Admin"]);

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new AppError("Target user not found.", 404);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "ROLE_CHANGE",
    entityName: "User",
    recordId: userId,
    result: "Success",
    ipAddress,
    oldValue: { role: targetUser.role },
    newValue: { role: newRole },
  });

  return updated;
}

export async function toggleUserActive(userId: string, isActive: boolean, userCtx: UserContext, ipAddress?: string) {
  requireRole(userCtx, ["Admin"]);

  if (userId === userCtx.id) {
    throw new AppError("You cannot deactivate your own administrative account.", 400);
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new AppError("Target user not found.", 404);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: isActive ? "USER_ACTIVATE" : "USER_DEACTIVATE",
    entityName: "User",
    recordId: userId,
    result: "Success",
    ipAddress,
    oldValue: { isActive: targetUser.isActive },
    newValue: { isActive },
  });

  return updated;
}

export async function unlockUserAccount(userId: string, userCtx: UserContext, ipAddress?: string) {
  requireRole(userCtx, ["Admin", "Manager"]);

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new AppError("Target user not found.", 404);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockoutEnd: null,
    },
    select: { id: true, name: true, email: true, failedLoginCount: true, lockoutEnd: true },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "ACCOUNT_UNLOCK",
    entityName: "User",
    recordId: userId,
    result: "Success",
    ipAddress,
    newValue: { unlockedUserEmail: targetUser.email },
  });

  return updated;
}
