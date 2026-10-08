import { prisma } from "@/lib/prisma";
import { UserContext, getScopeWhereClause } from "@/lib/rbac";

export async function getDashboardStats(userCtx: UserContext) {
  const customerScope = getScopeWhereClause(userCtx, "ownerId");
  const leadScope = getScopeWhereClause(userCtx, "assignedToId");
  const oppScope = getScopeWhereClause(userCtx, "assignedToId");
  const followUpScope = getScopeWhereClause(userCtx, "assignedToId");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalCustomers,
    totalLeads,
    openLeads,
    totalOpportunities,
    openOpportunities,
    wonOpportunities,
    lostOpportunities,
    pendingFollowUps,
    overdueFollowUps,
    oppsList,
    leadStatusGroups,
    oppStageGroups,
  ] = await Promise.all([
    prisma.customer.count({ where: customerScope }),
    prisma.lead.count({ where: leadScope }),
    prisma.lead.count({ where: { AND: [leadScope, { status: { in: ["New", "Contacted", "Qualified"] } }] } }),
    prisma.opportunity.count({ where: oppScope }),
    prisma.opportunity.count({ where: { AND: [oppScope, { status: "Open" }] } }),
    prisma.opportunity.count({ where: { AND: [oppScope, { stage: "Won" }] } }),
    prisma.opportunity.count({ where: { AND: [oppScope, { stage: "Lost" }] } }),
    prisma.followUp.count({ where: { AND: [followUpScope, { status: "Planned" }] } }),
    prisma.followUp.count({ where: { AND: [followUpScope, { status: "Planned", followUpDate: { lt: today } }] } }),
    prisma.opportunity.findMany({
      where: { AND: [oppScope, { status: "Open" }] },
      select: { amount: true, probability: true, stage: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: leadScope,
      _count: { status: true },
    }),
    prisma.opportunity.groupBy({
      by: ["stage"],
      where: oppScope,
      _count: { stage: true },
      _sum: { amount: true },
    }),
  ]);

  const totalPipelineValue = oppsList.reduce((acc, curr) => acc + curr.amount, 0);
  const weightedPipelineValue = oppsList.reduce(
    (acc, curr) => acc + (curr.amount * curr.probability) / 100,
    0
  );

  // Chart 1: Lead Status Chart.js data
  const leadStatuses = ["New", "Contacted", "Qualified", "Converted", "Lost", "Unqualified"];
  const leadChartLabels = leadStatuses;
  const leadChartData = leadStatuses.map((st) => {
    const found = leadStatusGroups.find((g) => g.status === st);
    return found ? found._count.status : 0;
  });

  // Chart 2: Opportunity Pipeline Stage Chart.js data
  const oppStages = ["Qualification", "Proposal", "Negotiation", "Won", "Lost"];
  const oppStageLabels = oppStages;
  const oppStageCounts = oppStages.map((st) => {
    const found = oppStageGroups.find((g) => g.stage === st);
    return found ? found._count.stage : 0;
  });
  const oppStageValues = oppStages.map((st) => {
    const found = oppStageGroups.find((g) => g.stage === st);
    return found ? (found._sum.amount || 0) : 0;
  });

  return {
    kpis: {
      totalCustomers,
      totalLeads,
      openLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities,
      pendingFollowUps,
      overdueFollowUps,
      totalPipelineValue,
      weightedPipelineValue,
    },
    charts: {
      leadStatus: {
        labels: leadChartLabels,
        data: leadChartData,
      },
      pipelineStage: {
        labels: oppStageLabels,
        counts: oppStageCounts,
        values: oppStageValues,
      },
    },
  };
}
