"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Upload, X, ArrowLeft, Trash2 } from "lucide-react";
import { getCachedDictionaries } from "@/lib/dictionaries";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function EditCarContent() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();

    const [loadingDicts, setLoadingDicts] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dictionaries
    const [categories, setCategories] = useState<any[]>([]);
    const [marks, setMarks] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [engines, setEngines] = useState<any[]>([]);
    const [bodies, setBodies] = useState<any[]>([]);
    const [transmissions, setTransmissions] = useState<any[]>([]);
    const [colors, setColors] = useState<any[]>([]);
    const [steeringOptions, setSteeringOptions] = useState<any[]>([]);
    const [conditionOptions, setConditionOptions] = useState<any[]>([]);
    const [carClassOptions, setCarClassOptions] = useState<any[]>([]);

    // Form data
    const [formData, setFormData] = useState<any>({
        images: []
    });
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [initialDataStr, setInitialDataStr] = useState<string>("");

    // Fetch Car Data
    const { data: car, isLoading: carLoading } = useQuery({
        queryKey: ['car', id],
        queryFn: async () => {
            const res = await apiClient.get(`/cars/${id}`) as any;
            return res?.data ?? res;
        },
        enabled: !!id
    });

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            const returnUrl = searchParams.get("returnUrl") || `/cars/${id}/edit`;
            router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        }
        loadDictionaries();
    }, [user, authLoading, router, searchParams, id]);

    useEffect(() => {
        if (car && user) {
            if (Number(car.author_id) !== Number(user.id) && user.role !== "admin") {
                toast.error("У вас нет прав для редактирования этого объявления");
                router.push(`/cars/${id}`);
                return;
            }

            const initialForm = {
                name: car.name || "",
                price_per_day: car.price_per_day || "",
                category_id: car.category_id ? String(car.category_id) : "",
                vehicle_mark_id: car.vehicle_mark_id ? String(car.vehicle_mark_id) : "",
                vehicle_model_id: car.vehicle_model_id ? String(car.vehicle_model_id) : "",
                description: car.description || "",
                city_id: car.city_id ? String(car.city_id) : "",
                release_year: car.release_year || "",
                mileage: car.mileage || "",
                body_type: car.body_type || "",
                fuel_type_id: car.fuel_type_id ? String(car.fuel_type_id) : "",
                color_id: car.color_id ? String(car.color_id) : "",
                steering_id: car.steering_id ? String(car.steering_id) : "",
                condition_id: car.condition_id ? String(car.condition_id) : "",
                car_class_id: car.car_class_id ? String(car.car_class_id) : "",
                transmission_id: car.transmission_id ? String(car.transmission_id) : "",
                additional_info: car.additional_info || "",
                images: [] // new images
            };

            setFormData(initialForm);
            setExistingImages(car.images || []);
            setInitialDataStr(JSON.stringify(initialForm));

            if (car.vehicle_mark_id) {
                loadModels(car.vehicle_mark_id);
            }
        }
    }, [car, user, id, router]);

    const loadDictionaries = async () => {
        setLoadingDicts(true);
        try {
            const [categoriesData, marksData, citiesData, enginesData, bodiesData, transmissionsData, colorsData, steeringData, conditionData, carClassData] = await Promise.all([
                getCachedDictionaries("CATEGORY"),
                getCachedDictionaries("MARKA"),
                getCachedDictionaries("CITY"),
                getCachedDictionaries("FUEL"),
                getCachedDictionaries("BODY"),
                getCachedDictionaries("TRANSMISSION"),
                getCachedDictionaries("COLOR"),
                getCachedDictionaries("STEERING"),
                getCachedDictionaries("CONDITION"),
                getCachedDictionaries("CAR_CLASS")
            ]);

            setCategories(categoriesData || []);
            setMarks(marksData || []);
            setCities(citiesData || []);
            setEngines(enginesData || []);
            setBodies(bodiesData || []);
            setTransmissions(transmissionsData || []);
            setColors(colorsData || []);
            setSteeringOptions(steeringData || []);
            setConditionOptions(conditionData || []);
            setCarClassOptions(carClassData || []);
        } catch (err) {
            toast.error('Ошибка загрузки справочников');
        } finally {
            setLoadingDicts(false);
        }
    };

    const loadModels = async (markId: number | string) => {
        try {
            const res = await apiClient.get(`/dictionaries/model/${markId}`) as any;
            const data = Array.isArray(res) ? res : (res?.data || []);
            setModels(data);
        } catch (err) {
            console.error('Failed to load models:', err);
        }
    };

    const handleChange = (name: string, value: any) => {
        if (name === 'price_per_day') {
            const num = typeof value === 'string' ? parseInt(value, 10) : value;
            if (!isNaN(num) && num < 0) return;
        }
        if (name === 'mileage' || name === 'release_year') {
            const num = typeof value === 'string' ? parseInt(value, 10) : value;
            if (!isNaN(num) && num < 0) return;
            if (name === 'release_year' && !isNaN(num) && num > 2026) return;
        }
        if (name === 'vehicle_mark_id') {
            loadModels(value);
            setFormData((prev: any) => ({ ...prev, vehicle_mark_id: value, vehicle_model_id: "" }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setFormData({ ...formData, images: [...formData.images, ...files] });
        }
    };

    const removeNewImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const removeExistingImage = async (imageId: number) => {
        if (!confirm("Удалить это фото?")) return;
        try {
            await apiClient.delete(`/cars/${id}/images/${imageId}`);
            setExistingImages(existingImages.filter(img => img.id !== imageId));
            toast.success("Фото удалено");
        } catch (err) {
            toast.error("Ошибка при удалении фото");
        }
    };

    const handleDeleteAd = async () => {
        if (!confirm("Уверены что хотите удалить объявление?")) return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/cars/${id}`);
            toast.success("Объявление удалено");
            router.push("/profile");
        } catch (err) {
            toast.error("Ошибка при удалении");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (saveAsDraft: boolean = false) => {
        const hasAnyImage = (existingImages.length + (formData.images?.length ?? 0)) > 0;

        if (!formData.name?.trim() || formData.price_per_day == null || formData.price_per_day === '' || !formData.category_id || !formData.vehicle_mark_id) {
            toast.error('Заполните основные поля: Заголовок, Цена, Категория, Марка');
            return;
        }
        if (!hasAnyImage) {
            toast.error('Добавьте хотя бы одно фото');
            return;
        }

        if (!saveAsDraft) {
            const required = [
                formData.city_id,
                formData.release_year,
                formData.color_id,
                formData.fuel_type_id,
                formData.body_type != null && String(formData.body_type).trim() !== '',
                formData.steering_id,
                formData.mileage != null && String(formData.mileage).trim() !== '',
                formData.transmission_id,
                formData.condition_id,
                formData.car_class_id,
            ];
            if (required.some((v) => !v)) {
                toast.error('Заполните все обязательные поля (Город, Цвет, Год, Двигатель, Кузов, Руль, Пробег, Коробка, Состояние, Класс)');
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = new FormData();

            Object.entries(formData).forEach(([key, val]: [string, any]) => {
                if (key === 'images') return;
                if (val !== undefined && val !== null && val !== '') {
                    payload.append(key, val.toString());
                }
            });

            payload.append('save_as_draft', saveAsDraft ? 'true' : 'false');

            (formData.images || []).forEach((file: File) => {
                payload.append('images', file);
            });

            await apiClient.put(`/cars/${id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Изменения успешно сохранены');
            queryClient.invalidateQueries({ queryKey: ['car', id] });
            router.push(`/cars/${id}`);
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.detail || error?.response?.data?.message || 'Ошибка при сохранении';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSubmitting(false);
        }
    };

    const hasChanges = () => {
        const { images, ...currentData } = formData;
        return initialDataStr !== JSON.stringify(currentData) || images.length > 0;
    };

    if (authLoading || carLoading) {
        return <div className="container py-20 text-center">Загрузка данных...</div>;
    }

    if (!user) return null;

    return (
        <div className="container max-w-4xl px-4 sm:px-0 py-8 sm:py-12">
            <div className="mb-4 sm:mb-8 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-black truncate">
                        Редактирование
                    </h1>
                </div>
                <Button
                    variant="outline"
                    className="hidden sm:inline-flex text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 font-bold"
                    onClick={handleDeleteAd}
                    disabled={isDeleting}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Удалить
                </Button>
            </div>

            {/* Мобилка: кнопка удаления на всю ширину под заголовком */}
            <div className="mb-4 sm:hidden">
                <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl"
                    onClick={handleDeleteAd}
                    disabled={isDeleting}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Удалить
                </Button>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">

                {/* 1. Основное */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">Основная информация</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Заголовок <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Введите заголовок"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="rounded-xl h-12 bg-slate-50 border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Цена <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                placeholder="Введите цену"
                                value={formData.price_per_day || ''}
                                onChange={(e) => handleChange('price_per_day', e.target.value)}
                                className="rounded-xl h-12 bg-slate-50 border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Категория <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(val) => handleChange('category_id', val)} value={formData.category_id}>
                            <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Марка <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('vehicle_mark_id', val)} value={formData.vehicle_mark_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите марку" />
                                </SelectTrigger>
                                <SelectContent>
                                    {marks.map((m) => (
                                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Модель</Label>
                            <Select
                                onValueChange={(val) => handleChange('vehicle_model_id', val)}
                                value={formData.vehicle_model_id}
                                disabled={!formData.vehicle_mark_id}
                            >
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите модель" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((m) => (
                                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 2. Детали */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">Детали</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Город <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('city_id', val)} value={formData.city_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите город" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Цвет <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('color_id', val)} value={formData.color_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Укажите цвет" />
                                </SelectTrigger>
                                <SelectContent>
                                    {colors.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Год выпуска <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                placeholder="Введите год"
                                value={formData.release_year || ''}
                                onChange={(e) => handleChange('release_year', e.target.value)}
                                className="rounded-xl h-12 bg-slate-50 border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Двигатель <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('fuel_type_id', val)} value={formData.fuel_type_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите двигатель" />
                                </SelectTrigger>
                                <SelectContent>
                                    {engines.map((e) => (
                                        <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Кузов <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Укажите кузов"
                                value={formData.body_type || ''}
                                onChange={(e) => handleChange('body_type', e.target.value)}
                                className="rounded-xl h-12 bg-slate-50 border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Руль <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('steering_id', val)} value={formData.steering_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите руль" />
                                </SelectTrigger>
                                <SelectContent>
                                    {steeringOptions.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Пробег <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                placeholder="Пробег"
                                value={formData.mileage || ''}
                                onChange={(e) => handleChange('mileage', e.target.value)}
                                className="rounded-xl h-12 bg-slate-50 border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Коробка <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('transmission_id', val)} value={formData.transmission_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите коробку" />
                                </SelectTrigger>
                                <SelectContent>
                                    {transmissions.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Состояние <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('condition_id', val)} value={formData.condition_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите состояние" />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditionOptions.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Класс машины <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('car_class_id', val)} value={formData.car_class_id}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите класс" />
                                </SelectTrigger>
                                <SelectContent>
                                    {carClassOptions.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 3. Фото */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">Фотографии</h2>

                    <div className="space-y-4">
                        <Label>Текущие фото</Label>
                        {existingImages.length === 0 && <p className="text-sm text-slate-400">Нет загруженных фото</p>}
                        <div className="grid grid-cols-4 gap-4">
                            {existingImages.map((img: any) => (
                                <div key={img.id} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group">
                                    <img src={img.url} alt="Car" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.id)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 mt-6">
                        <Label>Добавить новые фото</Label>
                        <div className="grid grid-cols-4 gap-4">
                            {formData.images.map((file: File, index: number) => (
                                <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {(existingImages.length + formData.images.length) < 10 && (
                                <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                                    <Upload size={24} className="text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-500">Добавить</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Описание */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">Дополнительно</h2>
                    <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                            placeholder="Введите описание"
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            maxLength={500}
                            className="rounded-xl min-h-[120px] bg-slate-50 border-transparent resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Кратко дополнительно</Label>
                        <Textarea
                            placeholder="Например, не бит, не крашен"
                            value={formData.additional_info || ''}
                            onChange={(e) => handleChange('additional_info', e.target.value)}
                            maxLength={100}
                            className="rounded-xl min-h-[80px] bg-slate-50 border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button onClick={() => handleSubmit(true)} disabled={submitting || !hasChanges()} variant="outline" size="lg" className="flex-1 rounded-xl h-14 text-lg border-2 border-slate-200 hover:border-slate-300 font-bold">
                        {submitting ? 'Сохранение...' : 'Сохранить как черновик'}
                    </Button>
                    <Button onClick={() => handleSubmit(false)} disabled={submitting || !hasChanges()} size="lg" className="flex-1 rounded-xl h-14 text-lg font-bold">
                        {submitting ? 'Отправка...' : (car?.status === 'DRAFT' || car?.status === 'REJECT') ? 'Отправить на модерацию' : 'Сохранить изменения'}
                    </Button>
                </div>
                {car?.status === 'ACTIVE' && (
                    <p className="text-center text-xs text-amber-500 font-bold mt-2">
                        При сохранении изменений активное объявление отправится на повторную модерацию.
                    </p>
                )}

            </div>
        </div>
    );
}

export default function EditCarPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center text-slate-500">Загрузка...</div>}>
            <EditCarContent />
        </Suspense>
    );
}
