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
import { DictionarySelect } from "@/components/shared/DictionarySelect";
import { useTranslation } from "@/hooks/useTranslation";


function AddCarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { city } = useAppState();
    const { user, isLoading: authLoading } = useAuth();
    const { t, formatMessage } = useTranslation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [photoError, setPhotoError] = useState('');
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

    //const totalSteps = subscriptionCheck?.subscriptions_enabled && !subscriptionCheck?.first_ad_free && !subscriptionCheck?.has_active_subscription ? 3 : 2;
    const totalSteps = subscriptionCheck?.subscriptions_enabled ? 3 : 2;

    const loadDictionaries = async () => {
        setLoading(true);
        try {
            const [categoriesData, citiesData, enginesData, bodiesData, transmissionsData, colorsData, steeringData, conditionData, carClassData] = await Promise.all([
                getCachedDictionaries("CATEGORY"),
                getCachedDictionaries("CITY"),
                getCachedDictionaries("FUEL"),
                getCachedDictionaries("BODY"),
                getCachedDictionaries("TRANSMISSION"),
                getCachedDictionaries("COLOR"),
                getCachedDictionaries("STEERING"),
                getCachedDictionaries("CONDITION"),
                getCachedDictionaries("CAR_CLASS")
            ]);


            // Все справочники берём только из бэка. Если что‑то не вернулось — показываем пустой список.
            setCategories(categoriesData || []);
            setCities(citiesData || []);

            setEngines(enginesData || []);
            setBodies(bodiesData || []);
            setTransmissions(transmissionsData || []);
            setColors(colorsData || []);
            setSteeringOptions(steeringData || []);
            setConditionOptions(conditionData || []);
            setConditionOptions(conditionData || []);
            setCarClassOptions(carClassData || []);
        } catch (err) {
            toast.error(t('common.error_loading_dictionaries'));
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

        // Всегда используем только данные из бэка; если их нет — оставляем список пустым.
        // Это сигнал, что словари не настроены.
        // (UI покажет пустой список моделей.)
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
            setFormData((prev: any) => ({ ...prev, vehicle_mark_id: value, vehicle_model_id: "" }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setFormData({ ...formData, images: [...formData.images, ...files] });
            setPhotoError('');
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const isStep1Filled =
        (formData.category_id != null && formData.category_id !== '') &&
        (formData.vehicle_mark_id != null && formData.vehicle_mark_id !== '') &&
        (formData.name != null && String(formData.name).trim() !== '') &&
        (formData.price_per_day != null && formData.price_per_day !== '') &&
        (formData.images?.length ?? 0) > 0;

    const handleNext = () => {
        if (step === 1) {
            if (!formData.category_id || formData.category_id === '') {
                toast.error(t('add_car.category_placeholder'));
                return;
            }
            if (!formData.vehicle_mark_id || formData.vehicle_mark_id === '') {
                toast.error(t('add_car.marka_placeholder'));
                return;
            }
            if (!formData.name?.trim()) {
                toast.error(t('add_car.header_placeholder'));
                return;
            }
            if (formData.price_per_day == null || formData.price_per_day === '') {
                toast.error(t('add_car.price_placeholder'));
                return;
            }
            const hasPhoto = (formData.images?.length ?? 0) > 0;
            if (!hasPhoto) {
                setPhotoError(t('add_car.photo_error'));
                return;
            }
            setPhotoError('');
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
            toast.error(formatMessage(e?.message) || t('add_car.pay_error'));
        }
    };

    const handleSubmit = async (saveAsDraft: boolean = false, options?: { stayOnPage?: boolean }) => {
        // Validation for step 2 (не требуем всё для черновика)
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
                toast.error(t('common.enter_all_fields'));
                return;
            }
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
                toast.success(t('common.saved_draft'));
            } else {
                toast.success(t('common.moderation'));
            }

            if (!options?.stayOnPage) {
                router.push('/profile');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(formatMessage(error?.message || error?.response?.data?.message) || t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!user && !authLoading) {
        return <div className="container px-4 py-12 sm:py-20 text-center text-slate-600">{t('common.redirecting_to_login')}</div>;
    }
    if (loading && !subscriptionCheck && user) {
        return <div className="container px-4 py-12 sm:py-20 text-center text-slate-600">{t('common.loading')}</div>;
    }

    return (
        <div className="container max-w-3xl px-4 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-12">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black mb-2">{t('add_car.title')}</h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-4 sm:mt-6">
                    <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 text-sm sm:text-base ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>1</div>
                    <div className={`flex-1 h-1 min-w-2 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
                    <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 text-sm sm:text-base ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>2</div>
                    {totalSteps === 3 && (
                        <>
                            <div className={`flex-1 h-1 min-w-2 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
                            <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 text-sm sm:text-base ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>3</div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                {step === 1 ? (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.header')} <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder={t('add_car.header_placeholder')}
                                    value={formData.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 touch-manipulation shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.price')} <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder={t('add_car.price_placeholder')}
                                    min={0}
                                    value={formData.price_per_day || ''}
                                    onChange={(e) => handleChange('price_per_day', e.target.value)}
                                    className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 touch-manipulation shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">{t('add_car.category')} <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => handleChange('category_id', val)} value={formData.category_id != null ? String(formData.category_id) : undefined}>
                                <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                    <SelectValue placeholder={t('add_car.category_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                                <Label className="text-sm">{t('add_car.marka')} <span className="text-red-500">*</span></Label>
                                <DictionarySelect
                                    type="MARKA"
                                    value={formData.vehicle_mark_id ? String(formData.vehicle_mark_id) : null}
                                    onChange={(val) => handleChange('vehicle_mark_id', val)}
                                    placeholder={t('add_car.marka_placeholder')}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm">{t('add_car.model')}</Label>
                                <DictionarySelect
                                    type="MODEL"
                                    parentId={formData.vehicle_mark_id ? parseInt(formData.vehicle_mark_id) : undefined}
                                    value={formData.vehicle_model_id ? String(formData.vehicle_model_id) : null}
                                    onChange={(val) => handleChange('vehicle_model_id', val)}
                                    placeholder={t('add_car.model_placeholder')}
                                    disabled={!formData.vehicle_mark_id}
                                />
                            </div>
                        </div>


                        <div className="space-y-2">
                            <Label className="text-sm">{t('add_car.photos')} <span className="text-red-500">* </span></Label>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {formData.images.map((file: File, index: number) => (
                                        <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1.5 sm:p-1 hover:bg-red-600 touch-manipulation"
                                            >
                                                <X size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < 4 && (
                                        <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors touch-manipulation">
                                            <Upload size={22} className="sm:w-6 sm:h-6 text-slate-400 mb-1 sm:mb-2" />
                                            <span className="text-xs text-slate-500">{t('add_car.add_photo')}</span>
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
                                {photoError && <p className="text-sm text-red-500">{photoError}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">{t('add_car.description')}</Label>
                            <Textarea
                                placeholder={t('add_car.description_placeholder')}
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                maxLength={250}
                                className="rounded-xl min-h-[100px] sm:min-h-[120px] bg-white border-slate-200 shadow-sm resize-none text-base"
                            />
                            <p className="text-xs text-slate-500 text-right">{formData.description?.length || 0}/250</p>
                        </div>

                        <Button
                            type="button"
                            onClick={handleNext}
                            size="lg"
                            className="w-full rounded-xl h-12 sm:h-14 text-base sm:text-lg touch-manipulation"
                            disabled={!isStep1Filled}
                        >
                            {t('common.next')}
                        </Button>
                    </div>
                ) : step === 2 ? (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.city')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('city_id', val)} value={formData.city_id}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.city_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.color')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('color_id', val)} value={formData.color_id}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.color_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.year')} <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder="2026"
                                    min={1900}
                                    max={2026}
                                    value={formData.release_year || ''}
                                    onChange={(e) => handleChange('release_year', e.target.value)}
                                    className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm touch-manipulation"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.fuel')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('fuel_type_id', val)} value={formData.fuel_type_id}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.fuel_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {engines.map((e) => (
                                            <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.body')} <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder={t('add_car.body_placeholder')}
                                    value={formData.body_type || ''}
                                    onChange={(e) => handleChange('body_type', e.target.value)}
                                    className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm touch-manipulation"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.steering')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('steering_id', val)} value={formData.steering_id ? String(formData.steering_id) : undefined}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.steering_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {steeringOptions.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.mileage')} <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    placeholder={t('add_car.mileage_placeholder')}
                                    min={0}
                                    value={formData.mileage || ''}
                                    onChange={(e) => handleChange('mileage', e.target.value)}
                                    className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm touch-manipulation"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.transmission')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('transmission_id', val)} value={formData.transmission_id}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.transmission_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transmissions.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.condition')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('condition_id', val)} value={formData.condition_id ? String(formData.condition_id) : undefined}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.condition_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conditionOptions.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">{t('add_car.car_class')} <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => handleChange('car_class_id', val)} value={formData.car_class_id ? String(formData.car_class_id) : undefined}>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 bg-white border-slate-200 shadow-sm">
                                        <SelectValue placeholder={t('add_car.car_class_placeholder')} />
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
                            <Label className="text-sm">{t('add_car.additional')}</Label>
                            <Textarea
                                placeholder={t('add_car.additional_placeholder')}
                                value={formData.additional_info || ''}
                                onChange={(e) => handleChange('additional_info', e.target.value)}
                                maxLength={100}
                                className="rounded-xl min-h-[72px] sm:min-h-[80px] bg-slate-50 border-transparent resize-none text-base"
                            />
                            <p className="text-xs text-slate-500 text-right">{formData.additional_info?.length || 0}/100</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1 rounded-xl h-12 sm:h-14 text-base sm:text-lg touch-manipulation">
                                {t('common.back')}
                            </Button>
                            {totalSteps === 3 ? (
                                <Button
                                    onClick={async () => {
                                        if (!createdCarId) {
                                            await handleSubmit(true, { stayOnPage: true });
                                        }
                                        setStep(3);
                                    }}
                                    disabled={submitting}
                                    size="lg"
                                    className="flex-1 rounded-xl h-12 sm:h-14 text-base sm:text-lg touch-manipulation"
                                >
                                    {submitting ? t('common.loading') : t('add_car.payment_next')}
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => handleSubmit(true)} disabled={submitting} variant="outline" size="lg" className="flex-1 rounded-xl h-12 sm:h-14 text-base sm:text-lg touch-manipulation">
                                        {submitting ? '...' : t('common.drafts')}
                                    </Button>
                                    <Button onClick={() => handleSubmit(false)} disabled={submitting} size="lg" className="flex-1 rounded-xl h-12 sm:h-14 text-base sm:text-lg touch-manipulation">
                                        {submitting ? t('common.loading') : t('common.publish')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ) : step === 3 ? (
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-lg sm:text-xl font-bold">{t('add_car.subscription')}</h2>
                        <p className="text-slate-600 text-sm sm:text-base">{t('add_car.subscription_desc')}</p>
                        <div className="space-y-3 sm:space-y-4">
                            {subscriptionCheck?.plans?.map((plan) => (
                                <div key={plan.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">{plan.name}</p>
                                        <p className="text-sm text-slate-500">{plan.period_days} дн. · до {plan.price_kzt} ₸</p>
                                    </div>
                                    <Button onClick={() => handleBuyPlan(plan.id)} className="gap-2 w-full sm:w-auto shrink-0 h-11 sm:h-10 touch-manipulation">
                                        <CreditCard size={18} /> {t('add_car.buy')} {plan.price_kzt} ₸
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <Button onClick={() => setStep(2)} variant="outline" size="lg" className="rounded-xl h-12 sm:h-14 w-full sm:w-auto touch-manipulation">
                                {t('common.back')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function AddCarPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="container py-20 text-center text-slate-500">{t('common.loading')}</div>}>
            <AddCarContent />
        </Suspense>
    );
}
