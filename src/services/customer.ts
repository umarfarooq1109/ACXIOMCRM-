import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UserContext, getScopeWhereClause } from "@/lib/rbac";
import { recordAuditLog } from "@/services/audit";
import {
  createCustomerSchema,
  updateCustomerSchema,
  changeOwnerSchema,
  normalizePhone,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/schemas/customer";

/**
 * Transaction-safe auto-generation of sequential Customer Code e.g. CUS-000123
 */
export async function generateCustomerCode(): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    const lastCustomer = await tx.customer.findFirst({
      orderBy: { createdAt: "desc" },
      select: { customerCode: true },
    });

    let nextNumber = 1;
    if (lastCustomer && lastCustomer.customerCode.startsWith("CUS-")) {
      const parts = lastCustomer.customerCode.split("-");
      if (parts[1]) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num)) nextNumber = num + 1;
      }
    }

    const padNumber = String(nextNumber).padStart(6, "0");
    return `CUS-${padNumber}`;
  });
}

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  ownerId?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function listCustomers(user: UserContext, params: ListCustomersParams) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));
  const skip = (page - 1) * pageSize;

  const scopeWhere = getScopeWhereClause(user, "customers");

  const andFilters: any[] = [scopeWhere];

  if (params.search && params.search.trim() !== "") {
    const term = params.search.trim();
    andFilters.push({
      OR: [
        { customerCode: { contains: term } },
        { customerName: { contains: term } },
        { companyName: { contains: term } },
        { email: { contains: term } },
        { phone: { contains: term } },
        { city: { contains: term } },
      ],
    });
  }

  if (params.status && params.status !== "ALL") {
    andFilters.push({ status: params.status });
  }

  if (params.ownerId && params.ownerId !== "ALL" && user.role !== "SalesExecutive") {
    andFilters.push({ ownerId: params.ownerId });
  }

  if (params.city && params.city !== "ALL") {
    andFilters.push({ city: params.city });
  }

  const whereClause = { AND: andFilters };

  const validSortFields = ["customerName", "companyName", "status", "createdAt", "city"];
  const sortBy = validSortFields.includes(params.sortBy || "")
    ? params.sortBy!
    : "createdAt";
  const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where: whereClause,
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
    }),
    prisma.customer.count({ where: whereClause }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getCustomerById(user: UserContext, id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
      leads: { select: { id: true, leadCode: true, leadName: true, status: true, expectedValue: true } },
      opportunities: { select: { id: true, opportunityName: true, stage: true, amount: true, probability: true } },
      followUps: { select: { id: true, subject: true, followUpDate: true, status: true, followUpType: true } },
      activities: { select: { id: true, activityType: true, subject: true, activityDate: true, status: true } },
    },
  });

  if (!customer) {
    throw new AppError("Customer record not found.", 404);
  }

  // RBAC ownership check
  if (user.role === "SalesExecutive" && customer.ownerId !== user.id) {
    throw new AppError("Customer record not found.", 404); // No info leak
  }

  return customer;
}

export async function createCustomer(user: UserContext, input: CreateCustomerInput) {
  const validated = createCustomerSchema.parse(input);
  const cleanEmail = validated.email.toLowerCase();
  const cleanPhone = normalizePhone(validated.phone);

  // Check duplicate by email
  const dupEmail = await prisma.customer.findUnique({ where: { email: cleanEmail } });
  if (dupEmail) {
    await recordAuditLog({
      userId: user.id,
      action: "CUSTOMER_CREATE_FAILED",
      entityName: "Customer",
      result: "Failure",
      newValue: { email: cleanEmail, reason: "Duplicate email" },
    });
    const err = new AppError("A customer with this email address already exists.", 409);
    (err as any).existingCustomer = {
      id: dupEmail.id,
      customerCode: dupEmail.customerCode,
      customerName: dupEmail.customerName,
      companyName: dupEmail.companyName,
    };
    throw err;
  }

  // Check duplicate by phone
  const dupPhone = await prisma.customer.findUnique({ where: { phone: cleanPhone } });
  if (dupPhone) {
    await recordAuditLog({
      userId: user.id,
      action: "CUSTOMER_CREATE_FAILED",
      entityName: "Customer",
      result: "Failure",
      newValue: { phone: cleanPhone, reason: "Duplicate phone" },
    });
    const err = new AppError("A customer with this phone number already exists.", 409);
    (err as any).existingCustomer = {
      id: dupPhone.id,
      customerCode: dupPhone.customerCode,
      customerName: dupPhone.customerName,
      companyName: dupPhone.companyName,
    };
    throw err;
  }

  // Check duplicate by customerName + companyName
  const dupNameCompany = await prisma.customer.findFirst({
    where: {
      customerName: { equals: validated.customerName },
      companyName: { equals: validated.companyName },
    },
  });
  if (dupNameCompany) {
    const err = new AppError(
      `A customer "${validated.customerName}" at company "${validated.companyName}" already exists.`,
      409
    );
    (err as any).existingCustomer = {
      id: dupNameCompany.id,
      customerCode: dupNameCompany.customerCode,
      customerName: dupNameCompany.customerName,
      companyName: dupNameCompany.companyName,
    };
    throw err;
  }

  // Force ownerId for SalesExecutive or default to user.id if not provided
  const assignedOwnerId = user.role === "SalesExecutive" ? user.id : (validated.ownerId || user.id);

  const customerCode = await generateCustomerCode();

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      customerName: validated.customerName,
      email: cleanEmail,
      phone: cleanPhone,
      companyName: validated.companyName,
      address: validated.address || null,
      city: validated.city,
      state: validated.state,
      status: validated.status || "Active",
      notes: validated.notes || null,
      ownerId: assignedOwnerId,
      createdBy: user.id,
      modifiedBy: user.id,
    },
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: "CUSTOMER_CREATE",
    entityName: "Customer",
    recordId: customer.id,
    result: "Success",
    newValue: {
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      companyName: customer.companyName,
      email: customer.email,
      ownerId: customer.ownerId,
    },
  });

  return customer;
}

export async function updateCustomer(
  user: UserContext,
  id: string,
  input: UpdateCustomerInput
) {
  const existing = await getCustomerById(user, id);

  const validated = updateCustomerSchema.parse(input);

  const dataToUpdate: any = { modifiedBy: user.id };

  if (validated.customerName !== undefined) dataToUpdate.customerName = validated.customerName;
  if (validated.companyName !== undefined) dataToUpdate.companyName = validated.companyName;
  if (validated.address !== undefined) dataToUpdate.address = validated.address || null;
  if (validated.city !== undefined) dataToUpdate.city = validated.city;
  if (validated.state !== undefined) dataToUpdate.state = validated.state;
  if (validated.status !== undefined) dataToUpdate.status = validated.status;
  if (validated.notes !== undefined) dataToUpdate.notes = validated.notes || null;

  if (validated.email && validated.email.toLowerCase() !== existing.email) {
    const cleanEmail = validated.email.toLowerCase();
    const dupEmail = await prisma.customer.findUnique({ where: { email: cleanEmail } });
    if (dupEmail && dupEmail.id !== id) {
      const err = new AppError("A customer with this email address already exists.", 409);
      (err as any).existingCustomer = {
        id: dupEmail.id,
        customerCode: dupEmail.customerCode,
        customerName: dupEmail.customerName,
        companyName: dupEmail.companyName,
      };
      throw err;
    }
    dataToUpdate.email = cleanEmail;
  }

  if (validated.phone) {
    const cleanPhone = normalizePhone(validated.phone);
    if (cleanPhone !== existing.phone) {
      const dupPhone = await prisma.customer.findUnique({ where: { phone: cleanPhone } });
      if (dupPhone && dupPhone.id !== id) {
        const err = new AppError("A customer with this phone number already exists.", 409);
        (err as any).existingCustomer = {
          id: dupPhone.id,
          customerCode: dupPhone.customerCode,
          customerName: dupPhone.customerName,
          companyName: dupPhone.companyName,
        };
        throw err;
      }
      dataToUpdate.phone = cleanPhone;
    }
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: dataToUpdate,
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: "CUSTOMER_UPDATE",
    entityName: "Customer",
    recordId: updated.id,
    result: "Success",
    oldValue: {
      customerName: existing.customerName,
      status: existing.status,
      city: existing.city,
    },
    newValue: {
      customerName: updated.customerName,
      status: updated.status,
      city: updated.city,
    },
  });

  return updated;
}

export async function changeCustomerOwner(
  user: UserContext,
  id: string,
  newOwnerId: string,
  reason: string
) {
  if (user.role !== "Admin" && user.role !== "Manager") {
    throw new AppError("Only Admins and Managers can reassign customer owners.", 403);
  }

  const existing = await getCustomerById(user, id);

  const newOwner = await prisma.user.findUnique({ where: { id: newOwnerId } });
  if (!newOwner || !newOwner.isActive) {
    throw new AppError("The selected sales owner is invalid or inactive.", 400);
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ownerId: newOwnerId,
      modifiedBy: user.id,
    },
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: "CUSTOMER_OWNER_CHANGE",
    entityName: "Customer",
    recordId: id,
    result: "Success",
    oldValue: { ownerId: existing.ownerId, ownerName: existing.owner?.name },
    newValue: { ownerId: newOwner.id, ownerName: newOwner.name, reason },
  });

  return updated;
}

export async function deactivateCustomer(user: UserContext, id: string) {
  const existing = await getCustomerById(user, id);

  if (existing.status === "Inactive") {
    return existing;
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      status: "Inactive",
      modifiedBy: user.id,
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: "CUSTOMER_DEACTIVATE",
    entityName: "Customer",
    recordId: id,
    result: "Success",
    oldValue: { status: existing.status },
    newValue: { status: "Inactive" },
  });

  return updated;
}

export async function reactivateCustomer(user: UserContext, id: string) {
  const existing = await getCustomerById(user, id);

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      status: "Active",
      modifiedBy: user.id,
    },
  });

  await recordAuditLog({
    userId: user.id,
    action: "CUSTOMER_REACTIVATE",
    entityName: "Customer",
    recordId: id,
    result: "Success",
    oldValue: { status: existing.status },
    newValue: { status: "Active" },
  });

  return updated;
}

export async function getCustomerHistory(user: UserContext, id: string) {
  await getCustomerById(user, id); // RBAC verification

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityName: "Customer",
      recordId: id,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdDate: "desc" },
  });

  return auditLogs;
}
