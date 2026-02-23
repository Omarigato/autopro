"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/admin/users")
      .then((res: any) => {
        const d = res?.data ?? res;
        setUsers(Array.isArray(d) ? d : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Пользователи</h2>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Имя</th>
              <th className="text-left p-3">Логин / Email</th>
              <th className="text-left p-3">Телефон</th>
              <th className="text-left p-3">Роль</th>
              <th className="text-left p-3">Активен</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name || "—"}</td>
                <td className="p-3">{u.login || u.email || "—"}</td>
                <td className="p-3">{u.phone_number || "—"}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.is_active ? "Да" : "Нет"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-8 text-center text-slate-400">Нет пользователей</div>}
      </div>
    </div>
  );
}
