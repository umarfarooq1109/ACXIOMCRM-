import { prisma } from "@/lib/prisma";
import { UserContext, getScopeWhereClause, requireRole } from "@/lib/rbac";

export async function getReportData(type: string, userCtx: UserContext) {
  requireRole(userCtx, ["Admin", "Manager"]);

  const customerScope = getScopeWhereClause(userCtx, "ownerId");
  const leadScope = getScopeWhereClause(userCtx, "assignedToId");
  const oppScope = getScopeWhereClause(userCtx, "assignedToId");
  const followUpScope = getScopeWhereClause(userCtx, "assignedToId");

  switch (type) {
    case "customers": {
      return await prisma.customer.findMany({
        where: customerScope,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          customerCode: true,
          customerName: true,
          email: true,
          companyName: true,
          city: true,
          status: true,
          createdAt: true,
          owner: { select: { name: true } },
        },
      });
    }

    case "leads": {
      return await prisma.lead.findMany({
        where: leadScope,
        orderBy: { createdDate: "desc" },
        take: 100,
        select: {
          id: true,
          leadCode: true,
          leadName: true,
          companyName: true,
          source: true,
          status: true,
          priority: true,
          expectedValue: true,
          createdDate: true,
          assignedTo: { select: { name: true } },
        },
      });
    }

    case "opportunities": {
      return await prisma.opportunity.findMany({
        where: oppScope,
        orderBy: { createdDate: "desc" },
        take: 100,
        select: {
          id: true,
          opportunityName: true,
          amount: true,
          stage: true,
          probability: true,
          expectedCloseDate: true,
          status: true,
          customer: { select: { customerName: true, companyName: true } },
          assignedTo: { select: { name: true } },
        },
      });
    }

    case "followups": {
      return await prisma.followUp.findMany({
        where: followUpScope,
        orderBy: { followUpDate: "desc" },
        take: 100,
        select: {
          id: true,
          subject: true,
          followUpType: true,
          followUpDate: true,
          status: true,
          remarks: true,
          assignedTo: { select: { name: true } },
          customer: { select: { customerName: true } },
          lead: { select: { leadName: true } },
        },
      });
    }

    case "audit": {
      return await prisma.auditLog.findMany({
        orderBy: { createdDate: "desc" },
        take: 100,
        select: {
          id: true,
          action: true,
          entityName: true,
          recordId: true,
          result: true,
          ipAddress: true,
          createdDate: true,
          user: { select: { name: true, email: true } },
        },
      });
    }

    default:
      return [];
  }
}
