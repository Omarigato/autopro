"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";

type Plan = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  price_kzt: number;
  period_days: number;
  free_days: number;
  max_cars?: number | null;
  is_active: boolean;
  create_date?: string | null;
};

const emptyForm: Partial<Plan> = {
  code: "",
  name: "",
  description: "",
  price_kzt: 0,
  period_days: 30,
  free_days: 0,
  max_cars: undefined,
  is_active: true,
};

const inputNum = "h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [form, setForm] = useState<Partial<Plan>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    apiClient
      .get("/admin/subscriptions/plans")
      .then((r: any) => {
        const d = r?.data ?? r;
        setPlans(Array.isArray(d) ? d : []);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setAddOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditPlan(p);
    setForm({
      code: p.code,
      name: p.name,
      description: p.description ?? "",
      price_kzt: p.price_kzt,
      period_days: p.period_days,
      free_days: p.free_days,
      max_cars: p.max_cars ?? undefined,
      is_active: p.is_active,
    });
    setEditOpen(true);
  };

  const openDelete = (p: Plan) => {
    setPlanToDelete(p);
    setDeleteOpen(true);
  };

  const handleAdd = async () => {
    if (!form.code?.trim() || !form.name?.trim()) {
      toast.error("Заполните код и название");
      return;
    }
    if (form.price_kzt == null || Number(form.price_kzt) < 0) {
      toast.error("Укажите цену (₸)");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/admin/subscriptions/plans", {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price_kzt: Number(form.price_kzt) || 0,
        period_days: Number(form.period_days) || 30,
        free_days: Number(form.free_days) || 0,
        max_cars: form.max_cars != null && form.max_cars.toString().trim() !== "" ? Number(form.max_cars) : null,
        is_active: form.is_active !== false,
      });
      toast.success("Тариф создан");
      setAddOpen(false);
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? "Ошибка при создании";
      toast.error(typeof msg === "string" ? msg : "Ошибка при создании");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editPlan) return;
    if (!form.code?.trim() || !form.name?.trim()) {
      toast.error("Заполните код и название");
      return;
    }
    if (form.price_kzt == null || Number(form.price_kzt) < 0) {
      toast.error("Укажите цену (₸)");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.patch(`/admin/subscriptions/plans/${editPlan.id}`, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price_kzt: Number(form.price_kzt) || 0,
        period_days: Number(form.period_days) ?? 30,
        free_days: Number(form.free_days) ?? 0,
        max_cars: form.max_cars != null && form.max_cars.toString().trim() !== "" ? Number(form.max_cars) : null,
        is_active: form.is_active !== false,
      });
      toast.success("Тариф обновлён");
      setEditOpen(false);
      setEditPlan(null);
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? "Ошибка при сохранении";
      toast.error(typeof msg === "string" ? msg : "Ошибка при сохранении");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      await apiClient.delete(`/admin/subscriptions/plans/${planToDelete.id}`);
      toast.success("Тариф деактивирован");
      setDeleteOpen(false);
      setPlanToDelete(null);
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? "Ошибка при деактивации";
      toast.error(typeof msg === "string" ? msg : "Ошибка при деактивации");
    }
  };

  if (loading) return <div className="text-slate-500">Загрузка...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Тарифы подписок
          </h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium max-w-2xl">
            Условия: период, сумма, лимит объявлений. Редактирование и деактивация через диалоги.
          </p>
        </div>
        <Button
          className="h-11 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2 text-sm sm:text-base"
          onClick={openAdd}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          Добавить тариф
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Код</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Название</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Цена (₸)</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Дней</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Макс. машин</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Активен</th>
                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{p.id}</td>
                  <td className="p-4">
                    <code className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded-lg">{p.code}</code>
                  </td>
                  <td className="p-4 font-medium text-slate-900">{p.name}</td>
                  <td className="p-4 font-semibold text-slate-900">{p.price_kzt}</td>
                  <td className="p-4 text-slate-600">{p.period_days}</td>
                  <td className="p-4 text-slate-600">{p.max_cars ?? "—"}</td>
                  <td className="p-4">
                    <span className={p.is_active ? "text-brand font-medium" : "text-red-400"}>
                      {p.is_active ? "Да" : "Нет"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl hover:bg-slate-100"
                        onClick={() => openEdit(p)}
                        title="Редактировать"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {p.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl hover:bg-red-50 hover:text-red-600"
                          onClick={() => openDelete(p)}
                          title="Деактивировать"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {plans.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium">Нет тарифов</div>
        )}
      </div>

      {/* Диалог добавления тарифа */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle>Новый тариф</DialogTitle>
                <DialogDescription>Заполните код, название и цену. Остальные поля — по желанию.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <PlanForm form={form} setForm={setForm} inputNum={inputNum} showActive={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">
              Отмена
            </Button>
            <Button onClick={handleAdd} disabled={submitting} className="rounded-xl">
              {submitting ? "Сохранение..." : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования тарифа */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditPlan(null);
          setEditOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle>Редактировать тариф</DialogTitle>
                <DialogDescription>Измените данные тарифа и сохраните.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <PlanForm form={form} setForm={setForm} inputNum={inputNum} showActive />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
              Отмена
            </Button>
            <Button onClick={handleEdit} disabled={submitting} className="rounded-xl">
              {submitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения деактивации */}
      <Dialog open={deleteOpen} onOpenChange={(open) => { if (!open) setPlanToDelete(null); setDeleteOpen(open); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Деактивировать тариф?</DialogTitle>
            <DialogDescription>
              Тариф «{planToDelete?.name}» ({planToDelete?.code}) будет скрыт из выбора для пользователей. Существующие подписки не затронуты.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              Деактивировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanForm({
  form,
  setForm,
  inputNum,
  showActive,
}: {
  form: Partial<Plan>;
  setForm: React.Dispatch<React.SetStateAction<Partial<Plan>>>;
  inputNum: string;
  showActive: boolean;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Код (например PREMIUM)</Label>
        <Input
          value={form.code ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          placeholder="PREMIUM"
          className="h-11 rounded-xl"
        />
      </div>
      <div className="grid gap-2">
        <Label>Название</Label>
        <Input
          value={form.name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Премиум"
          className="h-11 rounded-xl"
        />
      </div>
      <div className="grid gap-2">
        <Label>Описание (необязательно)</Label>
        <Input
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Краткое описание"
          className="h-11 rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Цена (₸)</Label>
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
            className={inputNum}
          />
        </div>
        <div className="grid gap-2">
          <Label>Дней</Label>
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
            className={inputNum}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Бесплатных дней</Label>
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
            className={inputNum}
          />
        </div>
        <div className="grid gap-2">
          <Label>Макс. объявлений</Label>
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
            className={inputNum}
          />
        </div>
      </div>
      {showActive && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="plan-active"
            checked={form.is_active !== false}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="rounded border-slate-300"
          />
          <Label htmlFor="plan-active" className="font-normal cursor-pointer">
            Тариф активен и доступен пользователям
          </Label>
        </div>
      )}
    </div>
  );
}
