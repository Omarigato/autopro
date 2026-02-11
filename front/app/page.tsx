"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Car as CarIcon,
  Truck,
  Construction,
  Wrench,
  Ship,
  Grid,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Search
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/lib/translations";
import { getCachedDictionaries } from "@/lib/dictionaries";

type Car = {
  id: number;
  name: string;
  images: { id: number; url: string }[];
  release_year?: number;
  price?: number;
  views?: number;
};

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("ru");
  const [categories, setCategories] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslation(lang);

  const ICON_MAP: Record<string, any> = {
    Car: CarIcon,
    Truck: Truck,
    Construction: Construction,
    Wrench: Wrench,
    Ship: Ship,
    Grid: Grid,
  };

  const COLOR_MAP: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    cyan: "bg-cyan-50 text-cyan-600",
    slate: "bg-slate-50 text-slate-600",
  };

  useEffect(() => {
    setLang(window.localStorage.getItem("lang") || "ru");

    // Загрузка категорий из словаря с кэшированием
    getCachedDictionaries("CATEGORY")
      .then(res => setCategories(res))
      .catch(() => setCategories([]));

    apiClient
      .get<Car[]>("/cars")
      .then((res: any) => setCars(res || []))
      .catch(() => setCars([]))
      .finally(() => setLoading(false));

    (window as any).toggleSearch = () => setShowSearch(prev => !prev);
  }, []);

  const filteredCars = cars.filter(car => {
    const query = searchQuery.toLowerCase();
    return (
      car.name.toLowerCase().includes(query) ||
      (car as any).author?.address?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-12 pb-20">

      {/* Modern Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[200] bg-primary/40 backdrop-blur-md animate-in fade-in duration-300 flex items-start justify-center pt-24 px-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-8 duration-500">
            <Search size={24} className="text-slate-400 ml-4" />
            <input
              autoFocus
              type="text"
              placeholder="Поиск по марке, модели или адресу..."
              className="flex-1 py-4 bg-transparent border-none focus:ring-0 text-lg font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setShowSearch(false)}
              className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold text-sm px-6"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden group">
        <Image
          src="https://res.cloudinary.com/drtsxey7d/image/upload/v1770773855/full_bihln0.jpg"
          alt="Hero background"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent flex flex-col justify-center px-8 md:px-16">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-md border border-accent/30 text-white rounded-full text-xs font-bold uppercase tracking-widest leading-none">
              {t("hero_badge")}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              {t("hero_title")} <br />
              <span className="text-accent underline decoration-accent/30 underline-offset-8">{t("hero_title_accent")}</span>
            </h1>
            <p className="text-slate-200 text-lg font-medium max-w-lg">
              {t("hero_desc")}
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/catalog" className="btn-primary flex items-center gap-2">
                {t("go_to_catalog")} <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Categories */}
      <section className="container-page !py-0">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t("categories")}</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">{t("find_what_you_need")}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat: any) => {
            const Icon = ICON_MAP[cat.icon] || Grid;
            const colorClass = COLOR_MAP[cat.color] || "bg-slate-50 text-slate-600";
            const name = cat.translations?.find((tr: any) => tr.lang === lang)?.name || cat.name;

            return (
              <Link
                href={`/catalog?category=${cat.id}`}
                key={cat.id}
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-premium transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`p-4 rounded-2xl transition-all duration-300 ${colorClass} group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-primary tracking-tight">{name}</span>
              </Link>
            );
          })}
        </div>
      </section >

      {/* Featured Fleet */}
      < section className="container-page !py-0" >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Топ предложений</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Отобранные автомобили с высоким рейтингом</p>
          </div>
          <Link href="/catalog" className="text-accent font-bold text-sm hover:underline flex items-center gap-1">
            Все объявления <ChevronRight size={14} />
          </Link>
        </div>

        {
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => (
                <Link
                  key={car.id}
                  href={`/cars/${car.id}`}
                  className="card-premium group"
                >
                  <div className="relative h-64 w-full">
                    {car.images && car.images.length > 0 ? (
                      <Image
                        src={car.images[0].url}
                        alt={car.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <CarIcon className="w-16 h-16 text-slate-200" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                        PREMIUM
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <ChevronRight className="text-accent" size={20} />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl leading-tight truncate">{car.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Star size={12} className="text-warning fill-warning" />
                        <span>4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} /> Алматы
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} /> {car.release_year || '2022'}г.
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-primary">15 000 ₸</span>
                        <span className="text-xs font-bold text-slate-400"> / день</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-500 px-2 py-1 bg-emerald-50 rounded-lg">
                        ДОСТУПНО
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {cars.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="mx-auto w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl mb-4">
                    <CarIcon size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 tracking-tight">Пока нет активных объявлений</h3>
                  <p className="text-slate-300 text-sm mt-1">Они появятся здесь в ближайшее время</p>
                </div>
              )}
            </div>
          )
        }
      </section >
    </div >
  );
}

