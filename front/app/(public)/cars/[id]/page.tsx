"use client";

import { useCar } from "@/hooks/useCars";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
    Palette,
    Star,
    Send,
    Copy
} from "lucide-react";

export default function CarDetailsPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);
    const { user } = useAuth();
    const { data: car, isLoading } = useCar(id);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    // Track view
    useEffect(() => {
        if (user && id && car) {
            apiClient.post(`/users/events/view/${id}`).catch(() => { });
        }
    }, [user, id, car]);

    // Check if liked
    useEffect(() => {
        if (user && id) {
            apiClient.get('/users/likes').then((res: any) => {
                const likes = res?.data || [];
                if (likes.find((l: any) => l.car_id === id)) {
                    setIsLiked(true);
                }
            }).catch(() => { });
        }
    }, [user, id]);

    // Fetch Reviews
    const { data: reviews } = useQuery({
        queryKey: ['reviews', id],
        queryFn: async () => {
            const res = await apiClient.get(`/reviews/car/${id}`) as any;
            return res?.data || [];
        },
        enabled: !!id
    });

    const toggleLike = async () => {
        if (!user) {
            alert(t("car_details.auth_required_like"));
            return;
        }
        try {
            if (isLiked) {
                await apiClient.delete(`/users/likes/${id}`);
                setIsLiked(false);
            } else {
                await apiClient.post(`/users/likes/${id}`);
                setIsLiked(true);
            }
        } catch (e) { }
    };

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const title = car?.name || t("dictionary.any_female");

        // 1) Пытаемся вызвать системную отправку (share sheet)
        if (typeof navigator !== "undefined" && typeof (navigator as any).share === "function") {
            try {
                await (navigator as any).share({
                    title,
                    text: title,
                    url,
                });
                return;
            } catch (err: any) {
                // Пользователь закрыл — не показываем ошибку
                if (err?.name === "AbortError") return;
                // Иначе падаем в fallback-меню
            }
        }

        // 2) Fallback: показываем удобное меню вариантов отправки
        if (url) {
            setShareOpen(true);
            return;
        }

        toast.error(t("car_details.share_error"));
    };

    const copyLink = async () => {
        try {
            const url = typeof window !== "undefined" ? window.location.href : "";
            if (!url) {
                toast.error(t("car_details.copy_link_error"));
                return;
            }

            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                toast.success(t("car_details.copy_link_success"));
                return;
            }

            if (typeof document !== "undefined") {
                const textarea = document.createElement("textarea");
                textarea.value = url;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                textarea.style.top = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try {
                    const ok = document.execCommand("copy");
                    if (ok) {
                        toast.success(t("car_details.copy_link_success"));
                    } else {
                        toast.info(url);
                    }
                } finally {
                    document.body.removeChild(textarea);
                }
                return;
            }

            toast.info(url);
        } catch {
            toast.error(t("car_details.copy_link_error"));
        }
    };

    const handleApply = async () => {
        if (!user) {
            alert(t("car_details.auth_required_apply"));
            return;
        }
        setIsApplying(true);
        try {
            const formData = new FormData();
            formData.append("city_id", String(car?.city_id || 1));
            if (car?.category_id) formData.append("category_id", String(car.category_id));
            if (car?.vehicle_mark_id) formData.append("vehicle_mark_id", String(car.vehicle_mark_id));
            if (car?.vehicle_model_id) formData.append("vehicle_model_id", String(car.vehicle_model_id));
            formData.append("message", t("car_details.apply_message_auto", { name: car?.name }));

            await apiClient.post("/applications", formData);
            alert(t("car_details.apply_success"));
        } catch (e: any) {
            alert(t("car_details.apply_error"));
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">{t("car_details.loading")}</p>
        </div>
    );

    if (!car) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center mb-8 relative">
                <Car className="w-10 h-10 text-slate-300" />
                <div className="absolute top-0 right-0 -mr-2 -mt-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-slate-50">!</div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">{t("car_details.not_found")}</h1>
            <p className="text-slate-500 max-w-xs mb-8">
                Похоже, это объявление удалено или перенесено в архив. Попробуйте найти что-то другое в каталоге.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button asChild className="h-14 rounded-2xl font-black text-white shadow-lg shadow-primary/20">
                    <Link href="/catalog">Перейти в каталог</Link>
                </Button>
                <Button variant="ghost" className="h-14 rounded-2xl font-bold text-slate-500" onClick={() => router.push('/')}>
                    На главную
                </Button>
            </div>
        </div>
    );

    const images = car.images && car.images.length > 0 ? car.images : [{ url: "https://via.placeholder.com/800x600?text=No+Image" }];
    const currentMainImage = mainImage || images[0].url;

    // Remove empty specs to show only what we have
    const specs = [
        { label: t("add_car.city"), value: car.city, icon: MapPin },
        { label: t("add_car.marka"), value: car.mark, icon: Car },
        { label: t("add_car.model"), value: car.model, icon: Car },
        { label: t("add_car.year"), value: car.release_year, icon: Calendar },
        { label: t("add_car.body"), value: car.body_type, icon: Car },
        { label: t("add_car.condition"), value: car.condition, icon: Info },
        { label: t("add_car.category"), value: car.category, icon: Car },
        { label: t("add_car.color"), value: car.color, icon: Palette },
        { label: t("add_car.fuel"), value: car.fuel_type ? `${car.fuel_type} ${car.engine_volume ? car.engine_volume : ''}` : car.engine_volume, icon: Fuel },
        { label: t("add_car.steering"), value: car.steering, icon: Settings },
        { label: t("add_car.car_class"), value: car.car_class, icon: Car },
        { label: t("add_car.transmission"), value: car.transmission, icon: Settings },
        { label: t("add_car.mileage"), value: car.mileage ? `${car.mileage} км` : null, icon: Gauge },
    ].filter(spec => spec.value);

    // DEBUG AUTH
    if (typeof window !== "undefined") {
        console.log("DEBUG AUTH:", { userId: user?.id, userRole: user?.role, carAuthorId: car.author_id });
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Share fallback sheet (если Web Share API недоступен) */}
            <Sheet open={shareOpen} onOpenChange={setShareOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto p-0">
                    <SheetHeader className="p-4 pr-12 border-b border-slate-100">
                        <SheetTitle className="text-left text-lg font-black">{t("car_details.share")}</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 space-y-3">
                        <a
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 hover:bg-slate-50 touch-manipulation"
                            href={`https://wa.me/?text=${encodeURIComponent(`${car?.name || t("dictionary.any_female")} ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                                <MessageCircle className="h-4 w-4" />
                            </span>
                            <span className="truncate">WhatsApp</span>
                        </a>
                        <a
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 hover:bg-slate-50 touch-manipulation"
                            href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(car?.name || t("dictionary.any_female"))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                                <Send className="h-4 w-4" />
                            </span>
                            <span className="truncate">Telegram</span>
                        </a>
                        <a
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 hover:bg-slate-50 touch-manipulation"
                            href={`mailto:?subject=${encodeURIComponent(car?.name || t("dictionary.any_female"))}&body=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                <ClipboardList className="h-4 w-4" />
                            </span>
                            <span className="truncate">Email</span>
                        </a>
                        <a
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 hover:bg-slate-50 touch-manipulation"
                            href={`sms:?&body=${encodeURIComponent(`${car?.name || t("dictionary.any_female")} ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                <MessageCircle className="h-4 w-4" />
                            </span>
                            <span className="truncate">SMS</span>
                        </a>
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 hover:bg-slate-50 touch-manipulation"
                            onClick={copyLink}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                <Copy className="h-4 w-4" />
                            </span>
                            <span className="truncate">{t("car_details.copy_link")}</span>
                        </button>
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl font-bold"
                            onClick={() => setShareOpen(false)}
                        >
                            {t("car_details.close")}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Top Bar */}
            <div className="bg-white border-b mb-8 sticky top-0 z-10">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-slate-500 hover:text-slate-900"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> {t("car_details.back")}
                        </Button>
                        <Link href={`/cars/${id}`} className="text-sm font-medium text-slate-400 hover:text-slate-600 hover:underline">
                            {t("car_details.ad")}
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={isLiked ? "text-red-500" : "text-slate-400"}
                            onClick={toggleLike}
                        >
                            <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400" onClick={handleShare}>
                            <Share2 className="h-5 w-5" />
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
                            {images.map((img: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img.url)}
                                    className={`relative w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentMainImage === img.url ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <Image src={img.url} alt={`${car.name} ${idx + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Description */}
                        {(car.description || car.additional_info) && (
                            <div className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900">{t("car_details.description")}</h3>
                                {car.description && (
                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                        {car.description}
                                    </p>
                                )}
                                {car.additional_info && (
                                    <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t("car_details.additional")}</h4>
                                        <p className="text-sm text-slate-600 font-medium">
                                            {car.additional_info}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews */}
                        {reviews && reviews.length > 0 && (
                            <div className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    {t("car_details.reviews")} ({reviews.length})
                                </h3>
                                <div className="space-y-4">
                                    {reviews.map((review: any) => (
                                        <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-center gap-1 mb-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                                                    />
                                                ))}
                                            </div>
                                            {review.comment && <p className="text-slate-600 text-sm">{review.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div className="space-y-8">
                        {/* Title & Price */}
                        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {car.name} {car.release_year ? `${car.release_year} ${t("add_car.year").toLowerCase()}` : ''}
                                    </h1>
                                </div>
                                <div className="text-right pl-4">
                                    <div className="text-2xl font-black text-primary whitespace-nowrap">
                                        {car.price_per_day} ₸ <span className="text-sm font-medium text-slate-400 block">/ {t("car_details.day")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2 text-sm text-slate-600 font-medium">
                                {[
                                    car.city || 'Алматы',
                                    car.mark,
                                    car.model,
                                    car.release_year,
                                    car.color
                                ].filter(Boolean).join(' • ')}
                            </div>
                        </div>

                        {/* Specs Table */}
                        {specs.length > 0 && (
                            <details className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-900 text-lg">
                                    {t("car_details.specs")}
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="space-y-3 mt-4">
                                    {specs.map((spec: any, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover-group">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                    <spec.icon className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                                <span className="text-sm">{spec.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 text-right max-w-[50%]">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}

                        {/* Action Buttons Container */}
                        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-500/5 ring-1 ring-slate-100 flex flex-col gap-4 sticky top-24">
                            {Number(user?.id) === Number(car.author_id) || user?.role === 'admin' ? (
                                <>
                                    <h3 className="font-bold text-slate-900 flex items-center justify-between">
                                        <span>{t("car_details.my_ad")}</span>
                                        <span className={`text-xs px-2 py-1 rounded-md font-bold text-white ${car.status === 'PUBLISHED' ? 'bg-green-500' : car.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                            {car.status === "PUBLISHED" ? t("car_details.status_active") : car.status === "ACTIVE" ? t("car_details.status_active") : car.status === "DRAFT" ? t("car_details.status_draft") : t("car_details.status_moderation")}
                                        </span>
                                    </h3>
                                    <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-xl font-bold shadow-md shadow-slate-500/20">
                                        <Link href={`/cars/${car.id}/edit`}>
                                            {t("car_details.edit")}
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-slate-400" /> {t("car_details.owner_contacts")}
                                    </h3>
                                    {car.author?.name && (
                                        <p className="text-sm font-semibold text-slate-700 mb-2">{car.author.name}</p>
                                    )}
                                    {car.author?.phone_number ? (
                                        <>
                                            <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12 rounded-xl font-bold shadow-md shadow-green-500/20">
                                                <a href={`https://wa.me/${car.author.phone_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                    {t("car_details.write_whatsapp")}
                                                </a>
                                            </Button>
                                            <Button asChild variant="outline" className="w-full border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 h-12 rounded-xl font-bold transition-all">
                                                <a href={`tel:${car.author.phone_number}`}>
                                                    {t("car_details.call")} {car.author.phone_number}
                                                </a>
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-center text-sm font-medium text-slate-500 py-3 bg-slate-50 rounded-xl">
                                            {t("car_details.no_contacts")}
                                        </p>
                                    )}

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-100" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-400 font-semibold">{t("car_details.or")}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleApply}
                                        disabled={isApplying}
                                        className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold shadow-md shadow-primary/20"
                                    >
                                        {isApplying ? t("car_details.sending") : t("car_details.apply_online")}
                                    </Button>
                                    <p className="text-xs text-center text-slate-400 px-4">
                                        {t("car_details.apply_note")}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
