"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import {
  Users,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const leadChartData = {
    labels: data?.charts?.leadStatus?.labels || [],
    datasets: [
      {
        data: data?.charts?.leadStatus?.data || [],
        backgroundColor: [
          "#0D9488", // Teal
          "#0284C7", // Sky
          "#8B5CF6", // Violet
          "#10B981", // Emerald
          "#EF4444", // Rose
          "#F59E0B", // Amber
        ],
        borderWidth: 1,
      },
    ],
  };

  const oppChartData = {
    labels: data?.charts?.pipelineStage?.labels || [],
    datasets: [
      {
        label: "Opportunity Count",
        data: data?.charts?.pipelineStage?.counts || [],
        backgroundColor: "#0D9488",
        borderRadius: 4,
      },
    ],
  };

  return (
    <AppShell>
      <PageHeader
        title="Acxiom CRM Sales Dashboard"
        description="Real-time KPI metrics, pipeline visibility, and Chart.js analytics."
        breadcrumbs={[{ label: "Overview" }]}
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
            onClick={fetchStats}
          >
            Refresh Data
          </Button>
        }
      />

      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Customers</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {data?.kpis?.totalCustomers ?? 0}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="teal">Active Accounts</Badge>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Leads Pipeline</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {data?.kpis?.openLeads ?? 0}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      / {data?.kpis?.totalLeads ?? 0} Total
                    </span>
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="sky">Active Qualification</Badge>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Target className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Open Opportunities</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {data?.kpis?.openOpportunities ?? 0}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="amber">
                      Won: {data?.kpis?.wonOpportunities ?? 0} | Lost: {data?.kpis?.lostOpportunities ?? 0}
                    </Badge>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Award className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Pipeline Value</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    ₹{(data?.kpis?.totalPipelineValue ?? 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Weighted: ₹{(data?.kpis?.weightedPipelineValue ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <DollarSign className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Follow-up Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-900">Pending Scheduled Follow-ups</h4>
                  <p className="text-xs text-amber-700">
                    You have <span className="font-bold">{data?.kpis?.pendingFollowUps ?? 0}</span> follow-ups planned.
                  </p>
                </div>
              </div>
              <Button size="xs" variant="outline" onClick={() => window.location.href = "/followups"}>
                View Agenda
              </Button>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-900">Overdue Follow-ups Alert</h4>
                  <p className="text-xs text-rose-700">
                    <span className="font-bold">{data?.kpis?.overdueFollowUps ?? 0}</span> activities require immediate action.
                  </p>
                </div>
              </div>
              <Button size="xs" variant="destructive" onClick={() => window.location.href = "/followups?overdue=true"}>
                Resolve Overdue
              </Button>
            </div>
          </div>

          {/* Chart.js Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#0D9488]" />
                  Lead Conversion & Status Distribution
                </CardTitle>
              </CardHeader>
              <CardBody className="p-6 flex justify-center items-center h-64">
                {data?.charts?.leadStatus?.data?.some((v: number) => v > 0) ? (
                  <Doughnut data={leadChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : (
                  <p className="text-xs text-slate-400">No lead records available for chart visualization.</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0D9488]" />
                  Opportunity Pipeline Stage Distribution
                </CardTitle>
              </CardHeader>
              <CardBody className="p-6 flex justify-center items-center h-64">
                {data?.charts?.pipelineStage?.counts?.some((v: number) => v > 0) ? (
                  <Bar data={oppChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : (
                  <p className="text-xs text-slate-400">No opportunity records available for pipeline chart.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
