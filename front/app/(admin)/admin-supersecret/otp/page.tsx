"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminOtpPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState("");

  const load = (t?: string) => {
    setLoading(true);
    apiClient
      .get("/admin/otp", { params: { target: t || undefined } })
      .then((res: any) => {
        const d = res?.data ?? res;
        setItems(Array.isArray(d) ? d : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">OTP‑коды</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Фильтр по телефону/email (target)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => load(target || undefined)} disabled={loading}>
          Найти
        </Button>
      </div>

      {loading ? (
        <div className="text-slate-500">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Target</th>
                <th className="text-left p-2">Код</th>
                <th className="text-left p-2">Тип</th>
                <th className="text-left p-2">Использован</th>
                <th className="text-left p-2">Создан</th>
                <th className="text-left p-2">Истекает</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2 font-mono">{o.target}</td>
                  <td className="p-2 font-mono font-semibold">{o.code}</td>
                  <td className="p-2">{o.type}</td>
                  <td className="p-2">{o.is_used ? "Да" : "Нет"}</td>
                  <td className="p-2">
                    {o.created_at ? new Date(o.created_at).toLocaleString("ru-RU") : "—"}
                  </td>
                  <td className="p-2">
                    {o.expires_at ? new Date(o.expires_at).toLocaleString("ru-RU") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-6 text-center text-slate-400">Нет записей</div>
          )}
        </div>
      )}
    </div>
  );
}

