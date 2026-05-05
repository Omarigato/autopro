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
import { useRouter } from "next/navigation";
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
    ChevronDown,
    Plus,
    Star,
    Clock,
    ExternalLink,
    ArrowLeft,
    CreditCard
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Форматирование номера телефона: +7 (XXX) XXX-XX-XX */
function formatPhoneDisplay(value: string | null | undefined): string {
    if (!value || typeof value !== "string") return "—";
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 10) {
        const a = digits.length >= 11 ? digits.slice(-10) : digits;
        return `+7 (${a.slice(0, 3)}) ${a.slice(3, 6)}-${a.slice(6, 8)}-${a.slice(8, 10)}`;
    }
    return value;
}

export default function ProfilePage() {
    const { user, refreshUser, logout } = useAuth();
    const router = useRouter();
    const { subscriptionsEnabled } = usePublicSettings();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("ads");
    const [profileData, setProfileData] = useState<any>({});
    const [initialProfileData, setInitialProfileData] = useState<any>({});
    const [likes, setLikes] = useState<any[]>([]);
    const [showOtp, setShowOtp] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [events, setEvents] = useState<any[]>([]);
    const [eventsPage, setEventsPage] = useState(1);
    const [hasMoreEvents, setHasMoreEvents] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [myCars, setMyCars] = useState<any[]>([]);
    const [mySubscription, setMySubscription] = useState<any>(null);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadProfileData();
            loadLikes();
            loadEvents(1);
            loadMyCars();
            loadSubscription();
            loadPaymentHistory();
        }
    }, [user]);

    const loadProfileData = async () => {
        try {
            const res = await apiClient.get('/auth/me') as any;
            const data = res?.data ?? res ?? {};
            setProfileData(data);
            setInitialProfileData(data);
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

    const loadPaymentHistory = async () => {
        try {
            const res = await apiClient.get('/subscriptions/payments/history') as any;
            setPaymentHistory(res?.data ?? res ?? []);
        } catch {
            setPaymentHistory([]);
        }
    };

    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(initialProfileData);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) return;

        const contactChanged = profileData.phone_number !== initialProfileData.phone_number || profileData.email !== initialProfileData.email;
        if (contactChanged && !showOtp) {
            setLoading(true);
            try {
                const target = profileData.phone_number !== initialProfileData.phone_number ? profileData.phone_number : profileData.email;
                await apiClient.post('/auth/otp/request', { target, type: 'update' });
                setShowOtp(true);
                toast.success('Код подтверждения отправлен на новый контакт');
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Ошибка отправки кода');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (showOtp && !otpCode) {
            toast.error('Введите код подтверждения');
            return;
        }

        setLoading(true);
        try {
            if (showOtp && otpCode) {
                const target = profileData.phone_number !== initialProfileData.phone_number ? profileData.phone_number : profileData.email;
                await apiClient.post('/auth/otp/verify', { target, otp_code: otpCode });
            }

            await apiClient.put('/auth/me', profileData);
            toast.success('Профиль успешно обновлен');
            await refreshUser();
            setInitialProfileData({ ...profileData });
            setShowOtp(false);
            setOtpCode("");
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
                {/* Шапка: только кнопка «На главную» */}
                <div className="bg-black pt-4 pb-6 sm:pb-8 w-full">
                    <div className="container max-w-7xl px-4 mx-auto">
                        <Link
                            href="/"
                            className="-ml-1 sm:-ml-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                            На главную
                        </Link>
                    </div>
                </div>

                <div className="container max-w-7xl px-4 mx-auto">
                    {/* Блок пользователя: только аватар, имя и дропдаун (телефон + выйти) */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 pb-4">
                        <div className="flex items-center gap-4">
                            <label className="relative group cursor-pointer flex-shrink-0">
                                <div className="relative">
                                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-white shadow-lg ring-2 ring-slate-200 transition-all duration-300 group-hover:ring-slate-400">
                                        <AvatarImage src={profileData.avatar_url} alt={profileData.first_name} />
                                        <AvatarFallback className="text-xl sm:text-2xl bg-slate-100 text-slate-700">
                                            {profileData.name?.split(' ')?.[0]?.[0]}
                                            {profileData.name?.split(' ')?.[1]?.[0] ?? ''}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Camera className="text-white h-6 w-6 sm:h-8 sm:w-8" />
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
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                                    {profileData.name}
                                </h3>
                                {user.role === 'admin' && (
                                    <p className="text-slate-600 font-medium text-xs sm:text-sm uppercase tracking-wider">
                                        Администратор
                                    </p>
                                )}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-2xl h-11 sm:h-12 px-4 sm:px-5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold gap-2 shadow-sm"
                                >
                                    Мой аккаунт
                                    <ChevronDown className="h-4 w-4 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 shadow-xl p-1">
                                <div className="px-3 py-2.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Телефон</p>
                                    <p className="text-sm font-medium text-slate-800 font-mono">{formatPhoneDisplay(profileData.phone_number)}</p>
                                </div>
                                <div className="px-3 py-2.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Почта</p>
                                    <p className="text-sm font-medium text-slate-800 font-mono">{profileData.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                {user.role === 'admin' && (
                                    <>
                                        <div
                                            role="menuitem"
                                            className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground rounded-md hover:bg-slate-100 [&>svg]:size-4 [&>svg]:shrink-0"
                                            onClick={() => router.push("/admin-supersecret")}
                                        >
                                            <Shield size={16} />
                                            Админ-панель
                                        </div>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <div
                                    role="menuitem"
                                    className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-red-600 focus:text-red-700 focus:bg-red-50 hover:bg-red-50 rounded-md [&>svg]:size-4 [&>svg]:shrink-0"
                                    onClick={() => logout()}
                                >
                                    <LogOut size={16} />
                                    Выйти
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Подписка — компактно под блоком пользователя */}
                    {subscriptionsEnabled && (
                        <div className="mb-4 sm:mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <Star className={cn("h-5 w-5 shrink-0", mySubscription?.plan_name ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                                {mySubscription?.plan_name ? (
                                    <span className="text-sm font-bold text-slate-800">{mySubscription.plan_name}</span>
                                ) : (
                                    <Link href="/add" className="text-sm font-bold text-slate-600 hover:text-slate-800">Выбрать тариф</Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Табы под данными пользователя */}
                    <TabsList className="flex items-center justify-start w-full h-auto p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar gap-1 mb-6">
                        <TabsTrigger value="ads" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <FileText size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">Объявления</span>
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <Heart size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">Избранное</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <History size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">История</span>
                        </TabsTrigger>
                        {subscriptionsEnabled && (
                            <TabsTrigger value="subscription" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                                <CreditCard size={18} className="shrink-0" />
                                <span className="whitespace-nowrap">Подписка</span>
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="settings" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <Settings size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">Настройки</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Контент вкладок */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Мои объявления */}
                                <TabsContent value="ads" className="mt-0 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-8 pb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Мои объявления</h2>
                                        <Link href="/add" className="w-full sm:w-auto">
                                            <Button className="w-full sm:w-auto rounded-full bg-slate-800 hover:bg-slate-700 shadow-slate-200 shadow-lg px-6 h-11 font-bold">
                                                <Plus className="h-5 w-5 mr-2" />
                                                Создать
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        {myCars.length === 0 ? (
                                            <div className="col-span-1 sm:col-span-2 py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center px-4">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="text-slate-300 h-7 w-7 sm:h-8 sm:w-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-base sm:text-lg">У вас пока нет объявлений</p>
                                                <p className="text-slate-400 text-sm mt-1 max-w-xs">Разместите свой автомобиль сегодня!</p>
                                            </div>
                                        ) : (
                                            myCars.map((car: any) => (
                                                <Card key={car.id} className="group overflow-hidden rounded-2xl sm:rounded-[2.5rem] border-none shadow-md hover:shadow-xl transition-all duration-500 bg-white">
                                                    <div className="relative h-40 sm:h-48 bg-slate-100">
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
                                                                car.status === "ACTIVE" ? "bg-green-500 text-white" : car.status === "DRAFT" ? "bg-slate-500 text-white" : car.status === "REJECT" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                                                            )}>
                                                                {car.status === "ACTIVE" ? "Активно" : car.status === "DRAFT" ? "Черновик" : car.status === "REJECT" ? "Отклонено" : "Модерация"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 sm:p-6 space-y-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Clock size={12} className="text-slate-400 shrink-0" />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                                    {car.create_date ? new Date(car.create_date).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-black text-lg sm:text-xl text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">{car.name}</h3>
                                                            <p className="text-slate-900 font-black text-base sm:text-lg mt-1">{car.price_per_day} ₸ <span className="text-sm font-medium text-slate-400">/ день</span></p>
                                                        </div>

                                                        <div className="flex items-center justify-between border-t border-slate-50 pt-3 sm:pt-4 mt-auto">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                                    <History size={14} />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-500">{car.views_count ?? 0} просм.</span>
                                                            </div>
                                                            <Link href={`/cars/${car.id}`}>
                                                                <Button size="sm" variant="ghost" className="rounded-full gap-1 group/btn font-bold text-slate-700 hover:bg-slate-100 touch-manipulation">
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
                                    <div className="pt-4 sm:pt-8">
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Избранное</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {likes.length === 0 ? (
                                            <div className="col-span-1 sm:col-span-2 py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center px-4">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                                    <Heart className="text-red-200 h-7 w-7 sm:h-8 sm:w-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-base sm:text-lg">Список пуст</p>
                                                <p className="text-slate-400 text-sm mt-1">Добавляйте понравившиеся модели в избранное!</p>
                                            </div>
                                        ) : (
                                            likes.map((like) => (
                                                <Card key={like.id} className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center bg-white border-none shadow-md rounded-xl sm:rounded-[2rem] group hover:shadow-xl transition-all min-h-[100px] sm:h-28">
                                                    <div className="flex-shrink-0 w-20 h-16 sm:w-28 sm:h-20 bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden group-hover:scale-95 transition-transform">
                                                        {like.car?.images?.[0]?.url ? (
                                                            <img src={like.car.images[0].url} alt={like.car?.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><Heart /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                                                        <h3 className="font-bold text-slate-900 truncate text-sm sm:text-base">
                                                            {like.car?.name} {like.car?.release_year ? `${like.car.release_year} г.` : ''}
                                                        </h3>
                                                        {like.car?.mark && like.car?.model && (
                                                            <p className="text-xs text-slate-500 font-medium mb-0.5 sm:mb-1">
                                                                {like.car.mark} • {like.car.model}
                                                            </p>
                                                        )}
                                                        <p className="text-slate-900 font-black text-xs sm:text-sm">{like.car?.price_per_day} ₸ <span className="text-slate-400 font-medium text-xs">/ день</span></p>
                                                    </div>
                                                    <Link href={`/cars/${like.car?.id}`} className="shrink-0 touch-manipulation">
                                                        <Button variant="ghost" size="icon" className="rounded-xl sm:rounded-2xl text-slate-300 hover:text-slate-700 hover:bg-slate-100 transition-colors h-10 w-10">
                                                            <ExternalLink size={18} className="sm:w-5 sm:h-5" />
                                                        </Button>
                                                    </Link>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>

                                {/* История просмотров */}
                                <TabsContent value="history" className="mt-0 space-y-6">
                                    <div className="pt-4 sm:pt-8">
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">История</h2>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        {events.length === 0 ? (
                                            <div className="py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center px-4">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <History className="text-slate-200 h-7 w-7 sm:h-8 sm:w-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-base sm:text-lg">История пуста</p>
                                            </div>
                                        ) : (
                                            events.map((event) => (
                                                <Card key={event.id} className={cn(
                                                    "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border-none shadow-md rounded-2xl sm:rounded-3xl group hover:shadow-lg transition-all",
                                                    event.car_deleted && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                                )}>
                                                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                                        <div className="flex sm:hidden w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-slate-400 shrink-0">
                                                            <Clock size={18} />
                                                        </div>
                                                        <div className="hidden sm:flex w-12 h-12 rounded-full bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors shrink-0">
                                                            <Clock size={20} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                                                {event.created_at ? new Date(event.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long' }) : ''}
                                                            </p>
                                                            {event.car_deleted ? (
                                                                <h4 className="font-bold text-slate-400 text-sm sm:text-base">{event.car_name || 'Объявление удалено'}</h4>
                                                            ) : (
                                                                <Link href={`/cars/${event.car_id}`} className="font-bold text-slate-900 hover:text-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm sm:text-base">
                                                                    <span className="line-clamp-1 sm:line-clamp-none">
                                                                        {event.car_name} {event.car_release_year ? `${event.car_release_year} г.` : ''}
                                                                    </span>
                                                                    {event.car_mark && event.car_model && (
                                                                        <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">({event.car_mark} • {event.car_model})</span>
                                                                    )}
                                                                    <ChevronRight size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all hidden sm:block shrink-0" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right shrink-0 pl-0 sm:pl-4">
                                                        <p className="font-black text-slate-900 text-sm sm:text-base">
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

                                {/* Подписка */}
                                {subscriptionsEnabled && (
                                    <TabsContent value="subscription" className="mt-0">
                                        <div className="pt-4 sm:pt-8 space-y-6">
                                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Управление подпиской</h2>
                                            
                                            {!mySubscription || !mySubscription.plan_name ? (
                                                <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-2xl sm:rounded-[2.5rem] bg-white text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CreditCard className="text-slate-300 w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2">У вас нет активной подписки</h3>
                                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Выберите тарифный план, чтобы получить полный доступ ко всем функциям сервиса.</p>
                                                    <Link href="/subscriptions">
                                                        <Button className="rounded-full bg-slate-800 hover:bg-slate-700 px-8 h-12 font-bold shadow-lg shadow-slate-200">
                                                            Выбрать тариф
                                                        </Button>
                                                    </Link>
                                                </Card>
                                            ) : mySubscription.status === "pending" || mySubscription.status === "created" ? (
                                                <Card className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-2xl sm:rounded-[2.5rem] bg-white text-center">
                                                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Clock className="text-amber-500 w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2">Ожидается оплата</h3>
                                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Мы ждем подтверждения оплаты от платежной системы. Это может занять несколько минут.</p>
                                                    <Link href="/subscriptions">
                                                        <Button variant="outline" className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 px-8 h-12 font-bold">
                                                            Перейти к тарифам
                                                        </Button>
                                                    </Link>
                                                </Card>
                                            ) : (
                                                <Card className="p-6 sm:p-8 border-none shadow-xl shadow-slate-200/50 rounded-2xl sm:rounded-[2.5rem] bg-white">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-slate-100">
                                                        <div>
                                                            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                                                                Активна
                                                            </div>
                                                            <h3 className="text-2xl font-black text-slate-900">{mySubscription.plan_name}</h3>
                                                        </div>
                                                        <Link href="/subscriptions">
                                                            <Button variant="outline" className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 px-6 h-10 sm:h-12 font-bold">
                                                                Сменить тариф
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div className="bg-slate-50 rounded-2xl p-4">
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Действует с</p>
                                                            <p className="font-bold text-slate-800">
                                                                {mySubscription.started_at ? new Date(mySubscription.started_at).toLocaleDateString('ru-RU') : '—'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-2xl p-4">
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Действует до</p>
                                                            <p className="font-bold text-slate-800">
                                                                {mySubscription.valid_until ? new Date(mySubscription.valid_until).toLocaleDateString('ru-RU') : '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {mySubscription.valid_until && (
                                                        <div className="mt-4 text-sm text-slate-500 font-medium">
                                                            Осталось дней: {Math.max(0, Math.ceil((new Date(mySubscription.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))}
                                                        </div>
                                                    )}
                                                </Card>
                                            )}

                                            <div className="mt-8">
                                                <h3 className="text-xl font-bold tracking-tight mb-4">История платежей</h3>
                                                {paymentHistory.length === 0 ? (
                                                    <p className="text-slate-500">История платежей пуста.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {paymentHistory.map((payment) => (
                                                            <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm gap-2">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-800">{payment.plan_name}</span>
                                                                    <span className="text-xs text-slate-400 font-medium">
                                                                        {payment.create_date ? new Date(payment.create_date).toLocaleString('ru-RU') : ''} • {payment.provider}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 pt-2 sm:pt-0">
                                                                    <span className="font-black text-slate-900">{payment.amount_kzt} ₸</span>
                                                                    <span className={cn(
                                                                        "text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                                                                        payment.status === "paid" || payment.status === "success" ? "bg-green-100 text-green-700" :
                                                                        payment.status === "failed" || payment.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                        "bg-amber-100 text-amber-700"
                                                                    )}>
                                                                        {payment.status === "paid" ? "Успешно" : payment.status === "failed" ? "Ошибка" : "В обработке"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                )}

                                {/* Настройки */}
                                <TabsContent value="settings" className="mt-0">
                                    <div className="pt-4 sm:pt-8">
                                        <Card className="p-4 sm:p-8 border-none shadow-xl shadow-slate-200/50 rounded-2xl sm:rounded-[2.5rem] bg-white">
                                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6 sm:mb-8">Настройки</h2>
                                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Имя</Label>
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
                                                        placeholder="+7 (999) 123-45-67"
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
                                                    {showOtp && (
                                                        <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center">
                                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                                                                <Phone className="w-6 h-6" />
                                                            </div>
                                                            <Label className="text-sm font-black uppercase tracking-widest text-slate-700 text-center mb-2">
                                                                Введите код подтверждения
                                                            </Label>
                                                            <p className="text-slate-500 text-sm text-center mb-4 max-w-sm">Мы отправили одноразовый код на ваш новый номер телефона или Email.</p>
                                                            <Input
                                                                placeholder="Код"
                                                                value={otpCode}
                                                                onChange={(e) => setOtpCode(e.target.value)}
                                                                className="rounded-xl h-14 bg-white border border-slate-200 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 font-medium text-center tracking-[0.5em] text-xl mt-2 w-full max-w-xs uppercase"
                                                                maxLength={6}
                                                            />
                                                        </div>
                                                    )}
                                                    <Button type="submit" disabled={loading || !hasChanges} className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 text-lg font-black shadow-lg shadow-slate-200/50 transition-all">
                                                        {loading ? 'Обработка...' : showOtp ? 'Подтвердить и сохранить' : 'Сохранить изменения'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Card>
                                    </div>
                                </TabsContent>
                    </div>
                </div>
            </div>
        </Tabs>
    );
}
