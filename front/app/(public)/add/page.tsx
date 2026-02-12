"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Upload, X } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getCachedDictionaries } from "@/lib/dictionaries";

export default function AddCarPage() {
    const router = useRouter();
    const { city } = useAppState();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Dictionaries
    const [categories, setCategories] = useState<any[]>([]);
    const [marks, setMarks] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [engines, setEngines] = useState<any[]>([]);
    const [bodies, setBodies] = useState<any[]>([]);
    const [transmissions, setTransmissions] = useState<any[]>([]);
    const [colors, setColors] = useState<any[]>([]);

    // Form data
    const [formData, setFormData] = useState<any>({
        city: city,
        images: []
    });

    useEffect(() => {
        // Load initial dictionaries
        loadDictionaries();
    }, []);

    useEffect(() => {
        // Load models when mark changes
        if (formData.vehicle_mark_id) {
            loadModels(formData.vehicle_mark_id);
        }
    }, [formData.vehicle_mark_id]);

    const loadDictionaries = async () => {
        setLoading(true);
        try {
            // Using getCachedDictionaries for better performance and caching
            const [categoriesData, marksData, citiesData, enginesData, bodiesData, transmissionsData, colorsData] = await Promise.all([
                getCachedDictionaries("CATEGORY"),
                getCachedDictionaries("MARKA"),
                getCachedDictionaries("CITY"),
                getCachedDictionaries("FUEL"),
                getCachedDictionaries("BODY"),
                getCachedDictionaries("TRANSMISSION"),
                getCachedDictionaries("COLOR")
            ]);

            setCategories(categoriesData || []);
            setMarks(marksData || []);
            setCities(citiesData || []);
            setEngines(enginesData || []);
            setBodies(bodiesData || []);
            setTransmissions(transmissionsData || []);
            setColors(colorsData || []);
        } catch (err) {
            console.error('Failed to load dictionaries:', err);
            toast.error('Ошибка загрузки справочников');
        } finally {
            setLoading(false);
        }
    };

    const loadModels = async (markId: number) => {
        try {
            const res = await apiClient.get(`/dictionaries/model/${markId}`);
            setModels(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load models:', err);
        }
    };

    const handleChange = (name: string, value: any) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setFormData({ ...formData, images: [...formData.images, ...files] });
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const handleNext = () => {
        // Validation for step 1
        if (step === 1) {
            if (!formData.name || !formData.price_per_day || !formData.category_id || !formData.vehicle_mark_id) {
                toast.error('Пожалуйста, заполните все обязательные поля');
                return;
            }
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        // Validation for step 2
        if (!formData.city_id || !formData.release_year) {
            toast.error('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();

            // Append all form fields
            Object.entries(formData).forEach(([key, val]: [string, any]) => {
                if (key !== 'images' && val !== undefined && val !== null && val !== '') {
                    payload.append(key, val.toString());
                }
            });

            // Append images
            formData.images.forEach((file: File) => {
                payload.append('images', file);
            });

            await apiClient.post('/cars', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Объявление отправлено на модерацию!');
            router.push('/profile');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Ошибка при создании объявления');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container py-20 text-center">Загрузка...</div>;
    }

    return (
        <div className="container max-w-3xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Подать объявление</h1>
                <div className="flex items-center gap-4 mt-6">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>
                        1
                    </div>
                    <div className={`flex-1 h-1 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>
                        2
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                {step === 1 ? (
                    <div className="space-y-6">
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

                        <div className="space-y-2">
                            <Label>Фото</Label>
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    {formData.images.map((file: File, index: number) => (
                                        <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < 4 && (
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

                        <div className="space-y-2">
                            <Label>Описание</Label>
                            <Textarea
                                placeholder="Введите описание"
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                maxLength={250}
                                className="rounded-xl min-h-[120px] bg-slate-50 border-transparent resize-none"
                            />
                            <p className="text-xs text-slate-500 text-right">{formData.description?.length || 0}/250</p>
                        </div>

                        <Button onClick={handleNext} size="lg" className="w-full rounded-xl h-14 text-lg">
                            Далее
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
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
                                <Label>Цвет</Label>
                                <Select onValueChange={(val) => handleChange('color_id', val)} value={formData.color_id}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Введите цвет" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label>Двигатель</Label>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Кузов</Label>
                                <Input
                                    placeholder="Выберите кузов"
                                    value={formData.body_type || ''}
                                    onChange={(e) => handleChange('body_type', e.target.value)}
                                    className="rounded-xl h-12 bg-slate-50 border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Руль</Label>
                                <Select onValueChange={(val) => handleChange('steering', val)} value={formData.steering}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Выберите руль" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LEFT">Левый</SelectItem>
                                        <SelectItem value="RIGHT">Правый</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Пробег</Label>
                                <Input
                                    type="number"
                                    placeholder="Введите пробег"
                                    value={formData.mileage || ''}
                                    onChange={(e) => handleChange('mileage', e.target.value)}
                                    className="rounded-xl h-12 bg-slate-50 border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Коробка</Label>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Состояние</Label>
                                <Select onValueChange={(val) => handleChange('condition', val)} value={formData.condition}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Выберите состояние" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXCELLENT">Отличное</SelectItem>
                                        <SelectItem value="GOOD">Хорошее</SelectItem>
                                        <SelectItem value="FAIR">Удовлетворительное</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Растаможен</Label>
                                <Select onValueChange={(val) => handleChange('customs_cleared', val)} value={formData.customs_cleared}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Выберите категорию" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Да</SelectItem>
                                        <SelectItem value="false">Нет</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Дополнительно</Label>
                            <Textarea
                                placeholder="Введите дополнительные сведения"
                                value={formData.additional_info || ''}
                                onChange={(e) => handleChange('additional_info', e.target.value)}
                                maxLength={100}
                                className="rounded-xl min-h-[80px] bg-slate-50 border-transparent resize-none"
                            />
                            <p className="text-xs text-slate-500 text-right">{formData.additional_info?.length || 0}/100</p>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1 rounded-xl h-14 text-lg">
                                Назад
                            </Button>
                            <Button onClick={handleSubmit} disabled={submitting} size="lg" className="flex-1 rounded-xl h-14 text-lg">
                                {submitting ? 'Отправка...' : 'Опубликовать'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
