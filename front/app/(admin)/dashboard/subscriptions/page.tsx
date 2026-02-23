"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Plan = {
  id: number;
  code: string;
  name: string;
  description?: string;
  price_kzt: number;
  period_days: number;
  free_days: number;
  max_cars?: number;
  is_active: boolean;
};

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState<Partial<Plan>>({});

  const load = () => {
    apiClient.get("/admin/subscriptions/plans")
      .then((r: any) => {
        const d = r?.data ?? r;
        setPlans(Array.isArray(d) ? d : []);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing !== null) {
      await apiClient.patch(`/admin/subscriptions/plans/${editing}`, form);
      toast.success("Тариф обновлён");
    } else {
      if (!form.code || !form.name || form.price_kzt == null) {
        toast.error("Заполните код, название и цену");
        return;
      }
      await apiClient.post("/admin/subscriptions/plans", {
        code: form.code,
        name: form.name,
        description: form.description ?? null,
        price_kzt: Number(form.price_kzt) || 0,
        period_days: Number(form.period_days) || 30,
        free_days: Number(form.free_days) || 0,
        max_cars: typeof form.max_cars === "number" ? form.max_cars : null,
        is_active: form.is_active !== false,
      });
      toast.success("Тариф создан");
    }
    setEditing(null);
    setAddMode(false);
    setForm({});
    load();
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Деактивировать тариф?")) return;
    await apiClient.delete(`/admin/subscriptions/plans/${id}`);
    toast.success("Тариф деактивирован");
    load();
  };

  if (loading) return <div className="text-slate-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Тарифы подписок</h2>
      <p className="text-slate-500 text-sm mb-6">Условия: дни, сумма, лимит объявлений (max_cars). Первое объявление бесплатно для всех при включённых подписках.</p>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Код</th>
              <th className="text-left p-3">Название</th>
              <th className="text-left p-3">Цена (₸)</th>
              <th className="text-left p-3">Дней</th>
              <th className="text-left p-3">Макс. машин</th>
              <th className="text-left p-3">Активен</th>
              <th className="text-left p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3">{p.id}</td>
                <td className="p-3 font-mono">{p.code}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price_kzt}</td>
                <td className="p-3">{p.period_days}</td>
                <td className="p-3">{p.max_cars ?? "—"}</td>
                <td className="p-3">{p.is_active ? "Да" : "Нет"}</td>
                <td className="p-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(p.id); setAddMode(false); setForm({ ...p }); }}>Изменить</Button>
                  {p.is_active && (
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeactivate(p.id)}>Деактивировать</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing !== null || addMode) && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 max-w-md">
          <h3 className="font-semibold mb-4">{editing !== null ? "Редактировать тариф" : "Добавить тариф"}</h3>
          <div className="space-y-4">
            <div>
              <Label>Код (например FREE, PREMIUM)</Label>
              <Input value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1" placeholder="PREMIUM" />
            </div>
            <div>
              <Label>Название</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Премиум" />
            </div>
            <div>
              <Label>Цена (₸)</Label>
              <Input type="number" value={form.price_kzt ?? ""} onChange={(e) => setForm({ ...form, price_kzt: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Дней</Label>
              <Input type="number" value={form.period_days ?? ""} onChange={(e) => setForm({ ...form, period_days: Number(e.target.value) || 30 })} className="mt-1" />
            </div>
            <div>
              <Label>Бесплатных дней</Label>
              <Input type="number" value={form.free_days ?? ""} onChange={(e) => setForm({ ...form, free_days: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Макс. объявлений (пусто = безлимит)</Label>
              <Input type="number" value={form.max_cars ?? ""} onChange={(e) => setForm({ ...form, max_cars: e.target.value === "" ? undefined : Number(e.target.value) })} className="mt-1" placeholder="—" />
            </div>
            {editing !== null && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Label htmlFor="active">Активен</Label>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSave}>{editing !== null ? "Сохранить" : "Добавить"}</Button>
              {(editing !== null || addMode) && <Button variant="outline" onClick={() => { setEditing(null); setAddMode(false); setForm({}); }}>Отмена</Button>}
            </div>
          </div>
        </div>
      )}

      {!addMode && editing === null && (
        <div className="mt-4">
          <Button variant="outline" onClick={() => { setAddMode(true); setForm({ code: "", name: "", price_kzt: 0, period_days: 30, free_days: 0 }); }}>Добавить тариф</Button>
        </div>
      )}
    </div>
  );
}
