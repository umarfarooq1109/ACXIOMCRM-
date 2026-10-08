import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UserContext, getScopeWhereClause } from "@/lib/rbac";
import { recordAuditLog } from "@/services/audit";
import { createLeadSchema, updateLeadSchema, convertLeadSchema, CreateLeadInput, UpdateLeadInput, ConvertLeadInput } from "@/schemas/lead";
import { generateCustomerCode } from "@/services/customer";

export async function generateLeadCode(): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    const lastLead = await tx.lead.findFirst({
      orderBy: { leadCode: "desc" },
      select: { leadCode: true },
    });

    if (!lastLead || !lastLead.leadCode.startsWith("LED-")) {
      return "LED-000001";
    }

    const currentNum = parseInt(lastLead.leadCode.replace("LED-", ""), 10);
    if (isNaN(currentNum)) return "LED-000001";

    const nextNum = currentNum + 1;
    return `LED-${nextNum.toString().padStart(6, "0")}`;
  });
}

export async function createLead(rawInput: CreateLeadInput, userCtx: UserContext, ipAddress?: string) {
  const validated = createLeadSchema.parse(rawInput);
  const normalizedEmail = validated.email.toLowerCase();
  const normalizedPhone = validated.phone.replace(/\s+/g, "").replace(/^\+91/, "");

  const assignedToId = validated.assignedToId || userCtx.id;

  const leadCode = await generateLeadCode();

  const newLead = await prisma.lead.create({
    data: {
      leadCode,
      leadName: validated.leadName,
      email: normalizedEmail,
      phone: normalizedPhone,
      companyName: validated.companyName,
      source: validated.source,
      status: validated.status,
      priority: validated.priority,
      expectedValue: validated.expectedValue,
      notes: validated.notes || null,
      assignedToId,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "LEAD_CREATE",
    entityName: "Lead",
    recordId: newLead.id,
    result: "Success",
    ipAddress,
    newValue: { leadCode: newLead.leadCode, leadName: newLead.leadName, assignedToId },
  });

  return newLead;
}

export async function listLeads(
  userCtx: UserContext,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    priority?: string;
  }
) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const scopeClause = getScopeWhereClause(userCtx, "assignedToId" as any);

  const andConditions: any[] = [scopeClause];

  if (params.search) {
    const q = params.search.trim();
    andConditions.push({
      OR: [
        { leadName: { contains: q } },
        { companyName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { leadCode: { contains: q } },
      ],
    });
  }

  if (params.status) andConditions.push({ status: params.status });
  if (params.source) andConditions.push({ source: params.source });
  if (params.priority) andConditions.push({ priority: params.priority });

  const where = { AND: andConditions };

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdDate: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, customerCode: true, customerName: true } },
      },
    }),
  ]);

  return {
    data: leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getLeadById(id: string, userCtx: UserContext) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      customer: true,
      opportunities: true,
      followUps: { orderBy: { followUpDate: "desc" } },
      activities: { orderBy: { activityDate: "desc" } },
    },
  });

  if (!lead) throw new AppError("Lead record not found.", 404);

  if (userCtx.role === "SalesExecutive" && lead.assignedToId !== userCtx.id) {
    throw new AppError("Lead record not found.", 404);
  }

  return lead;
}

export async function updateLead(id: string, rawInput: UpdateLeadInput, userCtx: UserContext, ipAddress?: string) {
  const lead = await getLeadById(id, userCtx);
  const validated = updateLeadSchema.parse(rawInput);

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...validated,
      email: validated.email ? validated.email.toLowerCase() : undefined,
      phone: validated.phone ? validated.phone.replace(/\s+/g, "").replace(/^\+91/, "") : undefined,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  await recordAuditLog({
    userId: userCtx.id,
    action: "LEAD_UPDATE",
    entityName: "Lead",
    recordId: id,
    result: "Success",
    ipAddress,
    oldValue: { status: lead.status, priority: lead.priority },
    newValue: { status: updated.status, priority: updated.priority },
  });

  return updated;
}

export async function convertLeadToCustomer(id: string, rawInput: ConvertLeadInput, userCtx: UserContext, ipAddress?: string) {
  const lead = await getLeadById(id, userCtx);
  if (lead.status === "Converted") {
    throw new AppError("This lead has already been converted to a customer.", 400);
  }

  const validated = convertLeadSchema.parse(rawInput);

  return await prisma.$transaction(
    async (tx) => {
    // Generate customer code
    const lastCust = await tx.customer.findFirst({
      orderBy: { customerCode: "desc" },
      select: { customerCode: true },
    });
    let customerCode = "CUS-000001";
    if (lastCust && lastCust.customerCode.startsWith("CUS-")) {
      const num = parseInt(lastCust.customerCode.replace("CUS-", ""), 10);
      if (!isNaN(num)) customerCode = `CUS-${(num + 1).toString().padStart(6, "0")}`;
    }

    // Create Customer
    const customer = await tx.customer.create({
      data: {
        customerCode,
        customerName: lead.leadName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        address: validated.address || null,
        city: validated.city,
        state: validated.state,
        status: "Active",
        ownerId: lead.assignedToId,
        createdBy: userCtx.id,
        modifiedBy: userCtx.id,
        notes: `Converted from Lead ${lead.leadCode}. ${lead.notes || ""}`,
      },
    });

    // Update Lead status to Converted
    await tx.lead.update({
      where: { id },
      data: {
        status: "Converted",
        customerId: customer.id,
      },
    });

    let opportunity = null;
    if (validated.createOpportunity && validated.amount && validated.amount > 0) {
      const lastOpp = await tx.opportunity.findFirst({
        orderBy: { createdDate: "desc" },
        select: { id: true },
      });

      const closeDate = validated.expectedCloseDate
        ? new Date(validated.expectedCloseDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      opportunity = await tx.opportunity.create({
        data: {
          opportunityName: validated.opportunityName || `${lead.companyName} - Deal`,
          customerId: customer.id,
          leadId: lead.id,
          amount: validated.amount,
          stage: "Qualification",
          probability: 20,
          expectedCloseDate: closeDate,
          status: "Open",
          assignedToId: lead.assignedToId,
        },
      });
    }

    await recordAuditLog({
      userId: userCtx.id,
      action: "LEAD_CONVERT",
      entityName: "Lead",
      recordId: id,
      result: "Success",
      ipAddress,
      newValue: { customerId: customer.id, customerCode: customer.customerCode, opportunityId: opportunity?.id },
    });

    return { customer, opportunity };
  }, { timeout: 15000 });
}
