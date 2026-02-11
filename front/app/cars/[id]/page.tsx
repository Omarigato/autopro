"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  ChevronLeft,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  Zap,
  Check,
  ChevronRight
} from "lucide-react";
import { useCar } from "@/lib/hooks/useCars";

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  
  const { data: car, isLoading: loading } = useCar(id);

  if (loading) {
    return (
      <div className="min-h-screen container-page animate-pulse space-y-8 pt-10">
        <div className="h-10 w-48 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-[500px] bg-slate-100 rounded-[3rem]"></div>
          <div className="h-[400px] bg-slate-100 rounded-[3rem]"></div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center container-page text-center space-y-4">
        <div className="p-6 bg-slate-50 rounded-full text-slate-300">
          <ShieldCheck size={64} strokeWidth={1} />
        </div>
        <h1 className="text-2xl font-black text-primary uppercase">Автомобиль не найден</h1>
        <p className="text-slate-400 font-medium max-w-xs">Объявление могло быть удалено или перемещено владельцем.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-6">

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
        </button>
        <div className="flex gap-2">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-accent shadow-sm transition-all active:scale-95">
            <Share2 size={18} />
          </button>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-danger shadow-sm transition-all active:scale-95">
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Gallery & Content */}
        <div className="lg:col-span-2 space-y-12">

          {/* Main Photo Gallery */}
          <section className="relative aspect-[16/10] bg-slate-100 rounded-[3rem] overflow-hidden group shadow-premium ring-1 ring-slate-100">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[0].url}
                alt={car.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                <Zap size={64} strokeWidth={1} />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary shadow-xl">
                Verified Owner
              </span>
              <span className="px-4 py-2 bg-accent/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                Pro Fleet
              </span>
            </div>

            {/* Navigation Overlay */}
            <div className="absolute inset-x-0 bottom-8 flex justify-center">
              <div className="flex gap-2 p-2 bg-black/20 backdrop-blur-md rounded-full">
                {[1, 2, 3, 4].map(dot => (
                  <div key={dot} className={`h-1.5 w-1.5 rounded-full transition-all ${dot === 1 ? 'w-4 bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </div>
          </section>

          {/* Core Info */}
          <section className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-accent">
                <Star size={14} className="fill-accent" />
                <span>4.9 (48 Отзывов)</span>
                <span className="text-slate-200">•</span>
                <span>Категория: Авто</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-none uppercase">{car.name}</h1>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <MapPin size={16} className="text-accent" /> Алматы, Бостандыкский
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <Clock size={16} className="text-accent" /> {car.release_year || "2022"} год выпуска
                </div>
              </div>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Объем</p>
                <p className="font-bold text-primary">2.5 Литра</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Топливо</p>
                <p className="font-bold text-primary">Бензин (АИ-95)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Трансмиссия</p>
                <p className="font-bold text-primary">Автоматическая</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Привод</p>
                <p className="font-bold text-primary">Передний</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-black tracking-tight uppercase">О Технике</h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-3xl">
                {car.description || "Автомобиль в идеальном техническом состоянии. Проходит регулярное ТО в официальном сервисном центре. Полная комплектация, кожаный салон, адаптивный круиз-контроль и премиальная аудиосистема. Идеально подходит как для деловых поездок по городу, так и для длительных путешествий."}
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {["Страховка КАСКО/ОГПО включена", "Без ограничений по пробегу", "Чистый салон и полный бак", "Детское кресло по запросу"].map(feature => (
                <div key={feature} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600">
                  <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Check size={14} />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Sticky Panel */}
        <aside className="space-y-8">
          <div className="sticky top-28 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8 space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Стоимость аренды</p>
                <p className="text-3xl font-black text-primary">15 000 ₸ <span className="text-sm font-bold text-slate-300">/ день</span></p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black">
                -10% на 7+ дней
              </div>
            </div>

            <div className="space-y-4">
              <button className="btn-primary w-full py-5 flex items-center justify-center gap-3">
                Забронировать сейчас <ChevronRight size={18} />
              </button>
              <button className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl border-2 border-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
                <MessageCircle size={18} /> Связаться в WhatsApp
              </button>
            </div>

            <div className="flex flex-col gap-4 py-6 border-y border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <MapPin size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Точка выдачи</p>
                  <p className="text-xs font-extrabold text-primary">БЦ "Нурлы Тау", Алматы</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Calendar size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Доступность</p>
                  <p className="text-xs font-extrabold text-primary uppercase">Доступен сегодня</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                <img src="https://ui-avatars.com/api/?name=Oleg&background=random" alt="Avatar" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-primary">Олег Николаевич</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Владелец (5 лет на платформе)</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black px-2 py-1 bg-warning/5 text-warning rounded-lg">
                <Star size={10} className="fill-warning" /> 5.0
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
