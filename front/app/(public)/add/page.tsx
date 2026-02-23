"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Upload, X, CreditCard } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getCachedDictionaries } from "@/lib/dictionaries";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

function AddCarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { city } = useAppState();
    const { user, isLoading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createdCarId, setCreatedCarId] = useState<number | null>(null);
    const [subscriptionCheck, setSubscriptionCheck] = useState<{
        subscriptions_enabled: boolean;
        first_ad_free: boolean;
        has_active_subscription: boolean;
        plans: { id: number; name: string; code: string; price_kzt: number; period_days: number }[];
    } | null>(null);

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
        city: city,
        images: []
    });

    // Требуем авторизацию: редирект на логин с returnUrl
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            const returnUrl = searchParams.get("returnUrl") || "/add";
            router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        }
        loadDictionaries();
    }, [user, authLoading, router, searchParams]);

    useEffect(() => {
        if (user) {
            apiClient.get("/settings").then((r: any) => {
                const data = r?.data ?? r;
                if (data?.subscriptions_enabled) {
                    apiClient.get("/subscriptions/check").then((c: any) => {
                        const d = c?.data ?? c;
                        setSubscriptionCheck({
                            subscriptions_enabled: true,
                            first_ad_free: !!d?.first_ad_free,
                            has_active_subscription: !!d?.has_active_subscription,
                            plans: d?.plans || [],
                        });
                    }).catch(() => setSubscriptionCheck({ subscriptions_enabled: false, first_ad_free: false, has_active_subscription: false, plans: [] }));
                } else {
                    setSubscriptionCheck({ subscriptions_enabled: false, first_ad_free: false, has_active_subscription: false, plans: [] });
                }
            }).catch(() => setSubscriptionCheck({ subscriptions_enabled: false, first_ad_free: false, has_active_subscription: false, plans: [] }));
        }
    }, [user]);

    useEffect(() => {
        // Load models when mark changes
        if (formData.vehicle_mark_id) {
            loadModels(formData.vehicle_mark_id);
        }
    }, [formData.vehicle_mark_id]);

    const totalSteps = subscriptionCheck?.subscriptions_enabled && !subscriptionCheck?.first_ad_free && !subscriptionCheck?.has_active_subscription ? 3 : 2;

    const loadDictionaries = async () => {
        setLoading(true);
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

            const fallbackCategories = [
                { id: 1, name: 'Легковые' },
                { id: 2, name: 'Спецтехника' },
                { id: 3, name: 'Водный транспорт' },
                { id: 4, name: 'Грузовые' },
                { id: 5, name: 'Мотоциклы' }
            ];

            const fallbackMarks = [
                { id: 1, name: 'Mercedes-Benz' },
                { id: 2, name: 'Toyota' },
                { id: 3, name: 'BMW' },
                { id: 4, name: 'Audi' },
                { id: 5, name: 'Lexus' },
                { id: 6, name: 'Tesla' },
                { id: 7, name: 'Hyundai' }
            ];

            const fallbackCities = [
                { id: 1, name: 'Алматы' },
                { id: 2, name: 'Астана' },
                { id: 3, name: 'Шымкент' },
                { id: 4, name: 'Караганда' }
            ];

            setCategories(categoriesData?.length ? categoriesData : fallbackCategories);
            setMarks(marksData?.length ? marksData : fallbackMarks);
            setCities(citiesData?.length ? citiesData : fallbackCities);
            setEngines(enginesData || [
                { id: 1, name: 'Бензин' },
                { id: 2, name: 'Дизель' },
                { id: 3, name: 'Электро' },
                { id: 4, name: 'Гибрид' }
            ]);
            setBodies(bodiesData || [
                { id: 1, name: 'Седан' },
                { id: 2, name: 'Внедорожник' },
                { id: 3, name: 'Купе' },
                { id: 4, name: 'Минивэн' }
            ]);
            setTransmissions(transmissionsData || [
                { id: 1, name: 'Автомат' },
                { id: 2, name: 'Механика' },
                { id: 3, name: 'Робот' },
                { id: 4, name: 'Вариатор' }
            ]);
            setColors(colorsData || [
                { id: 1, name: 'Белый' },
                { id: 2, name: 'Черный' },
                { id: 3, name: 'Серый' },
                { id: 4, name: 'Синий' }
            ]);
            setSteeringOptions(steeringData?.length ? steeringData : [
                { id: 1, name: 'Слева', code: 'LEFT' },
                { id: 2, name: 'Справа', code: 'RIGHT' }
            ]);
            setConditionOptions(conditionData?.length ? conditionData : [
                { id: 1, name: 'Отличное', code: 'EXCELLENT' },
                { id: 2, name: 'Хорошее', code: 'GOOD' },
                { id: 3, name: 'Удовлетворительное', code: 'FAIR' }
            ]);
            setCarClassOptions(carClassData?.length ? carClassData : [
                { id: 1, name: 'Эконом', code: 'ECONOMY' },
                { id: 2, name: 'Комфорт', code: 'COMFORT' },
                { id: 3, name: 'Бизнес', code: 'BUSINESS' },
                { id: 4, name: 'Премиум', code: 'PREMIUM' },
                { id: 5, name: 'Внедорожник', code: 'SUV' }
            ]);
        } catch (err) {
            console.error('Failed to load dictionaries:', err);
            toast.error('Ошибка загрузки справочников');
        } finally {
            setLoading(false);
        }
    };

    const loadModels = async (markId: number) => {
        try {
            const res = await apiClient.get(`/dictionaries/model/${markId}`) as any;
            const data = Array.isArray(res) ? res : (res?.data || []);

            if (data.length > 0) {
                setModels(data);
                return;
            }
        } catch (err) {
            console.error('Failed to load models:', err);
        }

        // Fallback models based on markId
        const fallbackModelsMap: Record<number, any[]> = {
            1: [ // Mercedes
                { id: 101, name: 'S-Class' }, { id: 102, name: 'E-Class' }, { id: 103, name: 'G-Class' }, { id: 104, name: 'GLE' }
            ],
            2: [ // Toyota
                { id: 201, name: 'Camry' }, { id: 202, name: 'Corolla' }, { id: 203, name: 'Land Cruiser 300' }, { id: 204, name: 'RAV4' }
            ],
            3: [ // BMW
                { id: 301, name: '5 Series' }, { id: 302, name: '7 Series' }, { id: 303, name: 'X5' }, { id: 304, name: 'M5' }
            ],
            4: [ // Audi
                { id: 401, name: 'A6' }, { id: 402, name: 'Q7' }, { id: 403, name: 'RS7' }
            ],
            5: [ // Lexus
                { id: 501, name: 'ES' }, { id: 502, name: 'RX' }, { id: 503, name: 'LX 570' }
            ],
            6: [ // Tesla
                { id: 601, name: 'Model S' }, { id: 602, name: 'Model 3' }, { id: 603, name: 'Model X' }
            ],
            7: [ // Hyundai
                { id: 701, name: 'Elantra' }, { id: 702, name: 'Santa Fe' }, { id: 703, name: 'Tucson' }
            ]
        };

        setModels(fallbackModelsMap[Number(markId)] || []);
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
        if (step === 1) {
            if (!formData.name || !formData.price_per_day || !formData.category_id || !formData.vehicle_mark_id) {
                toast.error('Пожалуйста, заполните все обязательные поля');
                return;
            }
            setStep(2);
        }
    };

    const handleBuyPlan = async (planId: number) => {
        try {
            const r = await apiClient.post("/subscriptions/buy", { plan_id: planId, provider: "tiptoppay" }) as any;
            const d = r?.data ?? r;
            if (d?.payment_url) {
                window.location.href = d.payment_url;
            } else {
                toast.error("Не удалось получить ссылку на оплату");
            }
        } catch (e: any) {
            // e = { data, code, message } с message {ru, kk, en} или строкой
            const msgObj = e?.message;
            let msg = "Ошибка при создании платежа";
            if (typeof msgObj === "string") {
                msg = msgObj;
            } else if (msgObj && typeof msgObj === "object") {
                msg = msgObj.ru || msgObj.en || Object.values(msgObj)[0] || msg;
            }
            toast.error(msg);
        }
    };

    const handleSubmit = async (saveAsDraft: boolean = false, options?: { stayOnPage?: boolean }) => {
        // Validation for step 2 (не требуем всё для черновика)
        if (!saveAsDraft && (!formData.city_id || !formData.release_year)) {
            toast.error('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();

            // Append all form fields (except images array)
            Object.entries(formData).forEach(([key, val]: [string, any]) => {
                if (key === 'images' || key === 'city') return;
                if (val !== undefined && val !== null && val !== '') {
                    payload.append(key, val.toString());
                }
            });

            payload.append('save_as_draft', saveAsDraft ? 'true' : 'false');

            // Append images
            (formData.images || []).forEach((file: File) => {
                payload.append('images', file);
            });

            const res = await apiClient.post('/cars', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }) as any;

            const created = res?.data ?? res;
            if (created && created.id) {
                setCreatedCarId(created.id);
            }

            if (saveAsDraft) {
                toast.success('Сохранено в черновики');
            } else {
                toast.success('Объявление отправлено на модерацию!');
            }

            if (!options?.stayOnPage) {
                router.push('/profile');
            }
        } catch (error: any) {
            console.error(error);
            const msgObj = error?.message || error?.response?.data?.message;
            let msg = 'Ошибка при создании объявления';
            if (typeof msgObj === 'string') {
                msg = msgObj;
            } else if (msgObj && typeof msgObj === 'object') {
                msg = msgObj.ru || msgObj.en || Object.values(msgObj)[0] || msg;
            }
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user && !authLoading) {
        return <div className="container py-20 text-center">Перенаправление на вход...</div>;
    }
    if (loading && !subscriptionCheck && user) {
        return <div className="container py-20 text-center">Загрузка...</div>;
    }

    return (
        <div className="container max-w-3xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Подать объявление</h1>
                <div className="flex items-center gap-2 mt-6">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>1</div>
                    <div className={`flex-1 h-1 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>2</div>
                    {totalSteps === 3 && (
                        <>
                            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>3</div>
                        </>
                    )}
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
                ) : step === 2 ? (
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
                                <Select onValueChange={(val) => handleChange('steering_id', val)} value={formData.steering_id ? String(formData.steering_id) : undefined}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Выберите руль" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {steeringOptions.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
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
                                <Select onValueChange={(val) => handleChange('condition_id', val)} value={formData.condition_id ? String(formData.condition_id) : undefined}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Выберите состояние" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conditionOptions.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Класс машины</Label>
                                <Select onValueChange={(val) => handleChange('car_class_id', val)} value={formData.car_class_id ? String(formData.car_class_id) : undefined}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                        <SelectValue placeholder="Выберите класс" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {carClassOptions.map((cls) => (
                                            <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
                                        ))}
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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1 rounded-xl h-14 text-lg">
                                Назад
                            </Button>
                            {totalSteps === 3 ? (
                                <Button
                                    onClick={async () => {
                                        // При переходе к оплате сразу сохраняем объявление в черновик
                                        if (!createdCarId) {
                                            await handleSubmit(true, { stayOnPage: true });
                                        }
                                        setStep(3);
                                    }}
                                    disabled={submitting}
                                    size="lg"
                                    className="flex-1 rounded-xl h-14 text-lg"
                                >
                                    {submitting ? 'Сохранение...' : 'Далее — Оплата'}
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => handleSubmit(true)} disabled={submitting} variant="outline" size="lg" className="flex-1 rounded-xl h-14 text-lg">
                                        {submitting ? '...' : 'В черновики'}
                                    </Button>
                                    <Button onClick={() => handleSubmit(false)} disabled={submitting} size="lg" className="flex-1 rounded-xl h-14 text-lg">
                                        {submitting ? 'Отправка...' : 'Опубликовать'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ) : step === 3 ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Подписка</h2>
                        <p className="text-slate-600">Для размещения объявления выберите тариф и оплатите через TipTopPay.</p>
                        <div className="space-y-4">
                            {subscriptionCheck?.plans?.map((plan) => (
                                <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                    <div>
                                        <p className="font-semibold">{plan.name}</p>
                                        <p className="text-sm text-slate-500">{plan.period_days} дн. · до {plan.price_kzt} ₸</p>
                                    </div>
                                    <Button onClick={() => handleBuyPlan(plan.id)} className="gap-2">
                                        <CreditCard size={18} /> Купить {plan.price_kzt} ₸
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={() => setStep(2)} variant="outline" size="lg" className="rounded-xl h-14">
                                Назад
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function AddCarPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center text-slate-500">Загрузка...</div>}>
            <AddCarContent />
        </Suspense>
    );
}
