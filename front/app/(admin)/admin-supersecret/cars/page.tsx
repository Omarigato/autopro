"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";


export default function AdminCarsPage() {
  const { t } = useTranslation();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const filteredCars = cars.filter(
    (c) =>
      !searchQuery ||
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.author || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = filteredCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const approve = (carId: number) => {
    apiClient.post(`/admin/cars/${carId}/approve`).then(() => load());
  };

  const reject = (carId: number) => {
    apiClient.post(`/admin/cars/${carId}/reject`).then(() => load());
  };

  if (loading) return <div className="text-slate-500">{t("admin.loading")}</div>;

  const statusClass = (status: string) =>
    status === "PUBLISHED" ? "bg-green-100 text-green-800" :
      status === "CREATED" || status === "UPDATED" ? "bg-amber-100 text-amber-800" :
        status === "DRAFT" ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-600";
  status === "REJECTED" ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-600";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{t("admin.cars_page.title")}</h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">{t("admin.cars_page.subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 min-w-0">
          <div className="relative min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder={t("admin.cars_page.search_placeholder")}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 sm:pl-11 pr-4 h-11 w-full sm:w-72 bg-white border-slate-200 rounded-xl sm:rounded-2xl shadow-sm focus-visible:ring-slate-400 font-medium text-base"
            />
          </div>
          <Button className="h-11 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2 text-sm sm:text-base" asChild>
            <Link href="/add">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              {t("admin.cars_page.add_button")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Мобильная версия: карточки */}
      <div className="md:hidden space-y-3">
        {paginatedCars.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 font-medium">{t("admin.cars_page.no_cars")}</div>
        ) : (
          paginatedCars.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/cars/${c.id}`} className="text-base font-bold text-slate-900 truncate hover:underline">
                  {c.name}
                </Link>
                <span className="text-xs font-bold text-slate-400 shrink-0">#{c.id}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusClass(c.status)}`}>{c.status}</span>
                <span className="text-slate-500 text-xs">{t("admin.cars_page.views_label")}: {c.views ?? 0}</span>
                <span className="text-slate-500 text-xs truncate">{t("admin.cars_page.author_label")}: {c.author || "—"}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {c.status !== "ACTIVE" && c.status !== "PUBLISHED" && (
                  <Button size="sm" className="flex-1 min-w-0 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold gap-1.5" onClick={() => approve(c.id)}>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    {t("admin.cars_page.approve_button")}
                  </Button>
                )}
                {c.status !== "REJECT" && c.status !== "REJECTED" && (
                  <Button size="sm" className="flex-1 min-w-0 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5" onClick={() => reject(c.id)}>
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {t("admin.cars_page.reject_button")}
                  </Button>
                )}
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
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.cars_page.id_label")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.cars_page.name_label")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.cars_page.status_label")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.cars_page.views_label")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.cars_page.author_label")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.cars_page.actions_label")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCars.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{c.id}</td>
                  <td className="p-4">
                    <Link href={`/cars/${c.id}`} className="text-slate-900 font-medium hover:underline">{c.name}</Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusClass(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-slate-700">{c.views ?? 0}</td>
                  <td className="p-4 text-slate-700">{c.author || "—"}</td>
                  <td className="p-4 flex gap-2 flex-wrap">
                    {c.status !== "ACTIVE" && c.status !== "PUBLISHED" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-1.5" onClick={() => approve(c.id)}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t("admin.cars_page.approve_button")}
                      </Button>
                    )}
                    {c.status !== "REJECT" && c.status !== "REJECTED" && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1.5" variant="destructive" onClick={() => reject(c.id)}>
                        <XCircle className="h-3.5 w-3.5" />
                        {t("admin.cars_page.reject_button")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedCars.length === 0 && <div className="p-8 text-center text-slate-500 font-medium">{t("admin.cars_page.no_cars")}</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            {t("common.back")}
          </Button>
          <span className="text-sm font-medium text-slate-500">
            {t("admin.users_page.page")} {currentPage} {t("admin.users_page.of")} {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
