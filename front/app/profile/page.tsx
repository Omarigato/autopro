"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Settings, Heart, FileText, History, Shield } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("history");
    const [profileData, setProfileData] = useState<any>({});
    const [likes, setLikes] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [myCars, setMyCars] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadProfileData();
            loadLikes();
            loadEvents();
            loadMyCars();
        }
    }, [user]);

    const loadProfileData = async () => {
        try {
            const res = await apiClient.get('/auth/me');
            setProfileData(res.data.data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const loadLikes = async () => {
        try {
            const res = await apiClient.get('/users/likes');
            setLikes(res.data.data || []);
        } catch (err) {
            console.error('Failed to load likes:', err);
        }
    };

    const loadEvents = async () => {
        try {
            const res = await apiClient.get('/users/events');
            setEvents(res.data.data || []);
        } catch (err) {
            console.error('Failed to load events:', err);
        }
    };

    const loadMyCars = async () => {
        try {
            const res = await apiClient.get('/cars/my');
            setMyCars(res.data.data || []);
        } catch (err) {
            console.error('Failed to load my cars:', err);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put('/auth/me', profileData);
            toast.success('Профиль обновлен');
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
            <div className="container py-20 text-center">
                <p>Пожалуйста, войдите в систему</p>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar - Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="p-6 space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={profileData.avatar_url} alt={profileData.first_name} />
                                <AvatarFallback className="text-2xl">
                                    {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="w-full">
                                <h3 className="font-bold text-lg">Имя</h3>
                                <p className="text-slate-600">{profileData.first_name}</p>
                            </div>

                            <div className="w-full">
                                <h3 className="font-bold text-lg">Фамилия</h3>
                                <p className="text-slate-600">{profileData.last_name || '-'}</p>
                            </div>

                            <div className="w-full pt-4 border-t">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <p className="text-sm text-slate-600">Ваш счет</p>
                                    <p className="text-2xl font-bold text-blue-600">{profileData.balance || 0} ₸</p>
                                    <Button className="w-full mt-3">Пополнить счет</Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm pt-4 border-t">
                            <div>
                                <h4 className="font-semibold">Email</h4>
                                <p className="text-slate-600">{profileData.email || '-'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Номер</h4>
                                <p className="text-slate-600">{profileData.phone_number || '-'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Пол</h4>
                                <p className="text-slate-600">
                                    {profileData.gender === 'male' ? 'Мужской' : profileData.gender === 'female' ? 'Женский' : '-'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Дата рождения</h4>
                                <p className="text-slate-600">
                                    {profileData.date_birth ? new Date(profileData.date_birth).toLocaleDateString('ru-RU') : '-'}
                                </p>
                            </div>
                        </div>

                        {user.role === 'admin' && (
                            <Link href="/dashboard" className="block">
                                <Button variant="outline" className="w-full gap-2">
                                    <Shield size={16} />
                                    Админ панель
                                </Button>
                            </Link>
                        )}
                    </Card>
                </div>

                {/* Right Content - Tabs */}
                <div className="lg:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="history" className="gap-2">
                                <History size={16} />
                                История
                            </TabsTrigger>
                            <TabsTrigger value="ads" className="gap-2">
                                <FileText size={16} />
                                Объявления
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="gap-2">
                                <Settings size={16} />
                                Настройки
                            </TabsTrigger>
                            <TabsTrigger value="favorites" className="gap-2">
                                <Heart size={16} />
                                Избранное
                            </TabsTrigger>
                        </TabsList>

                        {/* История */}
                        <TabsContent value="history" className="mt-6">
                            <h2 className="text-2xl font-bold mb-6">История покупок</h2>
                            <div className="space-y-4">
                                {events.length === 0 ? (
                                    <p className="text-center text-slate-500 py-12">История пуста</p>
                                ) : (
                                    events.map((event) => (
                                        <Card key={event.id} className="p-4 flex gap-4">
                                            <div className="flex-shrink-0 w-32 h-24 bg-slate-100 rounded-lg"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-500">{new Date(event.created_at).toLocaleDateString('ru-RU')}</p>
                                                <h3 className="font-bold text-lg">{event.car_name}</h3>
                                                <p className="text-slate-600">{event.car_price} ₸/день</p>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Мои объявления */}
                        <TabsContent value="ads" className="mt-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Мои объявления</h2>
                                <Link href="/add">
                                    <Button>Добавить объявление</Button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {myCars.length === 0 ? (
                                    <p className="text-center text-slate-500 py-12">У вас пока нет объявлений</p>
                                ) : (
                                    myCars.map((car: any) => (
                                        <Card key={car.id} className="p-4 flex gap-4">
                                            <div className="flex-shrink-0 w-32 h-24 bg-slate-100 rounded-lg"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-500">{new Date(car.create_date).toLocaleDateString('ru-RU')}</p>
                                                <h3 className="font-bold text-lg">{car.name}</h3>
                                                <p className="text-slate-600">{car.price_per_day} ₸/день</p>
                                                <Button size="sm" className="mt-2">Продлить</Button>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Настройки */}
                        <TabsContent value="settings" className="mt-6">
                            <h2 className="text-2xl font-bold mb-6">Настройки профиля</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Имя</Label>
                                        <Input
                                            value={profileData.first_name || ''}
                                            onChange={(e) => handleChange('first_name', e.target.value)}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Фамилия</Label>
                                        <Input
                                            value={profileData.last_name || ''}
                                            onChange={(e) => handleChange('last_name', e.target.value)}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={profileData.email || ''}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="rounded-xl h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Номер телефона</Label>
                                    <Input
                                        value={profileData.phone_number || ''}
                                        onChange={(e) => handleChange('phone_number', e.target.value)}
                                        className="rounded-xl h-12"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Пол</Label>
                                        <Select
                                            value={profileData.gender || ''}
                                            onValueChange={(val: string) => handleChange('gender', val)}
                                        >
                                            <SelectTrigger className="rounded-xl h-12">
                                                <SelectValue placeholder="Выберите пол" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Мужской</SelectItem>
                                                <SelectItem value="female">Женский</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Дата рождения</Label>
                                        <Input
                                            type="date"
                                            value={profileData.date_birth ? profileData.date_birth.split('T')[0] : ''}
                                            onChange={(e) => handleChange('date_birth', e.target.value)}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full rounded-xl h-12">
                                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Избранное */}
                        <TabsContent value="favorites" className="mt-6">
                            <h2 className="text-2xl font-bold mb-6">Избранное</h2>
                            <div className="space-y-4">
                                {likes.length === 0 ? (
                                    <p className="text-center text-slate-500 py-12">У вас пока нет избранных объявлений</p>
                                ) : (
                                    likes.map((like) => (
                                        <Card key={like.id} className="p-4 flex gap-4">
                                            <div className="flex-shrink-0 w-32 h-24 bg-slate-100 rounded-lg"></div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{like.car_name}</h3>
                                                <p className="text-slate-600">{like.car_price} ₸/день</p>
                                                <Heart className="text-blue-500 fill-blue-500" size={20} />
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
