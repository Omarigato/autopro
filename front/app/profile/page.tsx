"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Lock, Smartphone, Mail, ShieldCheck, ChevronRight, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/lib/translations";
import Image from "next/image";

export default function ProfilePage() {
    const [lang, setLang] = useState("ru");
    const t = useTranslation(lang);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({ name: "", email: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const currentLang = window.localStorage.getItem("lang") || "ru";
        setLang(currentLang);
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res: any = await apiClient.get("/auth/me");
            setUser(res || null);
            setProfileData({
                name: res?.name || "",
                email: res?.email || ""
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.put("/auth/me", profileData);
            await fetchUser();
            alert("Профиль успешно обновлен!");
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setSaving(true);
        try {
            await apiClient.post("/auth/avatar", formData);
            await fetchUser();
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки фото");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        window.localStorage.removeItem("token");
        window.location.href = "/login";
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50/30">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Secure Profile...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* Header Profile */}
            <div className="relative bg-white rounded-[4rem] p-8 md:p-14 shadow-premium border border-slate-100 overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-all duration-1000" />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                <div className="relative flex flex-col md:flex-row items-center gap-12">
                    <div className="relative" onClick={handleAvatarClick}>
                        <div className="w-36 h-36 md:w-48 md:h-48 rounded-[3.5rem] bg-slate-50 border-8 border-white shadow-2xl overflow-hidden cursor-pointer group/avatar relative transition-transform hover:scale-105 active:scale-95 duration-500">
                            {user?.avatar_url ? (
                                <Image src={user.avatar_url} alt="Profile" fill className="object-cover group-hover/avatar:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={64} className="text-slate-100" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="text-white" size={32} />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-4 bg-accent text-white rounded-[1.5rem] shadow-xl shadow-accent/20">
                            <Camera size={20} />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">
                                {user?.name || 'Пользователь'}
                            </h1>
                            <p className="text-slate-400 font-bold tracking-tight">{user?.phone_number || 'Телефон не указан'}</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-5 py-2 bg-primary/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10">
                                {user?.role === 'admin' ? 'Администратор' : 'Арендодатель'}
                            </span>
                            <span className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                                <ShieldCheck size={14} /> Верифицирован
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="md:ml-auto flex items-center gap-3 px-8 py-5 bg-slate-50 text-slate-400 hover:text-white hover:bg-danger rounded-3xl font-black transition-all text-[10px] uppercase tracking-widest shadow-sm hover:shadow-xl hover:shadow-danger/20"
                    >
                        <LogOut size={18} /> {t('logout')}
                    </button>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Profile Info */}
                <div className="bg-white rounded-[3.5rem] p-10 shadow-premium border border-slate-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-4 text-primary relative">
                        <div className="p-3 bg-accent/10 rounded-2xl text-accent"><User size={24} /></div>
                        Настройки
                    </h2>

                    <div className="space-y-6 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Как вас зовут</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-bold text-sm focus:bg-white focus:border-accent/20 focus:ring-8 focus:ring-accent/5 transition-all text-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">{t('email')}</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                placeholder="example@mail.com"
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-bold text-sm focus:bg-white focus:border-accent/20 focus:ring-8 focus:ring-accent/5 transition-all text-primary"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            {saving ? 'Сохранение...' : t('save')}
                        </button>
                    </div>
                </div>

                {/* Security / Contacts */}
                <div className="bg-white rounded-[3.5rem] p-10 shadow-premium border border-slate-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-4 text-primary">
                        <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Lock size={24} /></div>
                        Безопасность
                    </h2>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-accent/10 rounded-[2.2rem] group transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white rounded-2xl text-slate-400 group-hover:text-accent shadow-sm transition-all duration-500">
                                    <Lock size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="font-black text-xs uppercase tracking-widest text-primary block">{t('change_password')}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Обновите уровень защиты</span>
                                </div>
                            </div>
                            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all">
                                <ChevronRight size={18} />
                            </div>
                        </button>

                        <button className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-accent/10 rounded-[2.2rem] group transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 opacity-60 grayscale cursor-not-allowed">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm transition-all">
                                    <Smartphone size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="font-black text-xs uppercase tracking-widest text-primary block">Быстрый вход</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Доступно только в приложении</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-premium relative">
                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white -mr-1 -mt-1 shadow-sm" />
                            <Smartphone className="text-accent" size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('phone')}</p>
                            <p className="text-lg font-black text-primary tracking-tight">{user?.phone_number || '+7 700 000-00-00'}</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="pt-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                    AUTOPRO ACCOUNT CORE SYSTEM • 2024
                </p>
            </div>
        </div>
    );
}
