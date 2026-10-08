import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UserContext, getScopeWhereClause } from "@/lib/rbac";
import { createActivitySchema, CreateActivityInput } from "@/schemas/activity";
import { recordAuditLog } from "@/services/audit";

export async function createActivity(rawInput: CreateActivityInput, userCtx: UserContext, ipAddress?: string) {
  const validated = createActivitySchema.parse(rawInput);
  const assignedToId = validated.assignedToId || userCtx.id;
  const activityDate = validated.activityDate ? new Date(validated.activityDate) : new Date();

  const activity = await prisma.activity.create({
    data: {
      activityType: validated.activityType,
      subject: validated.subject,
      description: validated.description || null,
      activityDate,
      status: "Completed",
      assignedToId,
      customerId: validated.customerId || null,
      leadId: validated.leadId || null,
      opportunityId: validated.opportunityId || null,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, customerCode: true, customerName: true } },
      lead: { select: { id: true, leadCode: true, leadName: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "ACTIVITY_LOG",
    entityName: "Activity",
    recordId: activity.id,
    result: "Success",
    ipAddress,
    newValue: { activityType: activity.activityType, subject: activity.subject },
  });

  return activity;
}

export async function listActivities(
  userCtx: UserContext,
  params: {
    page?: number;
    limit?: number;
    type?: string;
    customerId?: string;
    leadId?: string;
  }
) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const scopeClause = getScopeWhereClause(userCtx, "assignedToId");
  const andConditions: any[] = [scopeClause];

  if (params.type) andConditions.push({ activityType: params.type });
  if (params.customerId) andConditions.push({ customerId: params.customerId });
  if (params.leadId) andConditions.push({ leadId: params.leadId });

  const where = { AND: andConditions };

  const [total, activities] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { activityDate: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, customerCode: true, customerName: true } },
        lead: { select: { id: true, leadCode: true, leadName: true } },
      },
    }),
  ]);

  return {
    data: activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
