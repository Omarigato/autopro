"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { BarChart3, Users, FileText, Send, Star, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";


type Stats = {
  totals?: { users: number; cars: number; applications: number; reviews: number };
  cars_by_status?: Record<string, number>;
  applications_by_status?: Record<string, number>;
  reviews_avg_rating?: number;
  reviews_by_rating?: Record<string, number>;
  applications_per_day?: { date: string; count: number; label: string }[];
  cars_per_day?: { date: string; count: number; label: string }[];
  most_viewed?: { id: number; name: string; views: number }[];
  recent_reviews?: { id: number; car_id: number; rating: number; comment: string; create_date: string | null }[];
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "admin.status.ACTIVE",
  AWAIT: "admin.status.AWAIT",
  REJECT: "admin.status.REJECT",
  REJECTED: "admin.status.REJECTED",
  DRAFT: "admin.status.DRAFT",
  COMPLETED: "admin.status.COMPLETED"
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();


  useEffect(() => {
    apiClient
      .get("/admin/stats")
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d) setStats(d);
      })
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
        <p className="mt-4 text-slate-500 font-medium">{t("admin.loading")}</p>
      </div>
    );
  }

  const totals = stats.totals || { users: 0, cars: 0, applications: 0, reviews: 0 };
  const appsPerDay = stats.applications_per_day || [];
  const carsPerDay = stats.cars_per_day || [];
  const maxApps = Math.max(1, ...appsPerDay.map((d) => d.count));
  const maxCars = Math.max(1, ...carsPerDay.map((d) => d.count));
  const carsByStatus = stats.cars_by_status || {};
  const appsByStatus = stats.applications_by_status || {};
  const totalCarsStatus = Object.values(carsByStatus).reduce((a, b) => a + b, 0) || 1;
  const totalAppsStatus = Object.values(appsByStatus).reduce((a, b) => a + b, 0) || 1;
  const avgRating = stats.reviews_avg_rating ?? 0;
  const reviewsByRating = stats.reviews_by_rating || {};
  const totalReviewsRating = Object.values(reviewsByRating).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          {t("admin.overview")}
        </h2>
        <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">
          {t("admin.overview_desc")}
        </p>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 font-medium text-sm">{t("admin.users")}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{totals.users}</p>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 font-medium text-sm">{t("admin.cars")}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{totals.cars}</p>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Send className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 font-medium text-sm">{t("admin.applications")}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{totals.applications}</p>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Star className="h-6 w-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 font-medium text-sm">{t("admin.reviews")}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{totals.reviews}</p>
          </div>
        </div>
      </div>

      {/* Графики: заявки и объявления за 14 дней */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            <h3 className="font-bold text-slate-900">{t("admin.apps_14_days")}</h3>
          </div>
          <div className="flex items-end gap-1 h-40">
            {appsPerDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-emerald-500 min-h-[4px] transition-all"
                  style={{ height: `${(d.count / maxApps) * 100}%` }}
                  title={`${d.label}: ${d.count}`}
                />
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate w-full text-center">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            <h3 className="font-bold text-slate-900">{t("admin.cars_14_days")}</h3>
          </div>
          <div className="flex items-end gap-1 h-40">
            {carsPerDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-blue-500 min-h-[4px] transition-all"
                  style={{ height: `${(d.count / maxCars) * 100}%` }}
                  title={`${d.label}: ${d.count}`}
                />
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate w-full text-center">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Объявления и заявки по статусам */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">{t("admin.cars_by_status")}</h3>
          <div className="space-y-3">
            {Object.entries(carsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-32 shrink-0">
                  {STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-slate-600 rounded-lg transition-all"
                    style={{ width: `${(count / totalCarsStatus) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-10 text-right">{count}</span>
              </div>
            ))}
            {Object.keys(carsByStatus).length === 0 && (
              <p className="text-slate-400 text-sm">{t("admin.no_data")}</p>
            )}
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">{t("admin.apps_by_status")}</h3>
          <div className="space-y-3">
            {Object.entries(appsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-32 shrink-0">
                  {STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-lg transition-all"
                    style={{ width: `${(count / totalAppsStatus) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-10 text-right">{count}</span>
              </div>
            ))}
            {Object.keys(appsByStatus).length === 0 && (
              <p className="text-slate-400 text-sm">{t("admin.no_data")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Рейтинг и отзывы */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">{t("admin.rating_and_reviews")}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-slate-900">{avgRating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${i <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {[5, 4, 3, 2, 1].map((r) => {
                const n = reviewsByRating[String(r)] || 0;
                const pct = totalReviewsRating ? (n / totalReviewsRating) * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 w-4">{r}</span>
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-8">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">{t("admin.recent_reviews")}</h3>
          <ul className="space-y-3">
            {(stats.recent_reviews || []).map((r) => (
              <li key={r.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 line-clamp-2">{r.comment || "—"}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("admin.car")} #{r.car_id}
                    {r.create_date && ` · ${new Date(r.create_date).toLocaleDateString("ru")}`}
                  </p>
                </div>
              </li>
            ))}
            {(!stats.recent_reviews || stats.recent_reviews.length === 0) && (
              <li className="text-slate-400 text-sm py-4">{t("admin.no_reviews")}</li>
            )}
          </ul>
        </div>
      </div>

      {/* Популярные по просмотрам */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-slate-600" />
            <h3 className="font-bold text-slate-900">{t("admin.most_viewed")}</h3>
          </div>
          <Link
            href="/admin-supersecret/cars"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            {t("admin.all_cars")}
          </Link>
        </div>
        <ul className="space-y-2">
          {(stats.most_viewed || []).slice(0, 10).map((c) => (
            <li key={c.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="font-medium text-slate-900 truncate pr-2">{c.name}</span>
              <span className="text-slate-500 text-sm shrink-0">{c.views} {t("admin.views")}</span>
            </li>
          ))}
          {(!stats.most_viewed || stats.most_viewed.length === 0) && (
            <li className="text-slate-400 text-sm py-4">{t("admin.no_data")}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
