"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Car,
    Truck,
    Construction,
    Wrench,
    Ship,
    Grid,
    Camera,
    ChevronLeft,
    CheckCircle2,
    Info,
    ArrowRight,
    X
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
    { id: 1, label: "Легковые", icon: Car, color: "bg-blue-50 text-blue-600" },
    { id: 2, label: "Грузовые", icon: Truck, color: "bg-indigo-50 text-indigo-600" },
    { id: 3, label: "Техника", icon: Construction, color: "bg-amber-50 text-amber-600" },
    { id: 4, label: "Оборудование", icon: Wrench, color: "bg-emerald-50 text-emerald-600" },
    { id: 5, label: "Водный", icon: Ship, color: "bg-cyan-50 text-cyan-600" },
    { id: 6, label: "Прочее", icon: Grid, color: "bg-slate-50 text-slate-600" },
];

export default function AddAnnouncement() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        category: null,
        brand: "",
        model: "",
        color: "",
        volume: "",
        fuel: "Бензин",
        gearbox: "Автомат",
        mileage: "",
        description: "",
        release_year: "2023",
        price: ""
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = window.localStorage.getItem("token");
        if (!token) {
            router.push("/login?redirect=/add");
        }
    }, [router]);

    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    const handleCategorySelect = (id: any) => {
        setFormData({ ...formData, category: id });
        setTimeout(handleNext, 300);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newPhotos = [...photos];
            newPhotos[index] = file;
            setPhotos(newPhotos);

            const newPreviews = [...previews];
            newPreviews[index] = URL.createObjectURL(file);
            setPreviews(newPreviews);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...photos];
        const newPreviews = [...previews];
        newPhotos[index] = undefined as any;
        newPreviews[index] = undefined as any;
        setPhotos(newPhotos);
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", `${formData.brand} ${formData.model}`);
            data.append("marka_id", "1"); // Mock
            data.append("model_id", "1"); // Mock
            data.append("description", formData.description || "Аренда автомобиля");
            data.append("release_year", formData.release_year);

            photos.forEach((photo) => {
                if (photo) data.append("photos", photo);
            });

            await apiClient.post("/cars", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setStep(5); // Success step
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении. Проверьте авторизацию.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Elegant Top Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={step === 1 ? () => router.back() : handleBack}
                        className="p-2 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <h2 className="font-black text-sm uppercase tracking-widest text-primary">
                        {step === 5 ? "Готово" : `Шаг ${step} из 4`}
                    </h2>
                    <div className="w-10"></div>
                </div>
                {/* Progress Bar */}
                {step < 5 && (
                    <div className="h-1 bg-slate-50 w-full overflow-hidden">
                        <div
                            className="h-full bg-accent transition-all duration-500 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="max-w-2xl mx-auto p-6 md:py-12">

                {/* STEP 1: CATEGORY */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-black tracking-tight">Что вы сдаете?</h1>
                            <p className="text-slate-400 font-medium tracking-tight">Выберите категорию вашего объявления</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`group flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all duration-300
                                        ${formData.category === cat.id
                                            ? "border-accent bg-accent/5 shadow-xl shadow-accent/10"
                                            : "border-white bg-white shadow-premium hover:border-slate-100"}`}
                                >
                                    <div className={`p-4 rounded-2xl transition-all duration-300 ${cat.color} 
                                        ${formData.category === cat.id ? "scale-110 rotate-6" : "group-hover:scale-110"}`}>
                                        <cat.icon size={32} />
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: BASIC INFO */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight">Основные данные</h1>
                            <p className="text-slate-400 font-medium">Расскажите базовую информацию о транспорте</p>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Марка и Модель</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Напр. Toyota"
                                        className="input-premium"
                                    />
                                    <input
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        placeholder="Напр. Camry"
                                        className="input-premium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Год выпуска</label>
                                    <input
                                        name="release_year"
                                        type="number"
                                        value={formData.release_year}
                                        onChange={handleInputChange}
                                        className="input-premium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Цена / день (₸)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="15000"
                                        className="input-premium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Описание</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Особенности, условия аренды, доп. оборудование..."
                                    className="input-premium resize-none"
                                />
                            </div>
                        </div>

                        <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
                            Далее <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* STEP 3: SPECS */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight">Характеристики</h1>
                            <p className="text-slate-400 font-medium">Укажите детали для фильтрации в поиске</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">КПП</label>
                                <select name="gearbox" value={formData.gearbox} onChange={handleInputChange} className="input-premium appearance-none">
                                    <option>Автомат</option>
                                    <option>Механика</option>
                                    <option>Робот</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Топливо</label>
                                <select name="fuel" value={formData.fuel} onChange={handleInputChange} className="input-premium appearance-none">
                                    <option>Бензин</option>
                                    <option>Дизель</option>
                                    <option>Газ</option>
                                    <option>Электро</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Объем (л)</label>
                                <input name="volume" value={formData.volume} onChange={handleInputChange} className="input-premium" placeholder="2.5" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Цвет</label>
                                <input name="color" value={formData.color} onChange={handleInputChange} className="input-premium" placeholder="Белый" />
                            </div>
                        </div>

                        <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
                            Далее <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* STEP 4: PHOTOS */}
                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-3xl font-black tracking-tight">Добавьте фото</h1>
                            <p className="text-slate-400 font-medium">Качественные фото повышают шанс аренды на 70%</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((idx) => (
                                <div key={idx} className="relative aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 transition-all hover:border-accent group overflow-hidden">
                                    {previews[idx] ? (
                                        <>
                                            <Image src={previews[idx]} alt="Preview" fill className="object-cover" />
                                            <button
                                                onClick={() => removePhoto(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-danger transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                            <div className="p-3 rounded-2xl bg-white shadow-premium group-hover:scale-110 transition-transform">
                                                <Camera className="w-6 h-6 text-accent" />
                                            </div>
                                            <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {idx === 0 ? "Главное фото" : "Добавить фото"}
                                            </span>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, idx)} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 flex gap-3">
                            <Info className="text-warning shrink-0" size={20} />
                            <p className="text-xs leading-relaxed text-amber-700 font-medium">
                                Мы рекомендуем загружать горизонтальные фото при дневном свете. Первое фото будет на обложке.
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? "Публикация..." : "Опубликовать объявление"}
                        </button>
                    </div>
                )}

                {/* STEP 5: SUCCESS */}
                {step === 5 && (
                    <div className="py-12 space-y-8 text-center animate-in zoom-in duration-500">
                        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 bg-success/10 rounded-full animate-ping duration-[2000ms]"></div>
                            <div className="relative z-10 p-8 bg-success rounded-full text-white shadow-2xl shadow-success/40">
                                <CheckCircle2 size={64} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-black tracking-tight">Успешно опубликовано!</h1>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto">
                                Ваше объявление отправлено на модерацию. Обычно это занимает не более 15 минут.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-6">
                            <button onClick={() => router.push('/')} className="btn-primary">На главную</button>
                            <Link href="/profile" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors py-2">Перейти в мои объявления</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
