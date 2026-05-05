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
    ArrowLeft
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
import { useTranslation } from "@/hooks/useTranslation";
import { useAppState } from "@/lib/store";

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
    const { t, formatMessage } = useTranslation();
    const { lang } = useAppState();
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

    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(initialProfileData);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) return;

        const contactChanged = profileData.phone_number !== initialProfileData.phone_number || profileData.email !== initialProfileData.email;
        if (contactChanged && !showOtp) {
            setLoading(true);
            try {
                const target = profileData.phone_number !== initialProfileData.phone_number ? profileData.phone_number : profileData.email;
                const res = await apiClient.post('/auth/otp/request', { target, type: 'update' }) as any;
                setShowOtp(true);
                toast.success(formatMessage(res?.message) || t('profile.otp_sent'));
            } catch (err: any) {
                toast.error(formatMessage(err?.response?.data?.message || err?.message) || t('common.error'));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (showOtp && !otpCode) {
            toast.error(t('profile.otp_title'));
            return;
        }

        setLoading(true);
        try {
            if (showOtp && otpCode) {
                const target = profileData.phone_number !== initialProfileData.phone_number ? profileData.phone_number : profileData.email;
                await apiClient.post('/auth/otp/verify', { target, otp_code: otpCode });
            }

            const res = await apiClient.put('/auth/me', profileData) as any;
            toast.success(formatMessage(res?.message) || t('profile.success'));
            await refreshUser();
            setInitialProfileData({ ...profileData });
            setShowOtp(false);
            setOtpCode("");
        } catch (err: any) {
            toast.error(formatMessage(err?.response?.data?.message || err?.message) || t('profile.error') || t('common.error'));
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
                <h2 className="text-2xl font-bold">{t("profile.title")}</h2>
                <p className="text-slate-500 max-w-sm text-center">{t("profile.subtitle")}</p>
                <Link href="/login">
                    <Button className="rounded-full px-8 bg-slate-800 hover:bg-slate-700">{t("profile.login")}</Button>
                </Link>
            </div>
        );
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen">
            <div className="bg-slate-50/50 min-h-screen pb-20 pt-6">

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
                                            loading: t('profile.loading'),
                                            success: t('profile.avatar_success'),
                                            error: t('profile.upload_error')
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
                                        {t("profile.admin")}
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
                                    {t("profile.my_account")}
                                    <ChevronDown className="h-4 w-4 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 shadow-xl p-1">
                                <div className="px-3 py-2.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("profile.phone")}</p>
                                    <p className="text-sm font-medium text-slate-800 font-mono">{formatPhoneDisplay(profileData.phone_number)}</p>
                                </div>
                                <div className="px-3 py-2.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("profile.email")}</p>
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
                                            {t("profile.admin_panel")}
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
                                    {t("profile.logout")}
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
                                    <Link href="/add" className="text-sm font-bold text-slate-600 hover:text-slate-800">{t("profile.choose_plan")}</Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Табы под данными пользователя */}
                    <TabsList className="flex items-center justify-start w-full h-auto p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar gap-1 mb-6">
                        <TabsTrigger value="ads" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <FileText size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">{t("profile.ads")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <Heart size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">{t("profile.favorites")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <History size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">{t("profile.history")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold transition-all text-slate-600 hover:text-slate-900 text-sm sm:text-base">
                            <Settings size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">{t("profile.settings")}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Контент вкладок */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Мои объявления */}
                        <TabsContent value="ads" className="mt-0 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-8 pb-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t("profile.my_ads_title")}</h2>
                                <Link href="/add" className="w-full sm:w-auto">
                                    <Button className="w-full sm:w-auto rounded-full bg-slate-800 hover:bg-slate-700 shadow-slate-200 shadow-lg px-6 h-11 font-bold">
                                        <Plus className="h-5 w-5 mr-2" />
                                        {t("profile.create")}
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {myCars.length === 0 ? (
                                    <div className="col-span-1 sm:col-span-2 py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <FileText className="text-slate-300 h-7 w-7 sm:h-8 sm:w-8" />
                                        </div>
                                        <p className="text-slate-500 font-bold text-base sm:text-lg">{t("profile.no_ads")}</p>
                                        <p className="text-slate-400 text-sm mt-1 max-w-xs">{t("profile.place_ad_today")}</p>
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
                                                        {car.status === "ACTIVE" ? t("profile.status_active") : car.status === "DRAFT" ? t("profile.status_draft") : car.status === "REJECT" ? t("profile.status_rejected") : t("profile.status_moderation")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 sm:p-6 space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock size={12} className="text-slate-400 shrink-0" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                            {car.create_date ? new Date(car.create_date).toLocaleString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-black text-lg sm:text-xl text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">{car.name}</h3>
                                                    <p className="text-slate-900 font-black text-base sm:text-lg mt-1">{car.price_per_day} ₸ <span className="text-sm font-medium text-slate-400">/ {t("profile.per_day")}</span></p>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-slate-50 pt-3 sm:pt-4 mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                            <History size={14} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500">{car.views_count ?? 0} {t("profile.views")}</span>
                                                    </div>
                                                    <Link href={`/cars/${car.id}`}>
                                                        <Button size="sm" variant="ghost" className="rounded-full gap-1 group/btn font-bold text-slate-700 hover:bg-slate-100 touch-manipulation">
                                                            {t("profile.go_to")} <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t("profile.favorites")}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {likes.length === 0 ? (
                                    <div className="col-span-1 sm:col-span-2 py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                            <Heart className="text-red-200 h-7 w-7 sm:h-8 sm:w-8" />
                                        </div>
                                        <p className="text-slate-500 font-bold text-base sm:text-lg">{t("profile.list_empty")}</p>
                                        <p className="text-slate-400 text-sm mt-1">{t("profile.add_favorites_prompt")}</p>
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
                                                <p className="text-slate-900 font-black text-xs sm:text-sm">{like.car?.price_per_day} ₸ <span className="text-slate-400 font-medium text-xs">/ {t("profile.price_per_day")}</span></p>
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
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t("profile.history")}</h2>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                {events.length === 0 ? (
                                    <div className="py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <History className="text-slate-200 h-7 w-7 sm:h-8 sm:w-8" />
                                        </div>
                                        <p className="text-slate-500 font-bold text-base sm:text-lg">{t("profile.history_empty")}</p>
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
                                                        {event.created_at ? new Date(event.created_at).toLocaleString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' }) : ''}
                                                    </p>
                                                    {event.car_deleted ? (
                                                        <h4 className="font-bold text-slate-400 text-sm sm:text-base">{event.car_name || t("profile.ad_deleted")}</h4>
                                                    ) : (
                                                        <Link href={`/cars/${event.car_id}`} className="font-bold text-slate-900 hover:text-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm sm:text-base">
                                                            <span className="line-clamp-1 sm:line-clamp-none">
                                                                {event.car_name} {event.car_release_year ? `${event.car_release_year} ${lang === 'en' ? 'y.' : 'г.'}` : ''}
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
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("profile.price_per_day")}</span>
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
                                        {loadingEvents ? t("profile.loading") : t("profile.show_more")}
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Настройки */}
                        <TabsContent value="settings" className="mt-0">
                            <div className="pt-4 sm:pt-8">
                                <Card className="p-4 sm:p-8 border-none shadow-xl shadow-slate-200/50 rounded-2xl sm:rounded-[2.5rem] bg-white">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6 sm:mb-8">{t("profile.settings")}</h2>
                                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("profile.name")}</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input
                                                    placeholder={t("profile.name_placeholder")}
                                                    value={profileData.name || ''}
                                                    onChange={(e) => handleChange('name', e.target.value)}
                                                    className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-indigo-600 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("profile.email")}</Label>
                                            <Input
                                                type="email"
                                                value={profileData.email || ''}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-slate-400 font-medium"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("profile.phone")}</Label>
                                            <Input
                                                value={profileData.phone_number || ''}
                                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                                placeholder={t("profile.phone_placeholder")}
                                                className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-slate-400 font-medium"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("profile.personal_data")}</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Select
                                                    value={profileData.gender || ''}
                                                    onValueChange={(val: string) => handleChange('gender', val)}
                                                >
                                                    <SelectTrigger className="rounded-2xl h-14 bg-slate-50 border-none font-medium">
                                                        <SelectValue placeholder={t("profile.gender_placeholder")} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                                        <SelectItem value="male">{t("profile.male")}</SelectItem>
                                                        <SelectItem value="female">{t("profile.female")}</SelectItem>
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
                                            <h3 className="text-xl font-bold tracking-tight mb-6">{t("profile.notifications")}</h3>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                                                    <div className="space-y-0.5 max-w-[80%]">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-5 h-5 text-slate-500" />
                                                            <Label className="text-base font-bold text-slate-800">{t("profile.email_notify")}</Label>
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium ml-7">
                                                            {t("profile.email_notify_desc")}
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
                                                            <Label className="text-base font-bold text-slate-800">{t("profile.whatsapp_notify")}</Label>
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium ml-7">
                                                            {t("profile.whatsapp_notify_desc")}
                                                            {subscriptionsEnabled && !mySubscription?.plan_name && (
                                                                <span className="block text-amber-500 text-xs mt-1">{t("profile.available_by_sub")}</span>
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
                                                        {t("profile.otp_title")}
                                                    </Label>
                                                    <p className="text-slate-500 text-sm text-center mb-4 max-w-sm">{t("profile.otp_desc")}</p>
                                                    <Input
                                                        placeholder={t("profile.code_placeholder") || "Код"}
                                                        value={otpCode}
                                                        onChange={(e) => setOtpCode(e.target.value)}
                                                        className="rounded-xl h-14 bg-white border border-slate-200 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 font-medium text-center tracking-[0.5em] text-xl mt-2 w-full max-w-xs uppercase"
                                                        maxLength={6}
                                                    />
                                                </div>
                                            )}
                                            <Button type="submit" disabled={loading || !hasChanges} className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 text-lg font-black shadow-lg shadow-slate-200/50 transition-all">
                                                {loading ? t("profile.processing") : showOtp ? t("profile.verify_and_save") : t("profile.save_changes")}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        </TabsContent>
                    </div>
                </div>
            </div>
        </Tabs >
    );
}
