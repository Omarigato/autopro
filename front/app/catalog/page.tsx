"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Filter,
    Car as CarIcon,
    ChevronRight,
    Star,
    MapPin,
    Clock,
    SlidersHorizontal,
    LayoutGrid,
    List as ListIcon,
    X
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { getCachedDictionaries } from "@/lib/dictionaries";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import Image from "next/image";

function CatalogContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category");

    const [cars, setCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState("ru");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filters logic
    const [filters, setFilters] = useState({
        category: initialCategory || "",
        brand: "",
        priceMax: "",
        transmission: "",
        fuel: ""
    });

    const [dictionaries, setDictionaries] = useState<any>({
        categories: [],
        marks: [],
        transmissions: [],
        fuels: []
    });

    const t = useTranslation(lang);

    useEffect(() => {
        setLang(window.localStorage.getItem("lang") || "ru");

        const fetchAll = async () => {
            const [categories, marks, transmissions, fuels] = await Promise.all([
                getCachedDictionaries("CATEGORY"),
                getCachedDictionaries("MARKA"),
                getCachedDictionaries("TRANSMISSION"),
                getCachedDictionaries("FUEL")
            ]);

            setDictionaries({
                categories,
                marks,
                transmissions,
                fuels
            });
        };

        fetchAll();
        fetchCars();
    }, []);

    const fetchCars = async () => {
        setLoading(true);
        try {
            const res: any = await apiClient.get("/cars");
            setCars(res || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredCars = cars.filter(car => {
        if (filters.category && car.category_id && car.category_id.toString() !== filters.category) return false;
        // Simple search logic for demo
        return true;
    });

    return (
        <div className="container-page py-10 space-y-12 min-h-screen">

            {/* Catalog Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-primary">
                        {t('catalog')} <span className="text-accent underline decoration-accent/20">Профи</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Безопасная аренда транспорта по всему Казахстану</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 !rounded-2xl ${showFilters ? 'bg-primary text-white border-primary' : ''}`}
                    >
                        <Filter size={18} /> {t('filters')}
                    </button>
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                {/* Filters Sidebar (Desktop) */}
                <aside className={`lg:col-span-1 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-premium sticky top-24">
                        <div className="flex items-center justify-between mb-8 lg:hidden">
                            <h3 className="font-black text-xl">Фильтры</h3>
                            <button onClick={() => setShowFilters(false)}><X /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Category */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Категория</label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleFilterChange("category", "")}
                                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${!filters.category ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        Все виды
                                    </button>
                                    {dictionaries.categories.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleFilterChange("category", c.id.toString())}
                                            className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${filters.category === c.id.toString() ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price range */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Макс. цена (₸)</label>
                                <input
                                    type="range" min="0" max="100000" step="5000"
                                    value={filters.priceMax || 100000}
                                    onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                                    className="w-full accent-accent"
                                />
                                <div className="flex justify-between text-[10px] font-black text-slate-400">
                                    <span>0 ₸</span>
                                    <span>{filters.priceMax || '100 000'} ₸</span>
                                </div>
                            </div>

                            <button onClick={fetchCars} className="btn-primary w-full text-xs !py-4 shadow-xl shadow-primary/10">Применить</button>
                        </div>
                    </div>
                </aside>

                {/* Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-slate-50 animate-pulse rounded-[3rem]" />)}
                        </div>
                    ) : filteredCars.length > 0 ? (
                        <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {filteredCars.map((car) => (
                                <Link
                                    key={car.id}
                                    href={`/cars/${car.id}`}
                                    className={`group bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-500 flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}
                                >
                                    <div className={`relative ${viewMode === 'list' ? 'w-2/5 aspect-square' : 'aspect-[4/3] w-full'} overflow-hidden`}>
                                        {car.images?.[0] ? (
                                            <Image src={car.images[0].url} alt={car.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="bg-slate-50 w-full h-full flex items-center justify-center text-slate-200"><CarIcon size={64} strokeWidth={1} /></div>
                                        )}
                                        <div className="absolute top-6 left-6">
                                            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-white">Premium</span>
                                        </div>
                                    </div>
                                    <div className={`p-8 flex flex-col justify-between ${viewMode === 'list' ? 'w-3/5' : 'w-full'}`}>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black tracking-tight text-primary leading-tight">{car.name}</h3>
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                        <MapPin size={14} className="text-accent" /> {car.city}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl">
                                                    <Star size={14} className="text-warning fill-warning" />
                                                    <span className="text-xs font-black text-warning">4.9</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{car.release_year} год</span>
                                                </div>
                                                {car.transmission && (
                                                    <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                                                        <SlidersHorizontal size={14} className="text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-500 uppercase">Авто</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-3xl font-black text-primary tracking-tighter">{car.price_per_day?.toLocaleString() || '15 000'} ₸</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">день</p>
                                            </div>
                                            <div className="p-4 bg-accent text-white rounded-2xl group-hover:scale-110 transition-transform shadow-xl shadow-accent/20">
                                                <ChevronRight />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center space-y-6 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-premium text-slate-200">
                                <Search size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-primary tracking-tight">Ничего не нашли?</h3>
                                <p className="text-slate-400 font-medium">Попробуйте изменить параметры поиска или фильтры</p>
                            </div>
                            <button onClick={() => setFilters({ category: "", brand: "", priceMax: "", transmission: "", fuel: "" })} className="btn-secondary !rounded-2xl mx-auto">Сбросить всё</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<div className="container-page py-32 text-center text-slate-400">Загрузка каталога...</div>}>
            <CatalogContent />
        </Suspense>
    );
}
