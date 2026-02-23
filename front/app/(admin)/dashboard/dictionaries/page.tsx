"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const DICT_TYPES: { value: string; label: string }[] = [
  { value: "CATEGORY", label: "Категории" },
  { value: "COLOR", label: "Цвета" },
  { value: "STEERING", label: "Руль" },
  { value: "CONDITION", label: "Состояние" },
  { value: "CAR_CLASS", label: "Класс авто" },
  { value: "CITY", label: "Города" },
  { value: "TRANSMISSION", label: "Коробка" },
  { value: "FUEL", label: "Топливо" },
  { value: "BODY", label: "Кузов" },
  { value: "MARKA", label: "Марки" },
  { value: "MODEL", label: "Модели" },
];

export default function AdminDictionariesPage() {
  const [itemsByType, setItemsByType] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const load = (type: string) => {
    setLoading((p) => ({ ...p, [type]: true }));
    apiClient.get("/admin/dictionaries", { params: { type } })
      .then((res: any) => {
        const d = res?.data ?? res;
        setItemsByType((p) => ({ ...p, [type]: Array.isArray(d) ? d : [] }));
      })
      .catch(() => setItemsByType((p) => ({ ...p, [type]: [] })))
      .finally(() => setLoading((p) => ({ ...p, [type]: false })));
  };

  const handleTab = (type: string) => {
    if (!itemsByType[type] && !loading[type]) load(type);
  };

  useEffect(() => { load("CATEGORY"); }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Словари</h2>
      <Tabs defaultValue="CATEGORY" onValueChange={handleTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {DICT_TYPES.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
          ))}
        </TabsList>
        {DICT_TYPES.map(({ value, label }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {loading[value] ? (
              <div className="text-slate-500">Загрузка...</div>
            ) : (
              <DictTable type={value} items={itemsByType[value] || []} onUpdate={() => load(value)} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DictTable({ type, items, onUpdate }: { type: string; items: any[]; onUpdate: () => void }) {
  const handleDelete = (id: number) => {
    if (!confirm("Удалить запись?")) return;
    apiClient.delete(`/admin/dictionaries/${id}`).then(onUpdate);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="text-left p-3">ID</th>
            <th className="text-left p-3">code</th>
            <th className="text-left p-3">name</th>
            <th className="text-left p-3">type</th>
            <th className="text-left p-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-3">{item.id}</td>
              <td className="p-3 font-mono text-xs">{item.code}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.type}</td>
              <td className="p-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>Удалить</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <div className="p-8 text-center text-slate-400">Нет записей</div>}
    </div>
  );
}
