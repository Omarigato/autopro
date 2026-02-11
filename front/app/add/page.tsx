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
    X,
    FileText,
    Settings
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { getCachedDictionaries } from "@/lib/dictionaries";
import Link from "next/link";
import Image from "next/image";

export default function AddAnnouncement() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        category: null,
        brandId: "",
        brandName: "",
        modelId: "",
        modelName: "",
        colorId: "",
        volume: "2.0",
        fuelId: "",
        transmissionId: "",
        cityId: "",
        description: "",
        release_year: new Date().getFullYear().toString(),
        price: "",
        // Technical numbers
        transport_number: "",
        motor_number: "",
        body_number: "",
        tech_passport_number: "",
        tech_passport_date: ""
    });

    const [dictionaries, setDictionaries] = useState<any>({
        categories: [],
        marks: [],
        models: [],
        transmissions: [],
        fuels: [],
        colors: [],
        cities: []
    });

    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = window.localStorage.getItem("token");
        if (!token) {
            router.push("/login?redirect=/add");
            return;
        }

        const fetchAll = async () => {
            const [categories, marks, transmissions, fuels, colors, cities] = await Promise.all([
                getCachedDictionaries("CATEGORY"),
                getCachedDictionaries("MARKA"),
                getCachedDictionaries("TRANSMISSION"),
                getCachedDictionaries("FUEL"),
                getCachedDictionaries("COLOR"),
                getCachedDictionaries("CITY")
            ]);

            setDictionaries({
                categories,
                marks,
                transmissions,
                fuels,
                colors,
                cities,
                models: []
            });
        };

        fetchAll();
    }, [router]);

    // Fetch models with cache
    useEffect(() => {
        if (formData.brandId) {
            getCachedDictionaries("MODEL", formData.brandId).then(models => {
                setDictionaries((prev: any) => ({ ...prev, models }));
            });
        }
    }, [formData.brandId]);

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

    const handleSelectChange = (name: string, value: any, label?: string) => {
        const updates: any = { [name]: value };
        if (name === "brandId") {
            updates.brandName = label;
            updates.modelId = "";
            updates.modelName = "";
        }
        if (name === "modelId") updates.modelName = label;
        setFormData({ ...formData, ...updates });
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
        newPhotos.splice(index, 1);
        newPreviews.splice(index, 1);
        setPhotos(newPhotos);
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", `${formData.brandName} ${formData.modelName}`);
            data.append("description", formData.description || "Аренда транспорта");
            data.append("vehicle_mark_id", formData.brandId);
            data.append("vehicle_model_id", formData.modelId);
            data.append("category_id", formData.category);
            data.append("transmission_id", formData.transmissionId);
            data.append("fuel_type_id", formData.fuelId);
            data.append("color_id", formData.colorId);
            data.append("city_id", formData.cityId);
            data.append("engine_volume", formData.volume);
            data.append("price_per_day", formData.price);
            data.append("release_year", formData.release_year);

            // Technical details
            data.append("transport_number", formData.transport_number);
            data.append("motor_number", formData.motor_number);
            data.append("body_number", formData.body_number);
            data.append("tech_passport_number", formData.tech_passport_number);
            data.append("tech_passport_date", formData.tech_passport_date);

            photos.forEach((photo) => {
                if (photo) data.append("photos", photo);
            });

            await apiClient.post("/cars", data);
            setStep(6); // Success step
        } catch (e) {
            console.error(e);
            alert("Ошибка при сохранении объявления");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">

            {/* Steps Indicator */}
            <div className="flex justify-between items-center mb-12">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex items-center ${i !== 5 ? 'flex-1' : ''}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all shadow-premium
                            ${step === i ? 'bg-primary text-white scale-110' : step > i ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}
                        `}>
                            {step > i ? <CheckCircle2 size={20} /> : i}
                        </div>
                        {i !== 5 && <div className={`flex-1 h-1 mx-4 rounded-full ${step > i ? 'bg-emerald-500' : 'bg-slate- object-cover100'}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Category */}
            {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-primary tracking-tight">Что вы хотите сдать в аренду?</h1>
                        <p className="text-slate-400 font-medium">Выберите подходящую категорию транспорта</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {dictionaries.categories.map((cat: any) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className={`group p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/5 flex flex-col items-center gap-4 ${formData.category === cat.id ? 'border-accent shadow-xl ring-4 ring-accent/5' : ''}`}
                            >
                                <div className={`p-5 rounded-3xl bg-slate-50 group-hover:bg-accent group-hover:text-white transition-all`}>
                                    <Car size={32} />
                                </div>
                                <span className="font-black text-xs uppercase tracking-widest text-primary">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Main Info */}
            {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium space-y-8">
                        <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-3">
                            <Info className="text-accent" /> Основная информация
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Марка</label>
                                <select
                                    className="input-premium"
                                    value={formData.brandId}
                                    onChange={(e) => handleSelectChange("brandId", e.target.value, e.target.options[e.target.selectedIndex].text)}
                                >
                                    <option value="">Выберите марку</option>
                                    {dictionaries.marks.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Модель</label>
                                <select
                                    className="input-premium"
                                    disabled={!formData.brandId}
                                    value={formData.modelId}
                                    onChange={(e) => handleSelectChange("modelId", e.target.value, e.target.options[e.target.selectedIndex].text)}
                                >
                                    <option value="">Выберите модель</option>
                                    {dictionaries.models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Город</label>
                                <select name="cityId" value={formData.cityId} onChange={handleInputChange} className="input-premium">
                                    <option value="">Выберите город</option>
                                    {dictionaries.cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Год выпуска</label>
                                <input type="number" name="release_year" value={formData.release_year} onChange={handleInputChange} className="input-premium" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={handleBack} className="btn-secondary !rounded-2xl py-5 px-10">Назад</button>
                        <button onClick={handleNext} disabled={!formData.modelId} className="btn-primary !rounded-2xl flex-1 flex items-center justify-center gap-2 py-5">
                            Далее <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Technical Specs */}
            {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium space-y-8">
                        <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-3">
                            <Settings className="text-accent" /> Характеристики
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">КПП</label>
                                <select name="transmissionId" value={formData.transmissionId} onChange={handleInputChange} className="input-premium">
                                    <option value="">Выберите тип</option>
                                    {dictionaries.transmissions.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Топливо</label>
                                <select name="fuelId" value={formData.fuelId} onChange={handleInputChange} className="input-premium">
                                    <option value="">Выберите топливо</option>
                                    {dictionaries.fuels.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Цвет</label>
                                <select name="colorId" value={formData.colorId} onChange={handleInputChange} className="input-premium">
                                    <option value="">Выберите цвет</option>
                                    {dictionaries.colors.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Объем двигателя (л)</label>
                                <input type="text" name="volume" placeholder="2.5" value={formData.volume} onChange={handleInputChange} className="input-premium" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Цена за сутки (₸)</label>
                            <input type="number" name="price" placeholder="15000" value={formData.price} onChange={handleInputChange} className="w-full text-4xl font-black tracking-tighter text-primary border-none bg-slate-50 focus:bg-white focus:ring-8 focus:ring-primary/5 rounded-[2rem] px-8 py-8 transition-all" />
                        </div>
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={handleBack} className="btn-secondary !rounded-2xl py-5 px-10">Назад</button>
                        <button onClick={handleNext} className="btn-primary !rounded-2xl flex-1 py-5">Продолжить</button>
                    </div>
                </div>
            )}

            {/* Step 4: Documents (NEW) */}
            {step === 4 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium space-y-8">
                        <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-3">
                            <FileText className="text-accent" /> Технические данные
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Гос. Номер</label>
                                <input type="text" name="transport_number" placeholder="001AAA01" value={formData.transport_number} onChange={handleInputChange} className="input-premium uppercase" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Номер техпаспорта</label>
                                <input type="text" name="tech_passport_number" placeholder="ST000000" value={formData.tech_passport_number} onChange={handleInputChange} className="input-premium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Номер кузова (VIN)</label>
                                <input type="text" name="body_number" value={formData.body_number} onChange={handleInputChange} className="input-premium uppercase" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Дата выдачи техпаспорта</label>
                                <input type="date" name="tech_passport_date" value={formData.tech_passport_date} onChange={handleInputChange} className="input-premium" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Номер двигателя (если есть)</label>
                                <input type="text" name="motor_number" value={formData.motor_number} onChange={handleInputChange} className="input-premium uppercase" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={handleBack} className="btn-secondary !rounded-2xl py-5 px-10">Назад</button>
                        <button onClick={handleNext} className="btn-primary !rounded-2xl flex-1 py-5">Перейти к фото</button>
                    </div>
                </div>
            )}

            {/* Step 5: Photos */}
            {step === 5 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium space-y-8">
                        <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-3">
                            <Camera className="text-accent" /> Фотографии
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="relative group aspect-square">
                                    {previews[i] ? (
                                        <>
                                            <Image src={previews[i]} alt="Preview" fill className="rounded-3xl object-cover" />
                                            <button onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 p-2 bg-white text-danger rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                                        </>
                                    ) : (
                                        <label className="w-full h-full rounded-3xl border-4 border-dashed border-slate-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent/20 hover:bg-slate-50 transition-all text-slate-200 hover:text-accent">
                                            <Camera size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Добавить</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, i)} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Описание</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="input-premium resize-none" placeholder="Расскажите о состоянии авто, условиях аренды..." />
                        </div>
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={handleBack} className="btn-secondary !rounded-2xl py-5 px-10">Назад</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || photos.length === 0}
                            className="btn-primary !rounded-2xl flex-1 flex items-center justify-center gap-3 py-5 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={22} />}
                            {loading ? 'Публикация...' : 'Опубликовать'}
                        </button>
                    </div>
                </div>
            )}

            {/* Success */}
            {step === 6 && (
                <div className="text-center py-20 space-y-8 animate-in zoom-in duration-500">
                    <div className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                        <CheckCircle2 size={64} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-primary tracking-tight">Объявление создано!</h2>
                        <p className="text-slate-400 font-medium max-w-sm mx-auto">Ваше авто отправлено на модерацию. Обычно это занимает от 15 минут до 2 часов.</p>
                    </div>
                    <Link href="/" className="btn-primary inline-flex py-5 px-12 !rounded-2xl">На главную</Link>
                </div>
            )}
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <Grid className={`animate-pulse ${className}`} />; // Simple fallback icon
}
