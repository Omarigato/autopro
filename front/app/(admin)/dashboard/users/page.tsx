"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    apiClient.get("/admin/users")
      .then((res: any) => {
        const d = res?.data ?? res;
        setUsers(Array.isArray(d) ? d : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.login || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-slate-500">Загрузка...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Пользователи</h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">Управление учётными записями</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 min-w-0">
          <div className="relative min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-11 pr-4 h-11 w-full sm:w-72 bg-white border-slate-200 rounded-xl sm:rounded-2xl shadow-sm focus-visible:ring-slate-400 font-medium text-base"
            />
          </div>
          <Button className="h-11 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2 text-sm sm:text-base">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Мобильная версия: карточки вместо таблицы */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 font-medium">Нет пользователей</div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-bold text-slate-900 truncate">{u.name || "—"}</span>
                <span className="text-xs font-bold text-slate-400 shrink-0">#{u.id}</span>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Логин / Email</span>
                  <span className="text-slate-900 font-medium truncate text-right">{u.login || u.email || "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Телефон</span>
                  <span className="text-slate-900 font-medium text-right break-all">{u.phone_number || "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Роль</span>
                  <span className="text-slate-900 font-medium">{u.role}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Активен</span>
                  <span className={u.is_active ? "text-green-600 font-medium" : "text-slate-400"}>{u.is_active ? "Да" : "Нет"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Десктоп: таблица */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Имя</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Логин / Email</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Телефон</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Роль</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Активен</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{u.id}</td>
                  <td className="p-4 font-medium text-slate-900">{u.name || "—"}</td>
                  <td className="p-4 text-slate-700">{u.login || u.email || "—"}</td>
                  <td className="p-4 text-slate-700">{u.phone_number || "—"}</td>
                  <td className="p-4 text-slate-700">{u.role}</td>
                  <td className="p-4">{u.is_active ? <span className="text-green-600 font-medium">Да</span> : <span className="text-slate-400">Нет</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <div className="p-8 text-center text-slate-500 font-medium">Нет пользователей</div>}
      </div>
    </div>
  );
}
