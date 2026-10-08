"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Shield, Unlock, UserCheck, Lock } from "lucide-react";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Role Edit Modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>("SalesExecutive");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlock = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/unlock`, { method: "POST" });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="User & Role Administration"
        description="System user directory, role assignments, and account lockout management."
        breadcrumbs={[{ label: "Users" }]}
      />

      <Card>
        <CardBody className="p-4">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3">User Name</th>
                    <th className="p-3">Corporate Email</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">System Role</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3">Lockout Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => {
                    const isLocked = u.lockoutEnd && new Date(u.lockoutEnd) > new Date();

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3 font-mono">{u.phone || "—"}</td>
                        <td className="p-3">
                          <Badge variant={u.role === "Admin" ? "violet" : u.role === "Manager" ? "sky" : "teal"}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={u.isActive ? "emerald" : "rose"}>
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {isLocked ? (
                            <Badge variant="rose" dot>
                              Locked until {new Date(u.lockoutEnd).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">Normal</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isLocked && (
                              <Button size="xs" variant="outline" onClick={() => handleUnlock(u.id)}>
                                <Unlock className="w-3.5 h-3.5 text-rose-600 mr-1" /> Unlock
                              </Button>
                            )}
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(u);
                                setNewRole(u.role);
                              }}
                            >
                              <Shield className="w-3.5 h-3.5 text-[#0D9488] mr-1" /> Change Role
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Assign Role</h3>
            <p className="text-xs text-slate-500 mt-1">
              Change system authorization role for <strong className="text-slate-800">{selectedUser.name}</strong>.
            </p>

            <form onSubmit={handleUpdateRole} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Role Scope</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="SalesExecutive">SalesExecutive (Own Records Scope)</option>
                  <option value="Manager">Manager (Team & Pipeline Scope)</option>
                  <option value="Admin">Admin (Full System & Audit Scope)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={actionLoading}>
                  Save Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
