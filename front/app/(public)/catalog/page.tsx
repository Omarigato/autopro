"use client";

import { useCars } from "@/hooks/useCars";
import { useFullDictionaries } from "@/hooks/useDictionaries";
import { useState, useMemo } from "react";
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
    Layers
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
import { cn } from "@/lib/utils";

export default function CatalogPage() {
    const { data: cars = [], isLoading: carsLoading } = useCars();
    const { data: dictionaries, isLoading: dictLoading } = useFullDictionaries();
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCars = useMemo(() => {
        return cars.filter((car: any) => {
            const matchesCategory = filterCategory ? car.category_id?.toString() === filterCategory : true;
            const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [cars, filterCategory, searchQuery]);

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
            {/* Catalog Banner — только эта часть чёрная */}
            <div className="bg-black py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100/80 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="container relative z-10 px-4 max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Найти свой <span className="text-slate-300">идеальный автомобиль</span></h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
                        От эконом-класса до премиальных внедорожников — у нас есть всё для вашего комфортного передвижения.
                    </p>
                </div>
            </div>

            {/* Вторая часть — белый фон */}
            <div className="bg-white min-h-screen">
            <div className="container max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:w-72 space-y-8 flex-shrink-0">
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
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-3">Категории</h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center justify-between w-full gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
                                    >
                                        <span className="flex items-center gap-2 truncate">
                                            <Layers size={18} className="text-slate-600 shrink-0" />
                                            {filterCategory === null
                                                ? "Все категории"
                                                : (dictionaries?.categories?.find((c: any) => c.id.toString() === filterCategory)?.name ?? "Категория")}
                                        </span>
                                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-2 shadow-xl border-slate-200">
                                    <DropdownMenuRadioGroup value={filterCategory ?? "all"} onValueChange={(v) => setFilterCategory(v === "all" ? null : v)}>
                                        <DropdownMenuRadioItem value="all" className="rounded-xl py-3 font-bold cursor-pointer">
                                            <span className="flex items-center justify-between w-full">
                                                Все категории
                                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">{cars.length}</span>
                                            </span>
                                        </DropdownMenuRadioItem>
                                        {dictionaries?.categories?.map((cat: any) => (
                                            <DropdownMenuRadioItem key={cat.id} value={cat.id.toString()} className="rounded-xl py-3 font-bold cursor-pointer">
                                                <span className="flex items-center justify-between w-full">
                                                    <span className="truncate">{cat.name}</span>
                                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500 shrink-0 ml-2">
                                                        {cars.filter((c: any) => c.category_id === cat.id).length}
                                                    </span>
                                                </span>
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 space-y-8">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[2rem] shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2">
                                <LayoutGrid size={16} className="text-slate-600" />
                                <span className="text-sm font-bold text-slate-900">Найдено: <span className="text-slate-700">{filteredCars.length}</span></span>
                            </div>
                            <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Сортировать:</span>
                                <button className="text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">Сначала дешевые</button>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr transition-all duration-500">
                            {filteredCars.map((car: any) => (
                                <Link
                                    key={car.id}
                                    href={`/cars/${car.id}`}
                                    className="group relative flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                                >
                                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden flex-shrink-0">
                                        {car.images?.[0] ? (
                                            <img
                                                src={car.images[0].url}
                                                alt={car.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300 bg-slate-50"><Car size={64} strokeWidth={1} /></div>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute top-5 left-5">
                                            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg text-slate-900 border border-white/20">
                                                {car.category_name || "Premium"}
                                            </span>
                                        </div>

                                        {/* Price Overlay */}
                                        <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="bg-slate-800 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
                                                Забронировать
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="min-w-0 pr-4">
                                                <h3 className="font-black text-xl text-slate-900 leading-tight group-hover:text-slate-700 transition-colors truncate">{car.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{car.city || 'Алматы'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="block font-black text-2xl text-slate-900 leading-none">{car.price_per_day.toLocaleString()} ₸</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">в сутки</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-slate-50 grid grid-cols-3 gap-2">
                                            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50">
                                                <Calendar size={14} className="text-slate-400 mb-1" />
                                                <span className="text-[10px] font-black text-slate-900">{car.release_year}</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50">
                                                <Gauge size={14} className="text-slate-400 mb-1" />
                                                <span className="text-[10px] font-black text-slate-900">{car.mileage || '23к'} км</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50">
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
                            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Filter className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ничего не найдено</h3>
                                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Попробуйте изменить параметры фильтрации или поисковый запрос</p>
                                <Button
                                    variant="outline"
                                    className="mt-8 rounded-full px-8 font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                                    onClick={() => {
                                        setFilterCategory(null);
                                        setSearchQuery("");
                                    }}
                                >
                                    Сбросить фильтры
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
