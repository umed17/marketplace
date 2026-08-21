"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { roleLabel } from "@/lib/i18n";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  isVerified: boolean;
};

export default function AdminUsers() {
  const { tr, locale } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  async function load() {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (role) sp.set("role", role);
    const d = await fetch(`/api/admin/users?${sp}`).then((r) => r.json());
    setUsers(d.users || []);
  }
  useEffect(() => {
    load();
  }, [q, role]);

  async function patch(id: string, body: object) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }
  async function remove(id: string) {
    if (!confirm(tr("confirmDelete"))) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input className="input" placeholder={tr("searchUsers")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{tr("all")}</option>
          <option value="customer">{tr("roleCustomer")}</option>
          <option value="master">{tr("roleMaster")}</option>
          <option value="admin">{tr("roleAdmin")}</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{tr("name")}</th>
              <th>{tr("emailPhone")}</th>
              <th>{tr("role")}</th>
              <th>{tr("status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>
                  {u.email}
                  <br />
                  {u.phone}
                </td>
                <td>{roleLabel(locale, u.role)}</td>
                <td>
                  {u.isBlocked ? tr("blocked") : tr("active")} {u.isVerified ? `· ${tr("verified")}` : ""}
                </td>
                <td className="space-x-2 p-3">
                  <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => patch(u.id, { isBlocked: !u.isBlocked })}>
                    {u.isBlocked ? tr("unblock") : tr("block")}
                  </button>
                  <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => remove(u.id)}>
                    {tr("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
