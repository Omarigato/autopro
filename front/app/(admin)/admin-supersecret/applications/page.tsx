"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";


export default function AdminApplicationsPage() {
    const { t, lang } = useTranslation();
    const [applications, setApplications] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const loadApps = () => {
        setLoading(true);
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        apiClient.get("/admin/applications", { params: { skip, limit: ITEMS_PER_PAGE, q: searchQuery } })
            .then((res: any) => {
                const d = res?.data ?? res;
                if (d?.items) {
                    setApplications(d.items);
                    setTotalPages(Math.ceil(d.total / ITEMS_PER_PAGE) || 1);
                } else if (Array.isArray(d)) {
                    setApplications(d);
                    setTotalPages(Math.ceil(d.length / ITEMS_PER_PAGE) || 1);
                } else {
                    setApplications([]);
                    setTotalPages(1);
                }
            })
            .catch(() => setApplications([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadApps();
    }, [currentPage]);

    const handleDelete = async (id: number) => {
        if (!confirm(t("admin.applications_page.delete_confirm"))) return;
        try {
            await apiClient.delete(`/admin/applications/${id}`);
            toast.success(t("admin.applications_page.deleted_success"));
            loadApps();
        } catch {
            toast.error(t("admin.applications_page.delete_error"));
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await apiClient.patch(`/admin/applications/${id}`, { status: newStatus });
            toast.success(t("admin.applications_page.status_updated"));
            loadApps();
        } catch {
            toast.error(t("admin.applications_page.status_update_error"));
        }
    };

    const paginatedApps = applications;

    if (loading) return <div className="text-slate-500">{t("admin.loading")}</div>;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{t("admin.applications_page.title")}</h2>
                    <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">{t("admin.applications_page.subtitle")}</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder={t("admin.applications_page.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-11 pr-4 h-11 w-full sm:w-72 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-slate-400 font-medium text-base"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedApps.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="text-slate-400 mb-4">
                            <Search className="w-12 h-12 opacity-20" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">{t("admin.applications_page.no_apps")}</p>
                    </div>
                ) : (
                    paginatedApps.map((app) => (
                        <div key={app.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight text-slate-900">{app.user}</h3>
                                        <p className="text-xs text-slate-400">{app.user_email}</p>
                                    </div>
                                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">#{app.id}</span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-medium text-slate-600 line-clamp-3">
                                        {app.message || t("admin.applications_page.no_message")}
                                    </p>
                                </div>

                                {app.images && app.images.length > 0 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                                        {app.images.map((img: any, i: number) => (
                                            <img key={i} src={img.url} alt="Заявка" className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 text-sm mb-6">
                                    <div>
                                        <span className="block text-xs text-slate-400">{t("admin.applications_page.date_label")}</span>
                                        <span className="font-semibold text-slate-700">
                                            {app.create_date ? new Date(app.create_date).toLocaleDateString(lang === "kk" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU") : "—"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-400">{t("admin.applications_page.views_label")}</span>
                                        <span className="font-semibold text-slate-700">{app.views_count || 0}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-400">{t("admin.applications_page.matches_label")}</span>
                                        <span className="font-semibold text-slate-700">{app.matching_cars_count || 0}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-400">{t("admin.applications_page.status_label")}</span>
                                        <span className="font-semibold text-indigo-600">
                                            {app.status === "ACTIVE" ? t("admin.applications_page.status_active") :
                                                app.status === "COMPLETED" ? t("admin.applications_page.status_completed") :
                                                    app.status === "REJECTED" ? t("admin.applications_page.status_rejected") : app.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <Select value={app.status || "ACTIVE"} onValueChange={(val) => handleStatusChange(app.id, val)}>
                                    <SelectTrigger className="flex-1 rounded-xl bg-slate-50 border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">{t("admin.applications_page.status_active")}</SelectItem>
                                        <SelectItem value="COMPLETED">{t("admin.applications_page.status_completed")}</SelectItem>
                                        <SelectItem value="REJECTED">{t("admin.applications_page.status_rejected")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
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
