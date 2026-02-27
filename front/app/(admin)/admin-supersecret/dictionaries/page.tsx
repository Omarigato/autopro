"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DICT_TYPES: { value: string; label: string; icon: any }[] = [
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

export default function AdminDictionariesPage() {
  const [itemsByType, setItemsByType] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("CATEGORY");

  const load = (type: string) => {
    setLoading((p) => ({ ...p, [type]: true }));
    apiClient.get("/admin/dictionaries", { params: { type } })
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
    if (!itemsByType[type] && !loading[type]) load(type);
  };

  useEffect(() => { load("CATEGORY"); }, []);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Словари</h2>
            <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base font-medium">Управление системными справочниками и категориями</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <div className="relative group min-w-0">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors pointer-events-none" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-11 pr-4 h-11 sm:h-12 w-full sm:w-72 bg-white border-slate-100 rounded-xl sm:rounded-2xl shadow-sm focus-visible:ring-slate-400 font-medium transition-all text-base"
              />
            </div>
            <DictDialog type={activeTab} onUpdate={() => load(activeTab)}>
              <Button className="h-11 sm:h-12 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2 text-sm sm:text-base">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                Добавить
              </Button>
            </DictDialog>
          </div>
        </div>

        {/* Mobile: выбор типа словаря — всегда видимый блок */}
        <div className="md:hidden w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Label className="text-sm font-bold text-slate-700 mb-3 block">Раздел словаря</Label>
          <Select value={activeTab} onValueChange={handleTab}>
            <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-200 font-semibold text-slate-900 [&>span]:line-clamp-1 text-base">
              <SelectValue placeholder="Выберите раздел" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[70vh]">
              {DICT_TYPES.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value} className="py-3 rounded-lg font-medium">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-slate-600" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTab} className="w-full space-y-4 sm:space-y-6">
        {/* Desktop: вкладки с переносом — все всегда видны */}
        <div className="hidden md:block w-full">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Раздел словаря</p>
          <TabsList className="flex flex-wrap items-center justify-start w-full h-auto p-2 bg-slate-100/80 rounded-2xl border border-slate-200/60 gap-2">
            {DICT_TYPES.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md text-slate-500 hover:text-slate-700"
              >
                <Icon className="h-4 w-4 mr-2 shrink-0" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {DICT_TYPES.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-0 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
            {loading[value] ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all">
                <div className="h-9 w-9 sm:h-10 sm:w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
                <p className="mt-4 text-slate-500 font-bold text-sm sm:text-base">Загрузка...</p>
              </div>
            ) : (
              <DictTable
                type={value}
                items={(itemsByType[value] || []).filter(item =>
                  item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.code?.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                onUpdate={() => load(value)}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DictTable({ type, items, onUpdate }: { type: string; items: any[]; onUpdate: () => void }) {
  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту запись?")) return;
    try {
      await apiClient.delete(`/admin/dictionaries/${id}`);
      toast.success("Запись успешно удалена");
      onUpdate();
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-bold text-lg">Записей не найдено</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs">Попробуйте изменить запрос или выберите другой раздел</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View — прокрутка по горизонтали при нехватке места */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/30">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-4 lg:px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">ID</th>
              <th className="px-4 lg:px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Код</th>
              <th className="px-4 lg:px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Наименование</th>
              <th className="px-4 lg:px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Тип</th>
              <th className="px-4 lg:px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right whitespace-nowrap">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 lg:px-6 py-3.5 text-xs font-bold text-slate-400">#{item.id}</td>
                <td className="px-4 lg:px-6 py-3.5">
                  <code className="text-[10px] font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200/50">
                    {item.code}
                  </code>
                </td>
                <td className="px-4 lg:px-6 py-3.5 font-bold text-slate-900">{item.name}</td>
                <td className="px-4 lg:px-6 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 uppercase tracking-wider">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3.5">
                  <div className="flex items-center justify-end gap-2 text-right">
                    <DictDialog type={type} item={item} onUpdate={onUpdate}>
                      <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-slate-700 hover:bg-slate-100 font-bold gap-1.5 text-xs">
                        <Pencil className="h-3.5 w-3.5 shrink-0" />
                        Изменить
                      </Button>
                    </DictDialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-9 px-3 rounded-xl text-red-500 hover:bg-red-50 font-bold gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0" />
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md space-y-3 active:scale-[0.99] transition-transform touch-manipulation">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID #{item.id}</span>
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-50 text-slate-500 uppercase border border-slate-100 shrink-0">
                {item.type}
              </span>
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-base font-bold text-slate-900 break-words">{item.name}</h4>
              <code className="inline-block text-[10px] font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg break-all">
                {item.code}
              </code>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <DictDialog type={type} item={item} onUpdate={onUpdate}>
                <Button className="flex-1 h-11 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold gap-2 shadow-md">
                  <Pencil className="h-4 w-4 shrink-0" />
                  Изменить
                </Button>
              </DictDialog>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(item.id)}
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl text-red-500 border-red-100 hover:bg-red-50 shrink-0"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DictDialog({ type, item, onUpdate, children }: { type: string; item?: any; onUpdate: () => void; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: item?.name || "",
    code: item?.code || "",
    type: item?.type || type,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (item) {
        await apiClient.patch(`/admin/dictionaries/${item.id}`, formData);
        toast.success("Запись успешно обновлена");
      } else {
        await apiClient.post("/admin/dictionaries", formData);
        toast.success("Запись успешно создана");
      }
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Ошибка при сохранении");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[425px] sm:max-w-[425px] mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Редактировать запись" : "Создать запись"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Наименование</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Код</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Vibrant_RED"
              required
              disabled={!!item}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Тип</Label>
            <Input
              id="type"
              value={formData.type}
              disabled
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-700">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
