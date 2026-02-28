"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Layers,
  Palette,
  Settings,
  MapPin,
  Car,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

const DICT_TYPES: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "CATEGORY", label: "Категории", icon: Layers },
  { value: "COLOR", label: "Цвета", icon: Palette },
  { value: "STEERING", label: "Руль", icon: Settings },
  { value: "CONDITION", label: "Состояние", icon: Settings },
  { value: "CAR_CLASS", label: "Класс авто", icon: Car },
  { value: "CITY", label: "Города", icon: MapPin },
  { value: "TRANSMISSION", label: "Коробка", icon: Settings },
  { value: "FUEL", label: "Топливо", icon: Settings },
  { value: "BODY", label: "Кузов", icon: Car },
  { value: "MARKA", label: "Марки", icon: Car },
  { value: "MODEL", label: "Модели", icon: Car },
];

type DictItem = {
  id: number;
  name: string;
  name_ru: string;
  name_en: string;
  name_kk: string;
  code: string;
  type: string;
  parent_id: number | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
};

const emptyForm = {
  name_ru: "",
  name_en: "",
  name_kk: "",
  code: "",
  display_order: 0,
  icon: "",
  color: "",
  parent_id: null as number | null,
  is_active: true,
};

export default function AdminDictionariesPage() {
  const [itemsByType, setItemsByType] = useState<Record<string, DictItem[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("CATEGORY");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<DictItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DictItem | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const load = (type: string) => {
    setLoading((p) => ({ ...p, [type]: true }));
    apiClient
      .get("/admin/dictionaries", { params: { type } })
      .then((res: any) => {
        const d = res?.data ?? res;
        setItemsByType((p) => ({ ...p, [type]: Array.isArray(d) ? d : [] }));
      })
      .catch(() => {
        setItemsByType((p) => ({ ...p, [type]: [] }));
        toast.error("Ошибка при загрузке данных");
      })
      .finally(() => setLoading((p) => ({ ...p, [type]: false })));
  };

  const handleTab = (type: string) => {
    setActiveTab(type);
    setCurrentPage(1);
    if (!itemsByType[type] && !loading[type]) load(type);
  };

  useEffect(() => {
    load("CATEGORY");
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, display_order: (itemsByType[activeTab]?.length ?? 0) });
    setAddOpen(true);
  };

  const openEdit = (item: DictItem) => {
    setEditItem(item);
    setForm({
      name_ru: item.name_ru ?? item.name ?? "",
      name_en: item.name_en ?? "",
      name_kk: item.name_kk ?? "",
      code: item.code ?? "",
      display_order: item.display_order ?? 0,
      icon: item.icon ?? "",
      color: item.color ?? "",
      parent_id: item.parent_id ?? null,
      is_active: item.is_active ?? true,
    });
    setEditOpen(true);
  };

  const openDelete = (item: DictItem) => {
    setItemToDelete(item);
    setDeleteOpen(true);
  };

  const handleAdd = async () => {
    if (!form.name_ru?.trim() || !form.name_en?.trim() || !form.name_kk?.trim()) {
      toast.error("Укажите названия на трёх языках (RU, EN, KK)");
      return;
    }
    if (!form.code?.trim()) {
      toast.error("Укажите код");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/admin/dictionaries", {
        name_ru: form.name_ru.trim(),
        name_en: form.name_en.trim(),
        name_kk: form.name_kk.trim(),
        code: form.code.trim(),
        type: activeTab,
        parent_id: form.parent_id || undefined,
        display_order: form.display_order ?? 0,
        icon: form.icon?.trim() || undefined,
        color: form.color?.trim() || undefined,
        is_active: form.is_active,
      });
      toast.success("Запись создана");
      setAddOpen(false);
      load(activeTab);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? "Ошибка при создании";
      toast.error(typeof msg === "string" ? msg : "Ошибка при создании");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!form.name_ru?.trim() || !form.name_en?.trim() || !form.name_kk?.trim()) {
      toast.error("Укажите названия на трёх языках (RU, EN, KK)");
      return;
    }
    if (!form.code?.trim()) {
      toast.error("Укажите код");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.patch(`/admin/dictionaries/${editItem.id}`, {
        name_ru: form.name_ru.trim(),
        name_en: form.name_en.trim(),
        name_kk: form.name_kk.trim(),
        code: form.code.trim(),
        parent_id: form.parent_id ?? undefined,
        display_order: form.display_order ?? 0,
        icon: form.icon?.trim() || undefined,
        color: form.color?.trim() || undefined,
        is_active: form.is_active,
      });
      toast.success("Запись обновлена");
      setEditOpen(false);
      setEditItem(null);
      load(activeTab);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? "Ошибка при сохранении";
      toast.error(typeof msg === "string" ? msg : "Ошибка при сохранении");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/admin/dictionaries/${itemToDelete.id}`);
      toast.success("Запись удалена");
      setDeleteOpen(false);
      setItemToDelete(null);
      load(activeTab);
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? "Ошибка при удалении";
      toast.error(typeof msg === "string" ? msg : "Ошибка при удалении");
    }
  };

  const filteredItems = (itemsByType[activeTab] || []).filter(
    (item) =>
      !searchQuery ||
      (item.name_ru || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name_en || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name_kk || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Словари
          </h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">
            Управление справочниками: три названия (RU, EN, KK), порядок отображения, иконка и цвет.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 min-w-0">
          <div className="relative min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 sm:pl-11 pr-4 h-11 w-full sm:w-72 bg-white border-slate-200 rounded-xl sm:rounded-2xl shadow-sm focus-visible:ring-slate-400 font-medium text-base"
            />
          </div>
          <Button
            className="h-11 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2 text-sm sm:text-base"
            onClick={openAdd}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            Добавить
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Раздел словаря</p>
        <Tabs value={activeTab} onValueChange={handleTab} className="w-full">
          <TabsList className="flex flex-wrap items-center justify-start w-full h-auto p-2 bg-slate-100/80 rounded-2xl border border-slate-200/60 gap-2">
            {DICT_TYPES.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md text-slate-500 hover:text-slate-700"
              >
                <Icon className="h-4 w-4 mr-2 shrink-0" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DICT_TYPES.map(({ value }) => (
            <div key={value} className={value !== activeTab ? "hidden" : "mt-4"}>
              {loading[value] ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
                  <p className="mt-4 text-slate-500 font-bold text-sm">Загрузка...</p>
                </div>
              ) : (
                <>
                  <DictTable
                    items={paginatedItems}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="rounded-xl"
                      >
                        Назад
                      </Button>
                      <span className="text-sm font-medium text-slate-500">
                        Страница {currentPage} из {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-xl"
                      >
                        Вперед
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </Tabs>
      </div>

      {/* Диалог добавления */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle>Новая запись — {DICT_TYPES.find((t) => t.value === activeTab)?.label}</DialogTitle>
                <DialogDescription>Заполните названия на трёх языках, код и порядок отображения.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DictForm form={form} setForm={setForm} type={activeTab} />
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

      {/* Диалог редактирования */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
          setEditOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle>Редактировать запись</DialogTitle>
                <DialogDescription>Измените названия, порядок, иконку или цвет.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DictForm form={form} setForm={setForm} type={activeTab} isEdit />
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

      {/* Диалог удаления */}
      <Dialog open={deleteOpen} onOpenChange={(open) => { if (!open) setItemToDelete(null); setDeleteOpen(open); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription>
              «{itemToDelete?.name_ru || itemToDelete?.name}» ({itemToDelete?.code}) будет удалена безвозвратно.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DictTable({
  items,
  onEdit,
  onDelete,
}: {
  items: DictItem[];
  onEdit: (item: DictItem) => void;
  onDelete: (item: DictItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
        <Search className="h-10 w-10 text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold text-lg">Записей не найдено</p>
        <p className="text-slate-400 text-sm mt-1">Измените поиск или добавьте запись</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Код</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Название (RU)</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Название (EN)</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Название (KK)</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Порядок</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Иконка</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Цвет</th>
              <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Активен</th>
              <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-slate-600 font-medium">{item.id}</td>
                <td className="p-4">
                  <code className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded-lg">{item.code}</code>
                </td>
                <td className="p-4 font-medium text-slate-900">{item.name_ru || item.name || "—"}</td>
                <td className="p-4 text-slate-700">{item.name_en || "—"}</td>
                <td className="p-4 text-slate-700">{item.name_kk || "—"}</td>
                <td className="p-4 text-slate-600">{item.display_order}</td>
                <td className="p-4 text-slate-600">{item.icon || "—"}</td>
                <td className="p-4">
                  {item.color ? (
                    <span
                      className="inline-block w-6 h-6 rounded-full border border-slate-200"
                      style={{ backgroundColor: item.color }}
                      title={item.color}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-4">
                  <span className={item.is_active ? "text-blue-600 font-medium" : "text-red-400"}>
                    {item.is_active ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100" onClick={() => onEdit(item)} title="Редактировать">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item)} title="Удалить">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DictForm({
  form,
  setForm,
  type,
  isEdit,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  type: string;
  isEdit?: boolean;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Название (RU) *</Label>
        <Input
          value={form.name_ru}
          onChange={(e) => setForm((f) => ({ ...f, name_ru: e.target.value }))}
          placeholder="На русском"
          className="rounded-xl"
        />
      </div>
      <div className="grid gap-2">
        <Label>Название (EN) *</Label>
        <Input
          value={form.name_en}
          onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
          placeholder="In English"
          className="rounded-xl"
        />
      </div>
      <div className="grid gap-2">
        <Label>Название (KK) *</Label>
        <Input
          value={form.name_kk}
          onChange={(e) => setForm((f) => ({ ...f, name_kk: e.target.value }))}
          placeholder="Қазақша"
          className="rounded-xl"
        />
      </div>
      <div className="grid gap-2">
        <Label>Код *</Label>
        <Input
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          placeholder="UNIQUE_CODE"
          className="rounded-xl font-mono text-sm"
          disabled={!!isEdit}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Порядок отображения</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={form.display_order === null || form.display_order === undefined ? "" : form.display_order}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, display_order: v === "" ? 0 : parseInt(v, 10) || 0 }));
            }}
            placeholder="0"
            className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="grid gap-2">
          <Label>Иконка (Lucide)</Label>
          <Input
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            placeholder="Car"
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Цвет (Tailwind или #hex)</Label>
        <Input
          value={form.color}
          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
          placeholder="slate-500 или #64748b"
          className="rounded-xl"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="dict-active"
          checked={form.is_active}
          onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          className="rounded border-slate-300"
        />
        <Label htmlFor="dict-active" className="font-normal cursor-pointer">
          Запись активна
        </Label>
      </div>
    </div>
  );
}
