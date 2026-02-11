"use client";

import { useCars } from "@/hooks/useCars";
import { useFullDictionaries } from "@/hooks/useDictionaries";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CatalogPage() {
    const { data: cars = [], isLoading: carsLoading } = useCars();
    const { data: dictionaries, isLoading: dictLoading } = useFullDictionaries();
    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    const filteredCars = filterCategory 
        ? cars.filter((car: any) => car.category_id?.toString() === filterCategory) 
        : cars;

    if (carsLoading || dictLoading) return <div className="container py-20 text-center animate-pulse">Загрузка каталога...</div>;

    return (
        <div className="container py-10 min-h-screen">
            <h1 className="text-4xl font-black mb-8">Каталог <span className="text-primary">автомобилей</span></h1>
            
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                <Button 
                    variant={filterCategory === null ? "default" : "outline"} 
                    className="rounded-full"
                    onClick={() => setFilterCategory(null)}
                >
                    Все
                </Button>
                {dictionaries?.categories?.map((cat: any) => (
                    <Button 
                        key={cat.id}
                        variant={filterCategory === cat.id.toString() ? "default" : "outline"} 
                        className="rounded-full whitespace-nowrap"
                        onClick={() => setFilterCategory(cat.id.toString())}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCars.map((car: any) => (
                    <Link key={car.id} href={`/cars/${car.id}`} className="group relative block bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                             {car.images?.[0] ? (
                                 <Image src={car.images[0].url} alt={car.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-slate-300"><Car size={48} strokeWidth={1} /></div>
                             )}
                             <div className="absolute top-4 left-4">
                                <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                                    Premium
                                </span>
                             </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{car.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">{car.city || 'Алматы'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-xl text-primary">{car.price_per_day} ₸</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">в сутки</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>{car.release_year}</span>
                                <span>{car.transmission || 'Автомат'}</span>
                                <span>{car.fuel_type || 'Бензин'}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {filteredCars.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Filter className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Ничего не найдено</h3>
                    <p className="text-slate-500">Попробуйте изменить параметры фильтрации</p>
                </div>
            )}
        </div>
    );
}
