"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totals?: { users: number; cars: number };
    most_viewed?: { id: number; name: string; views: number }[];
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/admin/stats")
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d) setStats(d);
      })
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Загрузка...</div>;
  }

  const totals = stats.totals || { users: 0, cars: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-400 font-medium text-sm uppercase">Всего пользователей</h3>
        <p className="text-3xl font-black mt-2">{totals.users}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-400 font-medium text-sm uppercase">Объявления</h3>
        <p className="text-3xl font-black mt-2">{totals.cars}</p>
      </div>

      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold mb-4">Популярные по просмотрам</h3>
        <ul className="space-y-2">
          {(stats.most_viewed || []).slice(0, 5).map((c: any) => (
            <li key={c.id} className="flex justify-between text-sm">
              <span>{c.name}</span>
              <span className="text-slate-500">{c.views} просмотров</span>
            </li>
          ))}
          {(!stats.most_viewed || stats.most_viewed.length === 0) && (
            <li className="text-slate-400 text-sm">Нет данных</li>
          )}
        </ul>
      </div>
    </div>
  );
}
