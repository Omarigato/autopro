"use client";

import { useCars } from "@/hooks/useCars";
import { useFullDictionaries } from "@/hooks/useDictionaries";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Car,
    Filter,
    Calendar,
    Gauge,
    Settings,
    Search,
    MapPin,
    ChevronRight,
    SlidersHorizontal,
    LayoutGrid,
    Info,
    ChevronDown,
    Layers,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function CatalogPage() {
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const [filterMarka, setFilterMarka] = useState<string | null>(null);
    const [filterModel, setFilterModel] = useState<string | null>(null);
    const [filterYear, setFilterYear] = useState<string | null>(null);
    const [filterColor, setFilterColor] = useState<string | null>(null);
    const [filterClass, setFilterClass] = useState<string | null>(null);
    const [filterSort, setFilterSort] = useState<string>("new");

    const [page, setPage] = useState(1);
    const limit = 12;

    const [filtersOpen, setFiltersOpen] = useState(false);

    const { data: dictionaries, isLoading: dictLoading } = useFullDictionaries();

    const activeFiltersCount = [filterCategory, filterMarka, filterModel, filterYear, filterColor, filterClass].filter(Boolean).length;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data, isLoading: carsLoading } = useCars({
        skip: (page - 1) * limit,
        limit,
        category_id: filterCategory || undefined,
        marka_id: filterMarka || undefined,
        model_id: filterModel || undefined,
        release_year: filterYear || undefined,
        color_id: filterColor || undefined,
        car_class_id: filterClass || undefined,
        sort: filterSort,
        q: debouncedQuery || undefined,
    });
    const filteredCars = data?.items || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // To load models when marka is selected
    const [models, setModels] = useState<any[]>([]);
    const { getCachedDictionaries } = require("@/lib/dictionaries");
    useEffect(() => {
        if (!filterMarka) {
            setModels([]);
            setFilterModel(null);
            return;
        }
        getCachedDictionaries('MODEL', parseInt(filterMarka)).then((res: any) => setModels(res || []));
    }, [filterMarka]);

    const handleFilterChange = (setter: any, val: any) => {
        setter(val);
        setPage(1);
    };

    if (carsLoading || dictLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Загружаем лучшие предложения...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Catalog Banner */}
            <div className="bg-gradient-to-br from-brand via-brand to-brand-dark py-12 sm:py-16 lg:py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100/80 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="container relative z-10 px-4 max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-4">Найти свой <span className="text-slate-300">идеальный автомобиль</span></h1>
                    <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium px-2">
                        От эконом-класса до премиальных внедорожников — у нас есть всё для вашего комфортного передвижения.
                    </p>
                </div>
            </div>

            {/* Вторая часть — белый фон */}
            <div className="bg-white min-h-screen">
                <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-12">
                    {/* Мобильная полоса: поиск + кнопка «Фильтры» (только на мобиле) */}
                    <div className="lg:hidden space-y-3 mb-6">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="Например, Toyota Camry"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="rounded-2xl h-12 bg-slate-50 border-slate-200 pl-11 pr-4 font-medium"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setFiltersOpen(true)}
                            className="w-full rounded-2xl h-12 border-slate-200 bg-white font-bold gap-2 shadow-sm"
                        >
                            <SlidersHorizontal size={20} />
                            Фильтры
                            {activeFiltersCount > 0 && (
                                <span className="bg-slate-800 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar — только на десктопе */}
                        <aside className="hidden lg:block lg:w-72 space-y-8 flex-shrink-0">
                            {/* Search Card */}
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Search size={18} className="text-slate-600" />
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Поиск по названию</h3>
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder="Например, Toyota Camry"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="rounded-2xl h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 font-medium pl-4"
                                    />
                                </div>
                            </div>

                            {/* Category Card — как select: кнопка открывает список, выбор закрывает */}
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-3">Фильтры</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Категория</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                    <span className="truncate">
                                                        {filterCategory === null ? "Любая" : (dictionaries?.categories?.find((c: any) => c.id.toString() === filterCategory)?.name ?? "Выбрано")}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 rounded-xl">
                                                <DropdownMenuRadioGroup value={filterCategory ?? "all"} onValueChange={(v) => handleFilterChange(setFilterCategory, v === "all" ? null : v)}>
                                                    <DropdownMenuRadioItem value="all">Любая</DropdownMenuRadioItem>
                                                    {dictionaries?.categories?.map((cat: any) => (
                                                        <DropdownMenuRadioItem key={cat.id} value={cat.id.toString()}>{cat.name}</DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Марка</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                    <span className="truncate">
                                                        {filterMarka === null ? "Любая" : (dictionaries?.marks?.find((c: any) => c.id.toString() === filterMarka)?.name ?? "Выбрано")}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto rounded-xl">
                                                <DropdownMenuRadioGroup value={filterMarka ?? "all"} onValueChange={(v) => handleFilterChange(setFilterMarka, v === "all" ? null : v)}>
                                                    <DropdownMenuRadioItem value="all">Любая</DropdownMenuRadioItem>
                                                    {dictionaries?.marks?.map((m: any) => (
                                                        <DropdownMenuRadioItem key={m.id} value={m.id.toString()}>{m.name}</DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {models.length > 0 && (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Модель</label>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                        <span className="truncate">
                                                            {filterModel === null ? "Любая" : (models.find((c: any) => c.id.toString() === filterModel)?.name ?? "Выбрано")}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto rounded-xl">
                                                    <DropdownMenuRadioGroup value={filterModel ?? "all"} onValueChange={(v) => handleFilterChange(setFilterModel, v === "all" ? null : v)}>
                                                        <DropdownMenuRadioItem value="all">Любая</DropdownMenuRadioItem>
                                                        {models.map((m: any) => (
                                                            <DropdownMenuRadioItem key={m.id} value={m.id.toString()}>{m.name}</DropdownMenuRadioItem>
                                                        ))}
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Класс машины</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                    <span className="truncate">
                                                        {filterClass === null ? "Любой" : (dictionaries?.car_classes?.find((c: any) => c.id.toString() === filterClass)?.name ?? "Выбрано")}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto rounded-xl">
                                                <DropdownMenuRadioGroup value={filterClass ?? "all"} onValueChange={(v) => handleFilterChange(setFilterClass, v === "all" ? null : v)}>
                                                    <DropdownMenuRadioItem value="all">Любой</DropdownMenuRadioItem>
                                                    {dictionaries?.car_classes?.map((c: any) => (
                                                        <DropdownMenuRadioItem key={c.id} value={c.id.toString()}>{c.name}</DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Цвет</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                    <span className="truncate">
                                                        {filterColor === null ? "Любой" : (dictionaries?.colors?.find((c: any) => c.id.toString() === filterColor)?.name ?? "Выбрано")}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto rounded-xl">
                                                <DropdownMenuRadioGroup value={filterColor ?? "all"} onValueChange={(v) => handleFilterChange(setFilterColor, v === "all" ? null : v)}>
                                                    <DropdownMenuRadioItem value="all">Любой</DropdownMenuRadioItem>
                                                    {dictionaries?.colors?.map((c: any) => (
                                                        <DropdownMenuRadioItem key={c.id} value={c.id.toString()}>{c.name}</DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Год выпуска</label>
                                        <Input
                                            type="number"
                                            placeholder="Например, 2020"
                                            value={filterYear ?? ""}
                                            onChange={(e) => handleFilterChange(setFilterYear, e.target.value ? e.target.value : null)}
                                            className="rounded-xl h-10 bg-slate-50 border-slate-200 text-sm font-medium"
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full rounded-xl"
                                        onClick={() => {
                                            setFilterCategory(null);
                                            setFilterMarka(null);
                                            setFilterModel(null);
                                            setFilterYear(null);
                                            setFilterColor(null);
                                            setFilterClass(null);
                                            setSearchQuery("");
                                            setPage(1);
                                        }}
                                    >
                                        Сбросить
                                    </Button>
                                </div>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 space-y-8">
                            {/* Status Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 sm:px-8 py-4 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={16} className="text-slate-600 shrink-0" />
                                    <span className="text-sm font-bold text-slate-900">Найдено: <span className="text-slate-700">{total}</span></span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="hidden sm:inline">Сортировать:</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-slate-700 bg-slate-100 px-3 py-2 sm:py-1.5 rounded-full border border-slate-200 flex items-center gap-1 w-full sm:w-auto justify-center touch-manipulation">
                                                {filterSort === "new" ? "Сначала новые" : "Сначала дешевые"}
                                                <ChevronDown size={14} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuRadioGroup value={filterSort} onValueChange={(val) => { setFilterSort(val); setPage(1); }}>
                                                <DropdownMenuRadioItem value="new">Сначала новые</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="cheap">Сначала дешевые</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr transition-all duration-500">
                                {filteredCars.map((car: any) => (
                                    <Link
                                        key={car.id}
                                        href={`/cars/${car.id}`}
                                        className="group relative flex flex-col bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden"
                                    >
                                        <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden flex-shrink-0">
                                            {car.images?.[0] ? (
                                                <img
                                                    src={car.images[0].url}
                                                    alt={car.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-300 bg-slate-50"><Car size={48} className="sm:w-16 sm:h-16" strokeWidth={1} /></div>
                                            )}

                                            <div className="absolute top-3 left-3 sm:top-5 sm:left-5">
                                                <span className="flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] shadow-lg text-slate-900 border border-white/20">
                                                    <Car size={10} className="sm:w-3 sm:h-3 text-slate-600" />
                                                    {car.car_class || "Premium"}
                                                </span>
                                            </div>

                                            {car.is_top && (
                                                <div className="absolute top-3 right-3 sm:top-5 sm:right-5">
                                                    <span className="flex items-center justify-center bg-orange-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-lg">
                                                        <Flame size={14} className="sm:w-4 sm:h-4" />
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="bg-slate-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl">
                                                    Забронировать
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1">
                                            <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <h3 className="font-black text-base sm:text-xl text-slate-900 leading-tight group-hover:text-slate-700 transition-colors line-clamp-2">{car.name}</h3>
                                                    <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1 truncate">
                                                        {[car.mark, car.model].filter(Boolean).join(" ")}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <MapPin size={12} className="text-slate-400 shrink-0" />
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{car.city || 'Алматы'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="block font-black text-lg sm:text-2xl text-slate-900 leading-none">{car.price_per_day.toLocaleString()} ₸</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">в сутки</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 sm:pt-6 border-t border-slate-50 grid grid-cols-2 gap-2">
                                                <div className="flex flex-col items-center justify-center p-2 rounded-xl sm:rounded-2xl bg-slate-50">
                                                    <Calendar size={14} className="text-slate-400 mb-1" />
                                                    <span className="text-[10px] font-black text-slate-900">{car.release_year}</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-2 rounded-xl sm:rounded-2xl bg-slate-50">
                                                    <Settings size={14} className="text-slate-400 mb-1" />
                                                    <span className="text-[10px] font-black text-slate-900 truncate px-1">
                                                        {car.transmission?.slice(0, 3) || 'Авт'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {filteredCars.length === 0 && (
                                <div className="text-center py-16 sm:py-32 bg-white rounded-2xl sm:rounded-[3rem] border border-dashed border-slate-200 shadow-sm flex flex-col items-center animate-in fade-in zoom-in duration-500 px-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                        <Filter className="h-8 w-8 sm:h-10 sm:w-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Ничего не найдено</h3>
                                    <p className="text-slate-500 text-sm sm:text-base font-medium mt-2 max-w-sm mx-auto">Попробуйте изменить параметры фильтрации или поисковый запрос</p>
                                    <Button
                                        variant="outline"
                                        className="mt-6 sm:mt-8 rounded-full px-6 sm:px-8 font-bold border-slate-300 text-slate-700 hover:bg-slate-100 h-11"
                                        onClick={() => {
                                            setFilterCategory(null);
                                            setFilterMarka(null);
                                            setFilterModel(null);
                                            setFilterYear(null);
                                            setFilterColor(null);
                                            setFilterClass(null);
                                            setSearchQuery("");
                                            setPage(1);
                                            setFiltersOpen(false);
                                        }}
                                    >
                                        Сбросить фильтры
                                    </Button>
                                    <Link href="/find" className="mt-4 text-primary font-medium hover:underline text-sm sm:text-base">
                                        Не нашли? Оставить заявку
                                    </Link>
                                </div>
                            )}

                            {filteredCars.length > 0 && totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-6 border-t border-slate-100 mt-6 sm:mt-8 mb-4">
                                    <Button
                                        variant="outline"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="rounded-full px-5 sm:px-6 font-bold h-11 w-full sm:w-auto touch-manipulation"
                                    >
                                        Назад
                                    </Button>
                                    <span className="text-sm font-bold text-slate-500 px-2 sm:px-4">
                                        {page} из {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className="rounded-full px-5 sm:px-6 font-bold h-11 w-full sm:w-auto touch-manipulation"
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            )}

                            {filteredCars.length > 0 && (
                                <div className="text-center py-6 sm:py-8">
                                    <Link href="/find" className="text-primary font-medium hover:underline text-sm sm:text-base">
                                        Не нашли подходящее? Оставить заявку
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Мобильная панель фильтров (Sheet снизу) */}
                    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                        <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto p-0 flex flex-col">
                            <SheetHeader className="p-4 sm:p-6 pr-12 border-b border-slate-100">
                                <SheetTitle className="text-left text-lg font-black">Фильтры</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Категория</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                <span className="truncate">{filterCategory === null ? "Любая" : (dictionaries?.categories?.find((c: any) => c.id.toString() === filterCategory)?.name ?? "Выбрано")}</span>
                                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-xl">
                                            <DropdownMenuRadioGroup value={filterCategory ?? "all"} onValueChange={(v) => handleFilterChange(setFilterCategory, v === "all" ? null : v)}>
                                                <DropdownMenuRadioItem value="all">Любая</DropdownMenuRadioItem>
                                                {dictionaries?.categories?.map((cat: any) => (
                                                    <DropdownMenuRadioItem key={cat.id} value={cat.id.toString()}>{cat.name}</DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Марка</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                <span className="truncate">{filterMarka === null ? "Любая" : (dictionaries?.marks?.find((c: any) => c.id.toString() === filterMarka)?.name ?? "Выбрано")}</span>
                                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-xl">
                                            <DropdownMenuRadioGroup value={filterMarka ?? "all"} onValueChange={(v) => handleFilterChange(setFilterMarka, v === "all" ? null : v)}>
                                                <DropdownMenuRadioItem value="all">Любая</DropdownMenuRadioItem>
                                                {dictionaries?.marks?.map((m: any) => (
                                                    <DropdownMenuRadioItem key={m.id} value={m.id.toString()}>{m.name}</DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {models.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Модель</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                    <span className="truncate">{filterModel === null ? "Любая" : (models.find((c: any) => c.id.toString() === filterModel)?.name ?? "Выбрано")}</span>
                                                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-xl">
                                                <DropdownMenuRadioGroup value={filterModel ?? "all"} onValueChange={(v) => handleFilterChange(setFilterModel, v === "all" ? null : v)}>
                                                    <DropdownMenuRadioItem value="all">Любая</DropdownMenuRadioItem>
                                                    {models.map((m: any) => (
                                                        <DropdownMenuRadioItem key={m.id} value={m.id.toString()}>{m.name}</DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Класс машины</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                <span className="truncate">{filterClass === null ? "Любой" : (dictionaries?.car_classes?.find((c: any) => c.id.toString() === filterClass)?.name ?? "Выбрано")}</span>
                                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-xl">
                                            <DropdownMenuRadioGroup value={filterClass ?? "all"} onValueChange={(v) => handleFilterChange(setFilterClass, v === "all" ? null : v)}>
                                                <DropdownMenuRadioItem value="all">Любой</DropdownMenuRadioItem>
                                                {dictionaries?.car_classes?.map((c: any) => (
                                                    <DropdownMenuRadioItem key={c.id} value={c.id.toString()}>{c.name}</DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Цвет</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200">
                                                <span className="truncate">{filterColor === null ? "Любой" : (dictionaries?.colors?.find((c: any) => c.id.toString() === filterColor)?.name ?? "Выбрано")}</span>
                                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-xl">
                                            <DropdownMenuRadioGroup value={filterColor ?? "all"} onValueChange={(v) => handleFilterChange(setFilterColor, v === "all" ? null : v)}>
                                                <DropdownMenuRadioItem value="all">Любой</DropdownMenuRadioItem>
                                                {dictionaries?.colors?.map((c: any) => (
                                                    <DropdownMenuRadioItem key={c.id} value={c.id.toString()}>{c.name}</DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Год выпуска</label>
                                    <Input
                                        type="number"
                                        placeholder="Например, 2020"
                                        value={filterYear ?? ""}
                                        onChange={(e) => handleFilterChange(setFilterYear, e.target.value ? e.target.value : null)}
                                        className="rounded-xl h-11 bg-slate-50 border-slate-200 text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <SheetFooter className="p-4 sm:p-6 border-t border-slate-100 gap-2 flex-row">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl h-12 font-bold"
                                    onClick={() => {
                                        setFilterCategory(null);
                                        setFilterMarka(null);
                                        setFilterModel(null);
                                        setFilterYear(null);
                                        setFilterColor(null);
                                        setFilterClass(null);
                                        setPage(1);
                                    }}
                                >
                                    Сбросить
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl h-12 font-bold bg-slate-800 hover:bg-slate-700"
                                    onClick={() => setFiltersOpen(false)}
                                >
                                    Показать {total} авто
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );
}
