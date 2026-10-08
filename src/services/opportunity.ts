import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UserContext, getScopeWhereClause } from "@/lib/rbac";
import { recordAuditLog } from "@/services/audit";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  changeStageSchema,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  ChangeStageInput,
} from "@/schemas/opportunity";

export async function createOpportunity(rawInput: CreateOpportunityInput, userCtx: UserContext, ipAddress?: string) {
  const validated = createOpportunitySchema.parse(rawInput);

  // Verify referenced customer exists and is authorized
  const customer = await prisma.customer.findUnique({
    where: { id: validated.customerId },
  });
  if (!customer) throw new AppError("Referenced Customer record not found.", 404);

  if (userCtx.role === "SalesExecutive" && customer.ownerId !== userCtx.id) {
    throw new AppError("You do not have authorization to create opportunities for this customer.", 403);
  }

  const assignedToId = validated.assignedToId || userCtx.id;
  const expectedCloseDate = new Date(validated.expectedCloseDate);

  const opportunity = await prisma.opportunity.create({
    data: {
      opportunityName: validated.opportunityName,
      customerId: validated.customerId,
      leadId: validated.leadId || null,
      amount: validated.amount,
      stage: validated.stage,
      probability: validated.probability,
      expectedCloseDate,
      status: validated.stage === "Won" || validated.stage === "Lost" ? "Closed" : validated.status,
      notes: validated.notes || null,
      assignedToId,
    },
    include: {
      customer: { select: { id: true, customerCode: true, customerName: true, companyName: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "OPPORTUNITY_CREATE",
    entityName: "Opportunity",
    recordId: opportunity.id,
    result: "Success",
    ipAddress,
    newValue: { opportunityName: opportunity.opportunityName, amount: opportunity.amount, stage: opportunity.stage },
  });

  return opportunity;
}

export async function listOpportunities(
  userCtx: UserContext,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
    status?: string;
    customerId?: string;
  }
) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const scopeClause = getScopeWhereClause(userCtx, "assignedToId");

  const andConditions: any[] = [scopeClause];

  if (params.search) {
    const q = params.search.trim();
    andConditions.push({
      OR: [
        { opportunityName: { contains: q } },
        { customer: { customerName: { contains: q } } },
        { customer: { companyName: { contains: q } } },
      ],
    });
  }

  if (params.stage) andConditions.push({ stage: params.stage });
  if (params.status) andConditions.push({ status: params.status });
  if (params.customerId) andConditions.push({ customerId: params.customerId });

  const where = { AND: andConditions };

  const [total, opportunities] = await Promise.all([
    prisma.opportunity.count({ where }),
    prisma.opportunity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdDate: "desc" },
      include: {
        customer: { select: { id: true, customerCode: true, customerName: true, companyName: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    data: opportunities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOpportunityById(id: string, userCtx: UserContext) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      customer: true,
      lead: true,
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      followUps: { orderBy: { followUpDate: "desc" } },
      activities: { orderBy: { activityDate: "desc" } },
    },
  });

  if (!opportunity) throw new AppError("Opportunity record not found.", 404);

  if (userCtx.role === "SalesExecutive" && opportunity.assignedToId !== userCtx.id) {
    throw new AppError("Opportunity record not found.", 404);
  }

  return opportunity;
}

export async function updateOpportunity(id: string, rawInput: UpdateOpportunityInput, userCtx: UserContext, ipAddress?: string) {
  const opportunity = await getOpportunityById(id, userCtx);
  const validated = updateOpportunitySchema.parse(rawInput);

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      ...validated,
      expectedCloseDate: validated.expectedCloseDate ? new Date(validated.expectedCloseDate) : undefined,
      status: validated.stage ? (validated.stage === "Won" || validated.stage === "Lost" ? "Closed" : "Open") : undefined,
    },
    include: {
      customer: { select: { id: true, customerCode: true, customerName: true, companyName: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "OPPORTUNITY_UPDATE",
    entityName: "Opportunity",
    recordId: id,
    result: "Success",
    ipAddress,
    oldValue: { amount: opportunity.amount, stage: opportunity.stage },
    newValue: { amount: updated.amount, stage: updated.stage },
  });

  return updated;
}

export async function changeOpportunityStage(id: string, rawInput: ChangeStageInput, userCtx: UserContext, ipAddress?: string) {
  const opportunity = await getOpportunityById(id, userCtx);
  const validated = changeStageSchema.parse(rawInput);

  let newProbability = opportunity.probability;
  if (validated.stage === "Qualification") newProbability = 20;
  else if (validated.stage === "Proposal") newProbability = 50;
  else if (validated.stage === "Negotiation") newProbability = 80;
  else if (validated.stage === "Won") newProbability = 100;
  else if (validated.stage === "Lost") newProbability = 0;

  const status = validated.stage === "Won" || validated.stage === "Lost" ? "Closed" : "Open";

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      stage: validated.stage,
      probability: newProbability,
      status,
    },
    include: {
      customer: { select: { id: true, customerCode: true, customerName: true, companyName: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "OPPORTUNITY_STAGE_CHANGE",
    entityName: "Opportunity",
    recordId: id,
    result: "Success",
    ipAddress,
    oldValue: { stage: opportunity.stage, probability: opportunity.probability },
    newValue: { stage: updated.stage, probability: updated.probability },
  });

  return updated;
}
