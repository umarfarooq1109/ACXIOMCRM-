"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Plus, CheckCircle2, Calendar, Phone, Mail, Users, AlertTriangle } from "lucide-react";
import { FOLLOWUP_TYPES } from "@/schemas/followup";

export default function FollowUpsPage() {
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [tab, setTab] = useState<"planned" | "overdue" | "completed">("planned");

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [followUpType, setFollowUpType] = useState("Call");
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    setFollowUpDate(new Date().toISOString().split("T")[0]);
  }, []);
  const [remarks, setRemarks] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (tab === "planned") params.append("status", "Planned");
      else if (tab === "completed") params.append("status", "Completed");
      else if (tab === "overdue") params.append("overdue", "true");

      const res = await fetch(`/api/followups?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setFollowUps(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [tab]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError("");
    setScheduleLoading(true);

    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          followUpType,
          followUpDate,
          remarks,
          status: "Planned",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScheduleError(data.message || "Failed to schedule follow-up.");
        setScheduleLoading(false);
        return;
      }

      setShowScheduleModal(false);
      setSubject("");
      setRemarks("");
      fetchFollowUps();
    } catch (err) {
      setScheduleError("Network error occurred.");
      setScheduleLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/followups/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: "Completed on time" }),
      });
      if (res.ok) fetchFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Follow-Up & Activity Agenda"
        description="Schedule sales calls, client meetings, and track pending action items."
        breadcrumbs={[{ label: "Follow-ups" }]}
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowScheduleModal(true)}
          >
            Schedule Follow-Up
          </Button>
        }
      />

      <Card>
        <CardBody className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setTab("planned")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === "planned" ? "bg-[#0D9488] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Upcoming Agenda
            </button>
            <button
              onClick={() => setTab("overdue")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                tab === "overdue" ? "bg-rose-600 text-white" : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Overdue Tasks
            </button>
            <button
              onClick={() => setTab("completed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === "completed" ? "bg-[#0D9488] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Completed Log
            </button>
          </div>

          {loading ? (
            <TableSkeleton rows={5} />
          ) : followUps.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No follow-up tasks in this view.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3">Subject</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Scheduled Date</th>
                    <th className="p-3">Related Account</th>
                    <th className="p-3">Assigned User</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {followUps.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-semibold text-slate-900">{f.subject}</td>
                      <td className="p-3">
                        <Badge variant="sky">{f.followUpType}</Badge>
                      </td>
                      <td className="p-3 font-medium">
                        {new Date(f.followUpDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3">
                        {f.customer?.customerName || f.lead?.leadName || "General Task"}
                      </td>
                      <td className="p-3">{f.assignedTo?.name}</td>
                      <td className="p-3">
                        <Badge variant={f.status === "Completed" ? "emerald" : "teal"}>{f.status}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        {f.status === "Planned" && (
                          <Button size="xs" variant="outline" onClick={() => handleComplete(f.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Mark Done
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Schedule Follow-up Activity</h3>

            {scheduleError && (
              <div className="p-2.5 my-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {scheduleError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-3 mt-4">
              <Input
                label="Subject *"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Product Demo & Contract Discussion"
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Activity Type</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value)}
                >
                  {FOLLOWUP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Follow-up Date *"
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                helperText="Must not be earlier than today."
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Remarks / Objectives</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Key discussion points..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={scheduleLoading}>
                  Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
