"use client";

import { useCar } from "@/hooks/useCars";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import {
    ChevronLeft,
    Heart,
    MessageCircle,
    Phone,
    Share2,
    Calendar,
    Settings,
    MapPin,
    Car,
    Fuel,
    Info,
    Gauge,
    ClipboardList,
    Palette
} from "lucide-react";

export default function CarDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);
    const { user } = useAuth();
    const { data: car, isLoading } = useCar(id);
    const [mainImage, setMainImage] = useState<string | null>(null);

    useEffect(() => {
        if (user && id && car) {
            apiClient.post(`/users/events/view/${id}`).catch(() => {});
        }
    }, [user, id, car]);

    if (isLoading) return <div className="container py-20 text-center animate-pulse">Загрузка данных...</div>;
    if (!car) return <div className="container py-20 text-center text-red-500">Автомобиль не найден</div>;

    const images = car.images && car.images.length > 0 ? car.images : [{ url: "https://via.placeholder.com/800x600?text=No+Image" }];
    const currentMainImage = mainImage || images[0].url;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b mb-8">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-slate-500 hover:text-slate-900"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Назад
                        </Button>
                        <span className="text-sm font-medium text-slate-400">Объявление</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400">
                            <Heart className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400">
                            <ClipboardList className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Images & Description */}
                    <div className="space-y-8">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
                            <Image
                                src={currentMainImage}
                                alt={car.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img.url)}
                                    className={`relative w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all ${currentMainImage === img.url ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <Image src={img.url} alt={`${car.name} ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                {car.description || `${car.name} 2023 года — вершину элегантности, производительности и передовых технологий. Этот роскошный седан органично сочетает в себе вневременной дизайн и современные инновации, создавая столь же утонченный, сколь и захватывающий опыт вождения.`}
                            </p>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                {car.additional_info || "Под капотом седана находится целый ряд мощных и эффективных двигателей, обеспечивающих динамические характеристики, в которых легко найти баланс между мощностью и топливной экономичностью. Будь то городские улицы или открытое шоссе, автомобиль обеспечивает плавную и отзывчивую езду, устанавливая новые стандарты комфорта вождения."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div className="space-y-8">
                        {/* Title & Price */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{car.name} {car.release_year} г.</h1>
                                <button className="text-slate-400 hover:text-red-500 transition-colors mt-2">
                                    <Heart className="h-5 w-5 inline mr-1" />
                                </button>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-slate-900">{car.price_per_day} тг/день</div>
                            </div>
                        </div>

                        {/* Specs Table */}
                        <div className="space-y-3">
                            {[
                                { label: 'Город', value: car.city || 'Алматы', icon: MapPin },
                                { label: 'Год выпуска', value: car.release_year, icon: Calendar },
                                { label: 'Кузов', value: car.body_type || 'Внедорожник', icon: Car },
                                { label: 'Пробег', value: `${car.mileage || '23 000'} км`, icon: Gauge },
                                { label: 'Состояние', value: car.condition || '—', icon: Info },
                                { label: 'Цвет', value: car.color || 'Черный', icon: Palette },
                                { label: 'Двигатель', value: `${car.fuel_type || 'Бензин'}`, icon: Fuel },
                                { label: 'Руль', value: car.steering || '—', icon: Settings },
                                { label: 'Класс', value: car.car_class || '—', icon: Car },
                                { label: 'Коробка', value: car.transmission || '—', icon: Settings },
                            ].map((spec: any, idx) => (
                                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0 group">
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <spec.icon className="h-4 w-4" />
                                        <span className="text-sm">{spec.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Additional Info Section */}
                        <div className="space-y-3 pt-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Дополнительно</h3>
                            <p className="text-sm text-slate-600 font-medium">
                                Налог уплачен, Техосмотр пройден, Вложений не требует
                            </p>
                        </div>

                        {/* Action Buttons Container */}
                        <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex flex-col gap-3">
                            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 h-12 rounded-xl font-bold shadow-sm">
                                Написать сообщение
                            </Button>
                            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-bold shadow-md shadow-blue-500/20">
                                Показать телефон
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
