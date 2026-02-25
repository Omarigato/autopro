"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminCarsPage() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiClient.get("/admin/cars")
      .then((res: any) => {
        const d = res?.data ?? res;
        setCars(Array.isArray(d) ? d : []);
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = (carId: number) => {
    apiClient.post(`/admin/cars/${carId}/approve`).then(() => load());
  };

  const reject = (carId: number) => {
    apiClient.post(`/admin/cars/${carId}/reject`).then(() => load());
  };

  if (loading) return <div className="text-slate-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Объявления (машины)</h2>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Название</th>
              <th className="text-left p-3">Статус</th>
              <th className="text-left p-3">Просмотры</th>
              <th className="text-left p-3">Автор</th>
              <th className="text-left p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3">{c.id}</td>
                <td className="p-3">
                  <Link
                    href={`/dashboard/cars/${c.id}`}
                    className="text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      c.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : c.status === "CREATED" || c.status === "UPDATED"
                        ? "bg-amber-100 text-amber-800"
                        : c.status === "DRAFT"
                        ? "bg-slate-100 text-slate-600"
                        : c.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3">{c.views ?? 0}</td>
                <td className="p-3">{c.author || "—"}</td>
                <td className="p-3 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approve(c.id)}
                  >
                    Одобрить
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    variant="destructive"
                    onClick={() => reject(c.id)}
                  >
                    Отклонить
                  </Button>
                  <a
                    href={`/cars/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs"
                  >
                    Открыть
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && <div className="p-8 text-center text-slate-400">Нет объявлений</div>}
      </div>
    </div>
  );
}
