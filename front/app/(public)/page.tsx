"use client";

import { useCars } from "@/hooks/useCars";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Car,
  Search,
  ChevronRight,
  Star,
  ShieldCheck,
  Zap,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { data: cars = [], isLoading } = useCars();

  return (
    <div className="space-y-32 pb-32 bg-slate-50/30">
      {/* Hero Section */}
      <section className="relative bg-[#0a0c10] text-white py-24 lg:py-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <div className="container relative z-10 grid lg:grid-cols-2 gap-16 items-center px-4 max-w-7xl mx-auto">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 backdrop-blur-md rounded-full text-indigo-400 text-sm font-black border border-indigo-500/20 uppercase tracking-widest">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Сервис аренды №1 в Казахстане</span>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              ДРАЙВ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">БЕЗ ГРАНИЦ</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
              Эксклюзивный парк автомобилей для ваших лучших моментов. Откройте новый уровень свободы с современным сервисом аренды.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-500/20 border-none transition-all hover:-translate-y-1" asChild>
                <Link href="/catalog" className="flex items-center gap-2">
                  Выбрать авто <ChevronRight size={20} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all hover:-translate-y-1" asChild>
                <Link href="/add">Сдать своё авто</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/5">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0c10] bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="User" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">10,000+ довольных клиентов</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className="text-indigo-400 fill-indigo-400" />)}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-700 group">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"
                alt="Luxury Car"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/10">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Предложение дня</p>
                <h3 className="text-2xl font-black text-white capitalize">Porsche 911 Carrera S</h3>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-3xl font-black text-white">45,000 ₸ <span className="text-sm font-medium text-slate-400">/ сутки</span></span>
                  <Link href="/catalog" className="text-indigo-400 font-bold flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    Подробнее <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
            {/* Floating Element */}
            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl hidden lg:block animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Страховка</p>
                  <p className="text-sm font-black text-slate-900 mt-1">KASPI Insurance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest">
              <Zap size={18} fill="currentColor" />
              <span>Сейчас в тренде</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Популярные <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">автомобили</span></h2>
          </div>
          <Link href="/catalog" className="group flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-xl shadow-slate-200/50 font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
            Смотреть все <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[450px] bg-white rounded-[2.5rem] animate-pulse shadow-xl shadow-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cars.slice(0, 4).map((car: any) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="group relative flex flex-col bg-white rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  {car.images?.[0] ? (
                    <img src={car.images[0].url} alt={car.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Car size={48} strokeWidth={1} /></div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {car.category_name || 'Business'}
                  </div>
                </div>
                <div className="p-8 flex flex-col items-start text-left">
                  <h3 className="font-black text-xl text-slate-900 truncate w-full group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{car.name}</h3>
                  <div className="flex items-center gap-1.5 mt-2 mb-6">
                    <MapPin size={12} className="text-slate-400" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{car.city || 'Алматы'}</p>
                  </div>

                  <div className="flex items-center justify-between w-full mt-auto">
                    <div>
                      <span className="text-2xl font-black text-indigo-600">{(car.price_per_day || 0).toLocaleString()} ₸</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">в сутки</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <ShieldCheck className="w-10 h-10 text-indigo-600" />, title: "Безопасность", desc: "Все автомобили проходят тех.осмотр перед каждой поездкой" },
            { icon: <Briefcase className="w-10 h-10 text-indigo-600" />, title: "Без залога", desc: "Для проверенных пользователей доступна аренда без залога" },
            { icon: <Sparkles className="w-10 h-10 text-indigo-600" />, title: "Сервис 24/7", desc: "Наша поддержка всегда на связи, чтобы помочь вам в пути" }
          ].map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 rounded-[2.5rem] bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500">
              <div className="mb-2">{badge.icon}</div>
              <h3 className="font-black text-xl text-slate-900">{badge.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container max-w-7xl mx-auto px-4">
        <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight">Зарабатывайте <br /> на своём авто</h2>
              <p className="text-indigo-100/80 text-xl font-medium leading-relaxed max-w-xl">
                Ваш автомобиль может приносить доход! Присоединяйтесь к сообществу AutoPro и начните получать прибыль от аренды.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button variant="secondary" size="lg" className="h-16 px-12 rounded-2xl font-black text-indigo-600 bg-white hover:bg-indigo-50 shadow-xl shadow-black/10 transition-all hover:-translate-y-1" asChild>
                  <Link href="/add">Начать зарабатывать</Link>
                </Button>
                <Link href="/help" className="flex items-center gap-3 font-bold text-white/80 hover:text-white transition-colors">
                  Узнать как это работает <ArrowRight size={20} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative aspect-video bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-4 transform rotate-3 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"
                  alt="App Interface"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
