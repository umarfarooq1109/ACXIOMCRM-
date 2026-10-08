import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UserContext, getScopeWhereClause } from "@/lib/rbac";
import { recordAuditLog } from "@/services/audit";
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  completeFollowUpSchema,
  CreateFollowUpInput,
  UpdateFollowUpInput,
  CompleteFollowUpInput,
} from "@/schemas/followup";

export async function createFollowUp(rawInput: CreateFollowUpInput, userCtx: UserContext, ipAddress?: string) {
  const validated = createFollowUpSchema.parse(rawInput);
  const assignedToId = validated.assignedToId || userCtx.id;
  const followUpDate = new Date(validated.followUpDate);

  const followUp = await prisma.followUp.create({
    data: {
      subject: validated.subject,
      followUpType: validated.followUpType,
      followUpDate,
      status: validated.status,
      remarks: validated.remarks || null,
      assignedToId,
      customerId: validated.customerId || null,
      leadId: validated.leadId || null,
      opportunityId: validated.opportunityId || null,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, customerCode: true, customerName: true } },
      lead: { select: { id: true, leadCode: true, leadName: true } },
      opportunity: { select: { id: true, opportunityName: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "FOLLOWUP_CREATE",
    entityName: "FollowUp",
    recordId: followUp.id,
    result: "Success",
    ipAddress,
    newValue: { subject: followUp.subject, followUpDate: followUp.followUpDate, status: followUp.status },
  });

  return followUp;
}

export async function listFollowUps(
  userCtx: UserContext,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    overdue?: boolean;
    customerId?: string;
    leadId?: string;
    opportunityId?: string;
  }
) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const scopeClause = getScopeWhereClause(userCtx, "assignedToId");
  const andConditions: any[] = [scopeClause];

  if (params.status) andConditions.push({ status: params.status });
  if (params.type) andConditions.push({ followUpType: params.type });
  if (params.customerId) andConditions.push({ customerId: params.customerId });
  if (params.leadId) andConditions.push({ leadId: params.leadId });
  if (params.opportunityId) andConditions.push({ opportunityId: params.opportunityId });

  if (params.overdue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    andConditions.push({
      status: "Planned",
      followUpDate: { lt: today },
    });
  }

  const where = { AND: andConditions };

  const [total, followUps] = await Promise.all([
    prisma.followUp.count({ where }),
    prisma.followUp.findMany({
      where,
      skip,
      take: limit,
      orderBy: { followUpDate: "asc" },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, customerCode: true, customerName: true, companyName: true } },
        lead: { select: { id: true, leadCode: true, leadName: true, companyName: true } },
        opportunity: { select: { id: true, opportunityName: true } },
      },
    }),
  ]);

  return {
    data: followUps,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function completeFollowUp(id: string, rawInput: CompleteFollowUpInput, userCtx: UserContext, ipAddress?: string) {
  const followUp = await prisma.followUp.findUnique({ where: { id } });
  if (!followUp) throw new AppError("Follow-up record not found.", 404);

  if (userCtx.role === "SalesExecutive" && followUp.assignedToId !== userCtx.id) {
    throw new AppError("Follow-up record not found.", 404);
  }

  const validated = completeFollowUpSchema.parse(rawInput);

  const updated = await prisma.followUp.update({
    where: { id },
    data: {
      status: "Completed",
      remarks: validated.remarks ? `${followUp.remarks ? followUp.remarks + " | " : ""}${validated.remarks}` : followUp.remarks,
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "FOLLOWUP_COMPLETE",
    entityName: "FollowUp",
    recordId: id,
    result: "Success",
    ipAddress,
    oldValue: { status: followUp.status },
    newValue: { status: "Completed" },
  });

  return updated;
}
