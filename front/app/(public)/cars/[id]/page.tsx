"use client";

import { useCar } from "@/hooks/useCars";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    MapPin,
    Calendar,
    Settings,
    ShieldCheck,
    Star,
    Share2,
    Heart
} from "lucide-react";

export default function CarDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);
    const { data: car, isLoading } = useCar(id);

    if (isLoading) return <div className="container py-20 text-center animate-pulse">Загрузка данных...</div>;
    if (!car) return <div className="container py-20 text-center text-red-500">Автомобиль не найден</div>;

    return (
        <div className="pb-20">
            {/* Header / Nav */}
            <div className="container py-6 flex justify-between items-center">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                    <ChevronLeft size={20} /> Назад в каталог
                </Button>
                <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="rounded-full shadow-sm"><Share2 size={18} /></Button>
                    <Button size="icon" variant="outline" className="rounded-full shadow-sm text-red-500 hover:bg-red-50 border-red-100"><Heart size={18} /></Button>
                </div>
            </div>

            <div className="container grid lg:grid-cols-3 gap-8 md:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Gallery */}
                    <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative shadow-md">
                        {car.images?.[0] ? (
                            <Image src={car.images[0].url} alt={car.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Settings size={64} strokeWidth={1} /></div>
                        )}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                            1 / {car.images?.length || 1}
                        </div>
                    </div>

                    {/* Title & Reviews */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">{car.name}</h1>
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold w-fit">
                                <Star size={16} className="fill-current" /> 4.9 (12 reviews)
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6 text-slate-500 font-medium">
                            <span className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> {car.city || ''}</span>
                            <span className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> {car.release_year} год</span>
                            <span className="flex items-center gap-2"><Settings size={18} className="text-primary" /> {car.transmission || 'Автомат'}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-xl font-bold">Описание</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {car.description || "Владелец не предоставил подробное описание. Пожалуйста, свяжитесь для уточнения деталей."}
                        </p>
                    </div>

                    {/* Tech Specs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                            <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Двигатель</div>
                            <div className="text-lg font-bold text-slate-900">2.5 л / Бензин</div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                            <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Привод</div>
                            <div className="text-lg font-bold text-slate-900">Полный (AWD)</div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                            <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Расход</div>
                            <div className="text-lg font-bold text-slate-900">12 л / 100 км</div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                            <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Мест</div>
                            <div className="text-lg font-bold text-slate-900">5 мест</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 space-y-8">
                            <div>
                                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Цена аренды</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl font-black text-primary">{car.price_per_day} ₸</span>
                                    <span className="text-slate-400 font-medium">/ сутки</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button size="lg" className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20">
                                    Забронировать
                                </Button>
                                <Button variant="outline" size="lg" className="w-full text-lg h-14 rounded-2xl border-2 hover:bg-slate-50">
                                    Написать сообщение
                                </Button>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200" />
                                <div>
                                    <div className="font-bold text-sm">Владелец</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wide">Verified Owner <ShieldCheck size={12} className="inline text-green-500" /></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-900 text-sm font-medium flex gap-3 items-start">
                            <ShieldCheck className="shrink-0 text-blue-600" />
                            <div>
                                <p className="font-bold mb-1">Безопасная сделка</p>
                                Ваш депозит будет заморожен до успешного завершения аренды.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
