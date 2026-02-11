"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/lib/translations";
import {
  Users,
  Car,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  RefreshCcw,
  TrendingUp,
  Eye,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Search,
  ArrowUpRight,
  UserCheck,
  UserX,
  Settings
} from "lucide-react";

type TabMode = "stats" | "clients" | "owners" | "cars" | "apps" | "admins";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("stats");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState("ru");
  const t = useTranslation(lang);

  useEffect(() => {
    setLang(window.localStorage.getItem("lang") || "ru");
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "/admin/stats";
      if (activeTab === "clients") endpoint = "/admin/users?role=client";
      if (activeTab === "owners") endpoint = "/admin/users?role=owner";
      if (activeTab === "admins") endpoint = "/admin/users?role=admin";
      if (activeTab === "cars") endpoint = "/admin/cars";
      if (activeTab === "apps") endpoint = "/admin/applications";

      const res: any = await apiClient.get(endpoint);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post("/admin/sync/car-data");
      // Add a slight delay for better UX
      setTimeout(() => setSyncing(false), 2000);
    } catch (err) {
      setSyncing(false);
      alert("Ошибка синхронизации");
    }
  };

  const toggleCar = async (id: number) => {
    try {
      await apiClient.post(`/admin/cars/${id}/toggle-active`);
      fetchData();
    } catch (err) { alert("Ошибка изменения статуса"); }
  }

  const PageHeader = ({ title, description, showSync = false }: { title: string, description: string, showSync?: boolean }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-primary">{title}</h2>
        <p className="text-slate-400 font-medium">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {activeTab !== "stats" && (
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={16} />
            <input
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all w-64"
            />
          </div>
        )}
        {showSync && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary !py-2.5 !px-5 !rounded-2xl flex items-center gap-2 text-xs"
          >
            <RefreshCcw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Обновляем..." : "Синхронизировать"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-10">

        {/* Dashboard Title */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Control Center</h1>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Administrator Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-6 py-2.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-accent hover:border-accent transition-all flex items-center gap-2 shadow-sm"
            >
              <Eye size={14} /> {t('go_to_site')}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('system_online')}</span>
            </div>
          </div>
        </div>

        {/* Improved Tab Navigation */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: "stats", label: "Инсайт", icon: BarChart3, color: "hover:bg-blue-50 hover:text-blue-600" },
            { id: "clients", label: "Клиенты", icon: Users, color: "hover:bg-indigo-50 hover:text-indigo-600" },
            { id: "owners", label: "Владельцы", icon: UserCheck, color: "hover:bg-emerald-50 hover:text-emerald-600" },
            { id: "cars", label: "Автопарк", icon: Car, color: "hover:bg-amber-50 hover:text-amber-600" },
            { id: "apps", label: "Заявки", icon: ClipboardList, color: "hover:bg-cyan-50 hover:text-cyan-600" },
            { id: "admins", label: "Команда", icon: ShieldCheck, color: "hover:bg-slate-100 hover:text-slate-900" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabMode)}
              className={`group flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id
                  ? "bg-white text-primary shadow-xl shadow-primary/5 border border-slate-100"
                  : `text-slate-400 border border-transparent ${tab.color}`
                }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? "text-accent" : ""} />
              <span className="tracking-tight">{tab.label}</span>
              {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-4 bg-white rounded-[3rem] border border-slate-100 shadow-premium">
              <div className="w-12 h-12 border-4 border-slate-50 border-t-accent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">Получаем данные с сервера...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-8 md:p-12 min-h-[600px]">

              {/* STATS VIEW */}
              {activeTab === "stats" && data && (
                <div className="space-y-12">
                  <PageHeader title="Общая аналитика" description="Обзор ключевых показателей платформы за все время" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-accent/10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-accent/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <Users size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-success text-xs font-bold">
                          <TrendingUp size={14} /> +12%
                        </div>
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Пользователей</p>
                      <p className="text-5xl font-black text-primary tracking-tighter">{data.totals?.users || 0}</p>
                    </div>

                    <div className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-accent/10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-accent/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <Car size={24} />
                        </div>
                        <div className="px-2 py-1 bg-amber-50 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Live
                        </div>
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Автомобилей</p>
                      <p className="text-5xl font-black text-primary tracking-tighter">{data.totals?.cars || 0}</p>
                    </div>

                    <div className="group p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-accent/10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-accent/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <ClipboardList size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-success text-xs font-bold">
                          <TrendingUp size={14} /> +24%
                        </div>
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Активных заявок</p>
                      <p className="text-5xl font-black text-primary tracking-tighter">{data.totals?.applications || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pt-4">
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-accent rounded-full" /> Популярные авто
                        </h3>
                        <button className="text-xs font-bold text-accent hover:underline">Детально</button>
                      </div>
                      <div className="space-y-4">
                        {data.most_viewed?.map((c: any) => (
                          <div key={c.id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden">
                                {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <Car size={20} />}
                              </div>
                              <div>
                                <p className="font-bold text-primary tracking-tight">{c.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID #{c.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-sm font-black text-primary">{c.views}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase">Просмотров</p>
                              </div>
                              <div className="p-2 text-slate-200 group-hover:text-accent transition-colors">
                                <ArrowUpRight size={18} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                          <div className="w-1.5 h-8 bg-emerald-500 rounded-full" /> Лидеры конверсии
                        </h3>
                        <button className="text-xs font-bold text-accent hover:underline">Экспорт</button>
                      </div>
                      <div className="space-y-4">
                        {data.most_applied?.map((c: any) => (
                          <div key={c.id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                <ClipboardList size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-primary tracking-tight">{c.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target ID #{c.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">
                              {c.applications} <span className="text-[10px] opacity-60">ЗАЯВОК</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* LIST VIEWS (Users/Admins) */}
              {(activeTab === "clients" || activeTab === "owners" || activeTab === "admins") && data && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <PageHeader
                    title={activeTab === "clients" ? "База клиентов" : activeTab === "owners" ? "Арендодатели" : "Администраторы"}
                    description={`Управление списком ${activeTab === "admins" ? "команды проекта" : "пользователей платформы"}`}
                  />

                  <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Профиль</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Контакты</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Роль</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Регистрация</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Статус</th>
                          <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="py-5 px-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-primary tracking-tight">{u.name}</p>
                                  <p className="text-[10px] font-medium text-slate-300">USER-ID: {u.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              <p className="text-sm font-bold text-slate-600 tracking-tight">{u.phone_number || "-"}</p>
                              <p className="text-[11px] text-slate-400">{u.email || "no-email"}</p>
                            </td>
                            <td className="py-5 px-4">
                              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 border border-slate-200/50">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <span className="text-xs font-bold text-slate-400 uppercase">12.03.2023</span>
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${u.is_active ? "bg-success shadow-lg shadow-success/20" : "bg-danger shadow-lg shadow-danger/20"}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${u.is_active ? "text-success" : "text-danger"}`}>
                                  {u.is_active ? "Активен" : "Бан"}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-8 text-right">
                              <button className="p-2 text-slate-300 hover:text-primary transition-colors hover:bg-white rounded-xl">
                                <Settings size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CARS MANAGEMENT */}
              {activeTab === "cars" && data && (
                <div className="space-y-8">
                  <PageHeader
                    title="Управление автопарком"
                    description="Публикация, модерация и синхронизация характеристик с NHTSA"
                    showSync={true}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {data.map((c: any) => (
                      <div key={c.id} className="group flex flex-col p-8 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-accent/10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-accent/5">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <h4 className="font-black text-primary text-xl leading-tight tracking-tight">{c.name}</h4>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{c.author || "Аноним"}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[9px] tracking-widest border
                              ${c.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                            {c.is_active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {c.is_active ? "LIVE" : "DRAFT"}
                          </div>
                        </div>

                        <div className="aspect-video relative rounded-3xl bg-white border border-slate-100 mb-8 overflow-hidden">
                          {c.image ? (
                            <img src={c.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                              <Car size={48} strokeWidth={1} />
                            </div>
                          )}
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                          <button
                            onClick={() => toggleCar(c.id)}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                               ${c.is_active
                                ? "bg-danger/10 text-danger hover:bg-danger hover:text-white"
                                : "bg-primary text-white hover:bg-accent"}`}
                          >
                            {c.is_active ? "Снять с публикации" : "Активировать"}
                          </button>
                          <button className="bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all">
                            Изменить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APPLICATIONS VIEW */}
              {activeTab === "apps" && data && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <PageHeader title="Заявки на бронирование" description="Список всех активных запросов на аренду транспорта" />

                  <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Asset</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Logged</th>
                          <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account</th>
                          <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.map((a: any) => (
                          <tr key={a.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="py-6 px-8 font-black text-primary">#{a.id}</td>
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400">
                                  <Car size={14} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">CAR-ID: {a.car_id}</span>
                              </div>
                            </td>
                            <td className="py-6 px-4 text-xs font-bold text-slate-400">
                              {new Date(a.create_date).toLocaleString()}
                            </td>
                            <td className="py-6 px-4">
                              <span className="text-xs font-bold text-accent">USER-#{a.user_id || "774"}</span>
                            </td>
                            <td className="py-6 px-8 text-right">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Processed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

