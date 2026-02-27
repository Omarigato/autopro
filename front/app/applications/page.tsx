"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, FileText, Inbox, List, Upload, X, ChevronDown, ChevronUp, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { getCachedDictionaries } from "@/lib/dictionaries";

const MAX_MESSAGE_LENGTH = 1000;

interface ApplicationItem {
  id: number;
  status: string;
  city_name?: string;
  category_name?: string;
  mark_name?: string;
  model_name?: string;
  requested_at?: string;
  message?: string;
  views_count: number;
  matching_cars_count?: number;
  matching_cars?: any[];
  images?: { url: string }[];
  applicant_contact?: { name?: string; email?: string; phone_number?: string };
  viewers?: { name: string; phone: string; date: string }[];
}

function ProfileRequestsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tabFromUrl = searchParams.get("tab") || "my";
  const [activeTab, setActiveTab] = useState(tabFromUrl === "to-my" ? "to-my" : tabFromUrl === "other" ? "other" : "my");
  const [myApps, setMyApps] = useState<ApplicationItem[]>([]);
  const [toMyAds, setToMyAds] = useState<ApplicationItem[]>([]);
  const [otherApps, setOtherApps] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    city_id: number | null;
    category_id: number | null;
    vehicle_mark_id: number | null;
    vehicle_model_id: number | null;
    requested_at: string;
    message: string;
    images: File[];
  }>({
    city_id: null,
    category_id: null,
    vehicle_mark_id: null,
    vehicle_model_id: null,
    requested_at: "",
    message: "",
    images: [],
  });
  const [expandedApps, setExpandedApps] = useState<number[]>([]);
  const [completeModal, setCompleteModal] = useState<{ app: ApplicationItem; cars: any[] } | null>(null);
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
  const [viewCarsAppId, setViewCarsAppId] = useState<number | null>(null);
  const [viewCarsList, setViewCarsList] = useState<any[]>([]);
  const [reviewData, setReviewData] = useState<Record<number, { rating: number, comment: string }>>({});

  useEffect(() => {
    setActiveTab(tabFromUrl === "to-my" ? "to-my" : tabFromUrl === "other" ? "other" : "my");
  }, [tabFromUrl]);

  useEffect(() => {
    if (!user) return;
    loadMy();
    if (user) {
      getCachedDictionaries("CATEGORY").then(setCategories);
      getCachedDictionaries("MARKA").then(setMarks);
      getCachedDictionaries("CITY").then((c) => {
        setCities(c || []);
        if ((user as any).city_id && c?.length && !formData.city_id) {
          const match = c.find((x: any) => x.id === (user as any).city_id);
          setFormData((prev) => ({ ...prev, city_id: match?.id ?? c[0]?.id ?? null }));
        } else if (c?.length && !formData.city_id) {
          setFormData((prev) => ({ ...prev, city_id: c[0]?.id ?? null }));
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (formData.vehicle_mark_id) {
      apiClient.get(`/dictionaries/model/${formData.vehicle_mark_id}`).then((res: any) => {
        setModels(Array.isArray(res) ? res : res?.data || []);
      }).catch(() => setModels([]));
    } else setModels([]);
  }, [formData.vehicle_mark_id]);

  useEffect(() => {
    if (activeTab === "to-my" && user) {
      apiClient.post("/applications/to-my-ads/mark-read").catch(() => { });
      loadToMyAds();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "other" && user) loadOther();
  }, [activeTab, user]);

  const loadMy = () => {
    apiClient.get("/applications").then((res: any) => {
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setMyApps(data);
    }).catch(() => setMyApps([]));
  };

  const loadToMyAds = () => {
    apiClient.get("/applications/to-my-ads").then((res: any) => {
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setToMyAds(data);
    }).catch(() => setToMyAds([]));
  };

  const loadOther = () => {
    apiClient.get("/applications/other").then((res: any) => {
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setOtherApps(data);
    }).catch(() => setOtherApps([]));
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city_id) {
      toast.error("Выберите город");
      return;
    }
    const fd = new FormData();
    fd.append("city_id", String(formData.city_id));
    if (formData.category_id != null) fd.append("category_id", String(formData.category_id));
    if (formData.vehicle_mark_id != null) fd.append("vehicle_mark_id", String(formData.vehicle_mark_id));
    if (formData.vehicle_model_id != null) fd.append("vehicle_model_id", String(formData.vehicle_model_id));
    if (formData.requested_at) fd.append("requested_at", formData.requested_at);
    if (formData.message) fd.append("message", formData.message);
    formData.images.forEach((f) => fd.append("images", f));
    setLoading(true);
    try {
      const res: any = await apiClient.post("/applications", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res?.data ?? res;
      toast.success(`Заявка создана. Найдено объявлений: ${data?.matching_cars_count ?? data?.matching_cars?.length ?? 0}`);
      setFormData((prev) => ({ ...prev, message: "", images: [] }));
      loadMy();
    } catch (err: any) {
      toast.error(err?.message?.ru ?? err?.message ?? "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (appId: number) => {
    try {
      await apiClient.patch(`/applications/${appId}`, { status: "REJECTED" });
      toast.success("Заявка отклонена");
      loadMy();
      loadToMyAds();
    } catch {
      toast.error("Ошибка");
    }
  };

  const openCompleteModal = async (app: ApplicationItem) => {
    try {
      const res: any = await apiClient.get(`/applications/${app.id}`);
      const data = res?.data ?? res;
      const cars = data?.matching_cars ?? [];
      setCompleteModal({ app, cars });
      setSelectedCarIds([]);
    } catch {
      toast.error("Ошибка загрузки");
    }
  };

  const handleComplete = async () => {
    if (!completeModal) return;
    if (completeModal.cars.length > 0 && selectedCarIds.length === 0) {
      toast.error("Выберите хотя бы одно объявление");
      return;
    }

    for (const carId of selectedCarIds) {
      const rev = reviewData[carId];
      if (rev) {
        const car = completeModal.cars.find(c => c.id === carId);
        if (car && car.author_id) {
          try {
            await apiClient.post("/reviews", {
              car_id: carId,
              car_owner_id: car.author_id,
              user_id: (user as any)?.id || null,
              rating: rev.rating,
              comment: rev.comment
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    try {
      await apiClient.patch(`/applications/${completeModal.app.id}`, {
        status: "COMPLETED",
        selected_car_ids: selectedCarIds,
      });
      toast.success("Заявка завершена. Спасибо за отзыв!");
      setCompleteModal(null);
      loadMy();
    } catch {
      toast.error("Ошибка");
    }
  };

  const toggleCarSelection = (carId: number) => {
    setSelectedCarIds((prev) => {
      if (prev.includes(carId)) {
        setReviewData((rd) => {
          const newRd = { ...rd };
          delete newRd[carId];
          return newRd;
        });
        return prev.filter((id) => id !== carId);
      } else {
        setReviewData((rd) => ({ ...rd, [carId]: { rating: 5, comment: "" } }));
        return [...prev, carId];
      }
    });
  };

  const openListCars = async (appId: number) => {
    try {
      const res: any = await apiClient.get(`/applications/${appId}`);
      const data = res?.data ?? res;
      setViewCarsList(data?.matching_cars ?? []);
      setViewCarsAppId(appId);
    } catch {
      toast.error("Ошибка загрузки");
    }
  };

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Войдите в аккаунт</p>
        <Button asChild><Link href="/login">Войти</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="bg-black pt-4 pb-6">
        <div className="container max-w-4xl px-4 mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> На главную
          </Link>
        </div>
      </div>

      <div className="container max-w-4xl px-4 mx-auto -mt-2">
        <h1 className="text-2xl font-bold mb-6">Заявки</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="my" className="gap-2">
              <FileText className="h-4 w-4" /> Мои заявки
            </TabsTrigger>
            <TabsTrigger value="to-my" className="gap-2">
              <Inbox className="h-4 w-4" /> К моим объявлениям
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-2">
              <List className="h-4 w-4" /> Другие заявки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Новая заявка</h2>
              <form onSubmit={handleCreateApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Город</Label>
                    <Select
                      value={formData.city_id != null ? String(formData.city_id) : ""}
                      onValueChange={(v) => setFormData((p) => ({ ...p, city_id: v ? Number(v) : null }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Город" /></SelectTrigger>
                      <SelectContent>
                        {cities.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Категория</Label>
                    <Select
                      value={formData.category_id != null ? String(formData.category_id) : ""}
                      onValueChange={(v) => setFormData((p) => ({ ...p, category_id: v ? Number(v) : null }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Любая" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Марка</Label>
                    <Select
                      value={formData.vehicle_mark_id != null ? String(formData.vehicle_mark_id) : ""}
                      onValueChange={(v) => setFormData((p) => ({ ...p, vehicle_mark_id: v ? Number(v) : null, vehicle_model_id: null }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Не выбрано" /></SelectTrigger>
                      <SelectContent>
                        {marks.map((m: any) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Модель</Label>
                    <Select
                      value={formData.vehicle_model_id != null ? String(formData.vehicle_model_id) : ""}
                      onValueChange={(v) => setFormData((p) => ({ ...p, vehicle_model_id: v ? Number(v) : null }))}
                      disabled={!formData.vehicle_mark_id}
                    >
                      <SelectTrigger><SelectValue placeholder="Не выбрано" /></SelectTrigger>
                      <SelectContent>
                        {models.map((m: any) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Дата и время</Label>
                  <Input
                    type="datetime-local"
                    value={formData.requested_at}
                    onChange={(e) => setFormData((p) => ({ ...p, requested_at: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Сообщение ({formData.message.length}/{MAX_MESSAGE_LENGTH})</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value.slice(0, MAX_MESSAGE_LENGTH) }))}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Фото</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <label className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          setFormData((p) => ({ ...p, images: [...p.images, ...files] }));
                        }}
                      />
                    </label>
                    {formData.images.map((f, i) => (
                      <div key={i} className="relative h-20 w-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                        <img src={URL.createObjectURL(f)} alt="preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-0 right-0 p-1 bg-destructive text-white rounded-bl"
                          onClick={() => setFormData((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={loading}>Отправить заявку</Button>
              </form>
            </Card>

            <div className="space-y-6">
              <h2 className="font-semibold text-xl">Список заявок</h2>
              {myApps.length === 0 ? (
                <p className="text-muted-foreground">Нет заявок</p>
              ) : (
                myApps.map((app) => {
                  const isExpanded = expandedApps.includes(app.id);
                  return (
                    <Card key={app.id} className="p-0 overflow-hidden flex flex-col shadow-sm border-slate-200">
                      <div
                        className="p-4 sm:p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setExpandedApps(prev => prev.includes(app.id) ? prev.filter(id => id !== app.id) : [...prev, app.id])}
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-black text-lg text-slate-900">{app.category_name ?? "Любая категория"} · {app.mark_name ?? "Любая марка"} {app.model_name ?? ""}</span>
                            <span className={app.status === "COMPLETED" ? "text-green-600 text-[10px] font-bold bg-green-50 px-2 py-1 rounded uppercase tracking-wider hidden sm:inline-block" : app.status === "REJECTED" ? "text-red-600 text-[10px] font-bold bg-red-50 px-2 py-1 rounded uppercase tracking-wider hidden sm:inline-block" : "text-indigo-600 text-[10px] font-bold bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider hidden sm:inline-block"}>
                              {app.status === "ACTIVE" ? "Активна" : app.status === "COMPLETED" ? "Завершена" : "Отклонена"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{app.requested_at ? new Date(app.requested_at).toLocaleString("ru") : "—"}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={app.status === "COMPLETED" ? "text-green-600 text-[10px] font-bold bg-green-50 px-2 py-1 rounded uppercase tracking-wider sm:hidden" : app.status === "REJECTED" ? "text-red-600 text-[10px] font-bold bg-red-50 px-2 py-1 rounded uppercase tracking-wider sm:hidden" : "text-indigo-600 text-[10px] font-bold bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider sm:hidden"}>
                            {app.status === "ACTIVE" ? "Активна" : app.status === "COMPLETED" ? "Завершена" : "Отклонена"}
                          </span>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="flex flex-col md:flex-row border-t border-slate-100 pb-2">
                          <div className="w-full md:w-1/2 p-6 md:border-r border-slate-100 flex flex-col">
                            {app.message && <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl mb-4">{app.message}</p>}

                            {app.images && app.images.length > 0 && (
                              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                                {app.images.map((img, i) => (
                                  <img key={i} src={img.url} alt="Заявка" className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-400 font-medium mb-4">Просмотров: {app.views_count} · Найдено авто: {app.matching_cars_count ?? 0}</p>

                            {/* View History */}
                            <div className="mb-4">
                              <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Eye className="h-4 w-4 text-slate-400" /> Кто смотрел заявку</h4>
                              {app.viewers && app.viewers.length > 0 ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                  {app.viewers.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-sm">
                                      <div>
                                        <p className="font-semibold text-slate-800">{v.name || "Без имени"}</p>
                                        <p className="text-xs text-slate-500">{v.phone || "Без телефона"}</p>
                                      </div>
                                      <span className="text-[10px] text-slate-400">{new Date(v.date).toLocaleString("ru", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">Пока никто не просматривал</p>
                              )}
                            </div>

                            {app.status === "ACTIVE" && (
                              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                                <Button className="flex-1 rounded-xl" onClick={() => openCompleteModal(app)}>Завершить</Button>
                                <Button variant="destructive" className="rounded-xl" onClick={() => handleReject(app.id)}>Отменить</Button>
                              </div>
                            )}
                          </div>

                          <div className="w-full md:w-1/2 bg-slate-50/50 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-slate-800">Список объявлений ({app.matching_cars_count ?? 0})</h3>
                              <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" disabled={app.status === 'REJECTED'} onClick={() => loadMy()}>Обновить</Button>
                            </div>
                            <div className="space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                              {app.matching_cars && app.matching_cars.length > 0 ? (
                                app.matching_cars.map((car: any) => (
                                  <Link key={car.id} href={`/cars/${car.id}`} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors shadow-sm">
                                    {car.images?.[0]?.url ? (
                                      <img src={car.images[0].url} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                    ) : (
                                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <FileText className="text-slate-300 w-6 h-6" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-800 text-sm truncate">{car.name}</p>
                                      {car.price_per_day != null && <p className="text-indigo-600 font-black text-xs mt-0.5">{car.price_per_day.toLocaleString()} ₸/сут</p>}
                                    </div>
                                  </Link>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-2xl border border-slate-100">Нет подходящих вариантов</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="to-my" className="space-y-4">
            {toMyAds.length === 0 ? (
              <p className="text-muted-foreground text-center py-10 bg-white rounded-3xl border border-slate-100">Нет заявок к вашим объявлениям</p>
            ) : (
              toMyAds.map((app) => (
                <Card key={app.id} className="p-0 overflow-hidden flex flex-col md:flex-row shadow-sm border-slate-200">
                  <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-lg text-slate-900">{app.category_name ?? "Любая категория"} · {app.mark_name ?? "Любая марка"} {app.model_name ?? ""}</span>
                        <span className={app.status === "COMPLETED" ? "text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded" : app.status === "REJECTED" ? "text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded" : "text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded"}>
                          {app.status === "ACTIVE" ? "Активна" : app.status === "COMPLETED" ? "Завершена" : "Отклонена"}
                        </span>
                      </div>
                      {app.requested_at && (
                        <p className="text-xs text-slate-500 font-medium mb-3">На дату: {new Date(app.requested_at).toLocaleString("ru")}</p>
                      )}
                      {app.message && <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl mb-4">{app.message}</p>}

                      {app.images && app.images.length > 0 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                          {app.images.map((img, i) => (
                            <img key={i} src={img.url} alt="Заявка" className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 bg-slate-50/50 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-4">Контакты клиента</h3>
                      {app.applicant_contact ? (
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
                          <p className="font-bold text-lg text-slate-900">{app.applicant_contact.name}</p>
                          {app.applicant_contact.phone_number && (
                            <a href={`tel:${app.applicant_contact.phone_number}`} className="block text-indigo-600 font-bold mt-2 text-sm">{app.applicant_contact.phone_number}</a>
                          )}
                          {app.applicant_contact.email && <p className="text-slate-500 text-sm mt-1">{app.applicant_contact.email}</p>}
                        </div>
                      ) : (
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4">
                          <p className="text-sm text-amber-800 font-bold">Купите тарифный план для просмотра контактов заявителя</p>
                          <Link href="/subscriptions">
                            <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">Тарифы</Button>
                          </Link>
                        </div>
                      )}
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Ваши авто, по которым ищет клиент:</p>
                        <div className="flex gap-2 flex-wrap">
                          {app.matching_cars?.map((c: any) => (
                            <span key={c.id} className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-slate-700">{c.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {app.status === "ACTIVE" && (
                      <div className="mt-6 text-right">
                        <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={() => handleReject(app.id)}>Скрыть заявку</Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            {otherApps.length === 0 ? (
              <p className="text-muted-foreground">Нет других заявок</p>
            ) : (
              otherApps.map((app) => (
                <Card key={app.id} className="p-4">
                  <span className="font-medium">{app.city_name} · {app.category_name ?? "—"} · {app.mark_name ?? "—"} {app.model_name ?? ""}</span>
                  {app.requested_at && <p className="text-sm text-muted-foreground">{new Date(app.requested_at).toLocaleString("ru")}</p>}
                  {app.message && <p className="text-sm mt-1">{app.message}</p>}
                  {app.images && app.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {app.images.map((img, i) => (
                        <img key={i} src={img.url} alt="Заявка" className="h-16 w-16 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {completeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">Выберите объявления (сделка состоялась)</h3>
            <div className="space-y-2 mb-4">
              {completeModal.cars.length === 0 && (
                <p className="text-muted-foreground">Нет объявлений для выбора. Вы можете просто завершить заявку.</p>
              )}
              {completeModal.cars.map((car: any) => {
                const isSelected = selectedCarIds.includes(car.id);
                const rev = reviewData[car.id];
                return (
                  <div key={car.id} className="flex flex-col gap-2 p-3 rounded-xl border hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        onChange={() => toggleCarSelection(car.id)}
                      />
                      <span className="font-bold text-slate-800 text-sm">{car.name}</span>
                      {car.price_per_day != null && <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2 py-1 rounded-md">{car.price_per_day} ₸/сут</span>}
                    </label>

                    {isSelected && rev && (
                      <div className="mt-2 pl-8 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Оцените автомобиль</p>
                          <div className="flex gap-1 border border-slate-200 w-fit p-1.5 rounded-xl bg-white">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="p-1 hover:scale-110 transition-transform"
                                onClick={() => setReviewData(prev => ({ ...prev, [car.id]: { ...prev[car.id], rating: star } }))}
                              >
                                <Star
                                  className={`w-6 h-6 ${star <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Отзыв</p>
                          <Textarea
                            placeholder="Напишите пару слов об автомобиле и владельце (необязательно)"
                            className="text-sm bg-white resize-none rounded-xl"
                            value={rev.comment}
                            onChange={(e) => setReviewData(prev => ({ ...prev, [car.id]: { ...prev[car.id], comment: e.target.value } }))}
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleComplete} disabled={completeModal.cars.length > 0 && selectedCarIds.length === 0}>Завершить</Button>
              <Button variant="outline" onClick={() => setCompleteModal(null)}>Отмена</Button>
            </div>
          </Card>
        </div>
      )}

      {viewCarsAppId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">Объявления по заявке</h3>
            <div className="space-y-2">
              {viewCarsList.map((car: any) => (
                <Link key={car.id} href={`/cars/${car.id}`} className="block p-2 rounded-lg border hover:bg-muted/50">
                  {car.name} {car.price_per_day != null && ` · ${car.price_per_day} ₸/сут`}
                </Link>
              ))}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => { setViewCarsAppId(null); setViewCarsList([]); }}>Закрыть</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ProfileRequestsPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center animate-pulse">Загрузка...</div>}>
      <ProfileRequestsContent />
    </Suspense>
  );
}
