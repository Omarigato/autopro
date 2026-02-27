"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import {
    Settings,
    Heart,
    FileText,
    History,
    Shield,
    Camera,
    Mail,
    Phone,
    User as UserIcon,
    Calendar,
    LogOut,
    ChevronRight,
    Plus,
    Star,
    Clock,
    ExternalLink,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { user, refreshUser, logout } = useAuth();
    const { subscriptionsEnabled } = usePublicSettings();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("ads");
    const [profileData, setProfileData] = useState<any>({});
    const [likes, setLikes] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [eventsPage, setEventsPage] = useState(1);
    const [hasMoreEvents, setHasMoreEvents] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [myCars, setMyCars] = useState<any[]>([]);
    const [mySubscription, setMySubscription] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadProfileData();
            loadLikes();
            loadEvents(1);
            loadMyCars();
            loadSubscription();
        }
    }, [user]);

    const loadProfileData = async () => {
        try {
            const res = await apiClient.get('/auth/me') as any;
            setProfileData(res?.data ?? res ?? {});
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const loadLikes = async () => {
        try {
            const res = await apiClient.get('/users/likes') as any;
            setLikes(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []);
        } catch (err) {
            console.error('Failed to load likes:', err);
        }
    };

    const loadEvents = async (page = 1, append = false) => {
        setLoadingEvents(true);
        try {
            const limit = 10;
            const skip = (page - 1) * limit;
            const res = await apiClient.get('/users/events', { params: { skip, limit } }) as any;
            const newEvents = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : [];

            if (newEvents.length < limit) {
                setHasMoreEvents(false);
            } else {
                setHasMoreEvents(true);
            }

            if (append) {
                setEvents((prev) => [...prev, ...newEvents]);
            } else {
                setEvents(newEvents);
            }
            setEventsPage(page);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const loadMyCars = async () => {
        try {
            const res = await apiClient.get('/cars/my') as any;
            setMyCars(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []);
        } catch (err) {
            console.error('Failed to load my cars:', err);
        }
    };

    const loadSubscription = async () => {
        try {
            const res = await apiClient.get('/subscriptions/me') as any;
            const d = res?.data ?? res;
            setMySubscription(d);
        } catch {
            setMySubscription(null);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put('/auth/me', profileData);
            toast.success('Профиль успешно обновлен');
            await refreshUser();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка обновления профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name: string, value: any) => {
        setProfileData({ ...profileData, [name]: value });
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <UserIcon className="text-slate-400 h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Личный кабинет</h2>
                <p className="text-slate-500 max-w-sm text-center">Пожалуйста, войдите в систему, чтобы управлять своими объявлениями и профилем.</p>
                <Link href="/login">
                    <Button className="rounded-full px-8 bg-slate-800 hover:bg-slate-700">Войти</Button>
                </Link>
            </div>
        );
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen">
            <div className="bg-slate-50/50 min-h-screen pb-20">
                {/* Header / Banner — чёрный фон + кнопка «Назад» + вкладки как на первой фотке */}
                <div className="bg-black pt-4 pb-8 w-full">
                    <div className="container max-w-7xl px-4 mx-auto">
                        <Link
                            href="/"
                            className="-ml-1 sm:-ml-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                            На главную
                        </Link>
                    </div>
                    {/* Панель вкладок на тёмном фоне (как на первой фотке) */}
                    <div className="container max-w-7xl px-4 mx-auto mt-6 flex justify-end">
                        <TabsList className="flex items-center justify-start w-full h-auto p-1.5 bg-white/10 rounded-[2rem] border border-white/10 overflow-x-auto no-scrollbar gap-1 max-w-2xl ml-4">
                            <TabsTrigger value="ads" className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-black transition-all duration-300 text-white/80 hover:text-white text-sm sm:text-base">
                                <FileText size={18} className="shrink-0" />
                                <span className="whitespace-nowrap">Объявления</span>
                            </TabsTrigger>
                            <TabsTrigger value="favorites" className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-black transition-all duration-300 text-white/80 hover:text-white text-sm sm:text-base">
                                <Heart size={18} className="shrink-0" />
                                <span className="whitespace-nowrap">Избранное</span>
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-black transition-all duration-300 text-white/80 hover:text-white text-sm sm:text-base">
                                <History size={18} className="shrink-0" />
                                <span className="whitespace-nowrap">История</span>
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-black transition-all duration-300 text-white/80 hover:text-white text-sm sm:text-base">
                                <Settings size={18} className="shrink-0" />
                                <span className="whitespace-nowrap">Настройки</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="container max-w-7xl -mt-8 px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Sidebar - Interactive Profile Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white p-0">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <label className="relative group cursor-pointer">
                                        <div className="relative">
                                            <Avatar className="w-32 h-32 border-4 border-white shadow-xl ring-2 ring-slate-200 transition-all duration-300 group-hover:ring-slate-400">
                                                <AvatarImage src={profileData.avatar_url} alt={profileData.first_name} />
                                                <AvatarFallback className="text-3xl bg-slate-100 text-slate-700">
                                                    {profileData.name?.split(' ')?.[1]?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Camera className="text-white h-8 w-8" />
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const promise = (async () => {
                                                    const fd = new FormData();
                                                    fd.append('file', file);
                                                    await apiClient.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                    loadProfileData();
                                                    refreshUser();
                                                })();
                                                toast.promise(promise, {
                                                    loading: 'Загрузка...',
                                                    success: 'Фото профиля обновлено!',
                                                    error: 'Ошибка загрузки'
                                                });
                                            }}
                                        />
                                    </label>

                                    <div className="mt-6">
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                            {profileData.name}
                                        </h3>
                                        <p className="text-slate-700 font-medium text-sm mt-1 uppercase tracking-wider">
                                            {user.role === 'admin' ? 'Администратор' : 'Частное лицо'}
                                        </p>
                                    </div>

                                    {/* Subscription Status Area — показываем только если подписки включены в настройках */}
                                    {subscriptionsEnabled && (
                                        <div className="w-full mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className={cn("h-5 w-5", mySubscription?.plan_name ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Текущий план</span>
                                            </div>

                                            {mySubscription?.plan_name ? (
                                                <div className="text-center">
                                                    <p className="text-xl font-black text-slate-900 leading-tight">{mySubscription.plan_name}</p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                                        {mySubscription.valid_until ? `Активен до ${new Date(mySubscription.valid_until).toLocaleDateString('ru-RU')}` : 'Бессрочно'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center w-full">
                                                    <p className="text-slate-600 font-medium mb-4">Подписка не оформлена</p>
                                                    <Link href="/add" className="w-full block">
                                                        <Button className="w-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm font-bold">
                                                            Выбрать тариф
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Contact Info Section */}
                                <div className="px-8 pb-8 space-y-5">
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Электронная почта</span>
                                            <span className="text-sm font-medium text-slate-700">{profileData.email || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Номер телефона</span>
                                            <span className="text-sm font-medium text-slate-700">{profileData.phone_number || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
                                            <UserIcon size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Пол</span>
                                            <span className="text-sm font-medium text-slate-700">
                                                {profileData.gender === 'male' ? 'Мужской' : profileData.gender === 'female' ? 'Женский' : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Дата рождения</span>
                                            <span className="text-sm font-medium text-slate-700">
                                                {profileData.date_birth ? new Date(profileData.date_birth).toLocaleDateString('ru-RU') : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-8 pb-8 space-y-3">
                                    {user.role === 'admin' && (
                                        <Link href="/admin-supersecret" className="block">
                                            <Button variant="outline" className="w-full h-12 gap-2 border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold">
                                                <Shield size={18} />
                                                Админ-панель
                                            </Button>
                                        </Link>
                                    )}
                                    <Button
                                        onClick={() => logout()}
                                        variant="ghost"
                                        className="w-full h-12 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold"
                                    >
                                        <LogOut size={18} />
                                        Выйти из профиля
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Right Main Content Area — контент вкладок (кнопки уже в чёрной зоне сверху) */}
                        <div className="lg:col-span-8 w-full space-y-6">
                            {/* Section Content with Animation */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Мои объявления */}
                                <TabsContent value="ads" className="mt-0 space-y-6">
                                    <div className="flex items-center justify-between pt-6 sm:pt-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Мои объявления</h2>
                                        <Link href="/add">
                                            <Button className="rounded-full bg-slate-800 hover:bg-slate-700 shadow-slate-200 shadow-lg px-6 h-11 font-bold">
                                                <Plus className="h-5 w-5 mr-2" />
                                                Создать
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myCars.length === 0 ? (
                                            <div className="col-span-1 md:col-span-2 py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="text-slate-300 h-8 w-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-lg">У вас пока нет объявлений</p>
                                                <p className="text-slate-400 text-sm mt-1 max-w-xs">Разместите свой автомобиль сегодня, чтобы начать получать предложения!</p>
                                            </div>
                                        ) : (
                                            myCars.map((car: any) => (
                                                <Card key={car.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-md hover:shadow-xl transition-all duration-500 bg-white">
                                                    <div className="relative h-48 bg-slate-100">
                                                        {car.images?.[0]?.url ? (
                                                            <img
                                                                src={car.images[0].url}
                                                                alt={car.name}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <FileText size={48} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg",
                                                                car.status === "PUBLISHED" ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                                                            )}>
                                                                {car.status === "PUBLISHED" ? "Активно" : "Модерация"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Clock size={12} className="text-slate-400" />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                                    {car.create_date ? new Date(car.create_date).toLocaleDateString('ru-RU') : ''}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-black text-xl text-slate-900 group-hover:text-slate-700 transition-colors">{car.name}</h3>
                                                            <p className="text-slate-900 font-black text-lg mt-1">{car.price_per_day} ₸ <span className="text-sm font-medium text-slate-400">/ день</span></p>
                                                        </div>

                                                        <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                                    <History size={14} />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-500">{car.views_count ?? 0} просм.</span>
                                                            </div>
                                                            <Link href={`/cars/${car.id}`}>
                                                                <Button size="sm" variant="ghost" className="rounded-full gap-1 group/btn font-bold text-slate-700 hover:bg-slate-100">
                                                                    Перейти <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Избранное */}
                                <TabsContent value="favorites" className="mt-0 space-y-6">
                                    <div className="pt-6 sm:pt-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Избранное</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {likes.length === 0 ? (
                                            <div className="col-span-1 md:col-span-2 py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                                    <Heart className="text-red-200 h-8 w-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-lg">Список пуст</p>
                                                <p className="text-slate-400 text-sm mt-1">Добавляйте зацепившие вас модели в избранное, чтобы не потерять!</p>
                                            </div>
                                        ) : (
                                            likes.map((like) => (
                                                <Card key={like.id} className="p-4 flex gap-4 items-center bg-white border-none shadow-md rounded-[2rem] group hover:shadow-xl transition-all h-28">
                                                    <div className="flex-shrink-0 w-28 h-20 bg-slate-100 rounded-2xl overflow-hidden group-hover:scale-95 transition-transform">
                                                        {like.car_image ? (
                                                            <img src={like.car_image} alt={like.car_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><Heart /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h3 className="font-bold text-slate-900 truncate">{like.car_name}</h3>
                                                        <p className="text-slate-900 font-black text-sm">{like.car_price} ₸/день</p>
                                                    </div>
                                                    <Link href={`/cars/${like.car_id}`}>
                                                        <Button variant="ghost" size="icon" className="rounded-2xl text-slate-300 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                                            <ExternalLink size={20} />
                                                        </Button>
                                                    </Link>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>

                                {/* История просмотров */}
                                <TabsContent value="history" className="mt-0 space-y-6">
                                    <div className="pt-6 sm:pt-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">История</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {events.length === 0 ? (
                                            <div className="py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <History className="text-slate-200 h-8 w-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-lg">История пуста</p>
                                            </div>
                                        ) : (
                                            events.map((event) => (
                                                <Card key={event.id} className={cn(
                                                    "p-5 flex items-center justify-between bg-white border-none shadow-md rounded-3xl group hover:shadow-lg transition-all",
                                                    event.car_deleted && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                                )}>
                                                    <div className="flex items-center gap-5">
                                                        <div className="hidden sm:flex w-12 h-12 rounded-full bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                                                {event.created_at ? new Date(event.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long' }) : ''}
                                                            </p>
                                                            {event.car_deleted ? (
                                                                <h4 className="font-bold text-slate-400">{event.car_name || 'Объявление удалено'}</h4>
                                                            ) : (
                                                                <Link href={`/cars/${event.car_id}`} className="font-bold text-slate-900 hover:text-slate-700 transition-colors flex items-center gap-2">
                                                                    {event.car_name || 'Просмотр объявления'}
                                                                    <ChevronRight size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900">
                                                            {event.car_price ? `${event.car_price} ₸` : '-'}
                                                        </p>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">в день</span>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                    {events.length > 0 && hasMoreEvents && (
                                        <div className="flex justify-center mt-6">
                                            <Button
                                                variant="outline"
                                                className="rounded-full px-8 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                                onClick={() => loadEvents(eventsPage + 1, true)}
                                                disabled={loadingEvents}
                                            >
                                                {loadingEvents ? "Загрузка..." : "Показать еще"}
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Настройки */}
                                <TabsContent value="settings" className="mt-0">
                                    <div className="pt-6 sm:pt-8">
                                        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Настройки</h2>
                                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Как вас зовут?</Label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Имя и фамилия"
                                                            value={profileData.name || ''}
                                                            onChange={(e) => handleChange('name', e.target.value)}
                                                            className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-indigo-600 font-medium"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Контактный Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={profileData.email || ''}
                                                        onChange={(e) => handleChange('email', e.target.value)}
                                                        className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-slate-400 font-medium"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Номер телефона</Label>
                                                    <Input
                                                        value={profileData.phone_number || ''}
                                                        onChange={(e) => handleChange('phone_number', e.target.value)}
                                                        className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-slate-400 font-medium"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Личные данные</Label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <Select
                                                            value={profileData.gender || ''}
                                                            onValueChange={(val: string) => handleChange('gender', val)}
                                                        >
                                                            <SelectTrigger className="rounded-2xl h-14 bg-slate-50 border-none font-medium">
                                                                <SelectValue placeholder="Ваш пол" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                                                <SelectItem value="male">Мужской</SelectItem>
                                                                <SelectItem value="female">Женский</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            type="date"
                                                            value={profileData.date_birth ? profileData.date_birth.split('T')[0] : ''}
                                                            onChange={(e) => handleChange('date_birth', e.target.value)}
                                                            className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-slate-400 font-medium pr-4"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                                                    <h3 className="text-xl font-bold tracking-tight mb-6">Уведомления</h3>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                                                            <div className="space-y-0.5 max-w-[80%]">
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="w-5 h-5 text-slate-500" />
                                                                    <Label className="text-base font-bold text-slate-800">Email-уведомления</Label>
                                                                </div>
                                                                <p className="text-sm text-slate-500 font-medium ml-7">
                                                                    Отправлять уведомления по вашим объявлениям на почту
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={!!profileData.notify_by_email}
                                                                disabled={!profileData.email}
                                                                onCheckedChange={(val: boolean) => handleChange('notify_by_email', val)}
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                                                            <div className="space-y-0.5 max-w-[80%]">
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="w-5 h-5 text-slate-500" />
                                                                    <Label className="text-base font-bold text-slate-800">WhatsApp-уведомления</Label>
                                                                </div>
                                                                <p className="text-sm text-slate-500 font-medium ml-7">
                                                                    Отправлять уведомления напрямую в WhatsApp
                                                                    {subscriptionsEnabled && !mySubscription?.plan_name && (
                                                                        <span className="block text-amber-500 text-xs mt-1">Доступно по подписке</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={!!profileData.notify_by_whatsapp}
                                                                onCheckedChange={(val: boolean) => handleChange('notify_by_whatsapp', val)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 pt-4">
                                                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lg font-black shadow-lg shadow-slate-200">
                                                        {loading ? 'Обновляем данные...' : 'Сохранить изменения'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Tabs>
    );
}
