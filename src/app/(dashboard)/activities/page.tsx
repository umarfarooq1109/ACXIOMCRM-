"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Plus, Phone, Mail, Users, FileText } from "lucide-react";
import { ACTIVITY_TYPES } from "@/schemas/activity";

export default function ActivitiesPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  // Log Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [activityType, setActivityType] = useState<any>("Call");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activities?limit=50");
      const data = await res.json();
      if (res.ok) setActivities(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogError("");
    setLogLoading(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType, subject, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLogError(data.message || "Failed to log activity.");
        setLogLoading(false);
        return;
      }

      setShowLogModal(false);
      setSubject("");
      setDescription("");
      fetchActivities();
    } catch (err) {
      setLogError("Network error occurred.");
      setLogLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Sales Activity Stream"
        description="Log phone calls, client meetings, email correspondence, and task notes."
        breadcrumbs={[{ label: "Activities" }]}
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowLogModal(true)}
          >
            Log Activity
          </Button>
        }
      />

      <Card>
        <CardBody className="p-4">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No sales activities logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 hover:border-[#0D9488]/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center border border-teal-100 flex-shrink-0 mt-0.5">
                    {a.activityType === "Call" ? <Phone className="w-4 h-4" /> : a.activityType === "Email" ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900">{a.subject}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(a.activityDate).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {a.description && <p className="text-xs text-slate-600 mt-1">{a.description}</p>}
                    <div className="mt-2 flex gap-2 items-center text-[11px] text-slate-500">
                      <Badge variant="teal">{a.activityType}</Badge>
                      <span>Logged by <strong className="text-slate-700">{a.assignedTo?.name}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Log Sales Activity</h3>

            {logError && (
              <div className="p-2.5 my-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {logError}
              </div>
            )}

            <form onSubmit={handleLogSubmit} className="space-y-3 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Activity Type</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Subject *"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Discovery Call with VP of Sales"
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description / Minutes of Meeting</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key outcomes and next steps..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setShowLogModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={logLoading}>
                  Log Activity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
