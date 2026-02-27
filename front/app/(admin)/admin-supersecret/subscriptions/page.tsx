"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Тарифы подписок</h2>
        <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium max-w-2xl">Условия: период, сумма, лимит объявлений. Первое объявление бесплатно для всех при включённых подписках.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Код</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Название</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Цена (₸)</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Дней</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Макс. машин</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Активен</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-slate-600 font-medium">{p.id}</td>
                <td className="p-4"><code className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded-lg">{p.code}</code></td>
                <td className="p-4 font-medium text-slate-900">{p.name}</td>
                <td className="p-4 font-semibold text-slate-900">{p.price_kzt}</td>
                <td className="p-4 text-slate-600">{p.period_days}</td>
                <td className="p-4 text-slate-600">{p.max_cars ?? "—"}</td>
                <td className="p-4"><span className={p.is_active ? "text-green-600 font-medium" : "text-slate-400"}>{p.is_active ? "Да" : "Нет"}</span></td>
                <td className="p-4 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl text-slate-700 hover:bg-slate-100 border-slate-200" onClick={() => { setEditing(p.id); setAddMode(false); setForm({ ...p }); }}>Изменить</Button>
                  {p.is_active && (
                    <Button size="sm" variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 rounded-xl" onClick={() => handleDeactivate(p.id)}>Деактивировать</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing !== null || addMode) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30 p-8 max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{editing !== null ? "Редактировать тариф" : "Добавить тариф"}</h3>
              <p className="text-slate-500 text-sm mt-0.5">Заполните данные — все поля с подсказками</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Код (например FREE, PREMIUM)</Label>
              <Input value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="PREMIUM" className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Название</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Премиум" className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Цена (₸)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form.price_kzt === undefined || form.price_kzt === null ? "" : form.price_kzt}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") setForm((f) => ({ ...f, price_kzt: undefined }));
                    else {
                      const n = Number(raw);
                      if (!Number.isNaN(n)) setForm((f) => ({ ...f, price_kzt: n }));
                    }
                  }}
                  placeholder="0"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Дней</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.period_days === undefined || form.period_days === null ? "" : form.period_days}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") setForm((f) => ({ ...f, period_days: undefined }));
                    else {
                      const n = Number(raw);
                      if (!Number.isNaN(n)) setForm((f) => ({ ...f, period_days: n }));
                    }
                  }}
                  placeholder="30"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Бесплатных дней</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.free_days === undefined || form.free_days === null ? "" : form.free_days}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") setForm((f) => ({ ...f, free_days: undefined }));
                    else {
                      const n = Number(raw);
                      if (!Number.isNaN(n)) setForm((f) => ({ ...f, free_days: n }));
                    }
                  }}
                  placeholder="0"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Макс. объявлений</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.max_cars === undefined || form.max_cars === null ? "" : form.max_cars}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") setForm((f) => ({ ...f, max_cars: undefined }));
                    else {
                      const n = Number(raw);
                      if (!Number.isNaN(n)) setForm((f) => ({ ...f, max_cars: n }));
                    }
                  }}
                  placeholder="Пусто = безлимит"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            {editing !== null && (
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="active" checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400" />
                <Label htmlFor="active" className="text-slate-700 font-medium cursor-pointer">Тариф активен и доступен пользователям</Label>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold shadow-md">
                {editing !== null ? "Сохранить" : "Добавить"}
              </Button>
              <Button variant="outline" onClick={() => { setEditing(null); setAddMode(false); setForm({}); }} className="h-12 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold">
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {!addMode && editing === null && (
        <div>
          <Button onClick={() => { setAddMode(true); setForm({ code: "", name: "", price_kzt: 0, period_days: 30, free_days: 0 }); }} className="h-11 sm:h-12 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            Добавить тариф
          </Button>
        </div>
      )}
    </div>
  );
}
