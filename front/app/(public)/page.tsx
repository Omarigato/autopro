"use client";

import { useCars } from "@/hooks/useCars";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Car, Search } from "lucide-react";

export default function HomePage() {
  const { data: cars = [], isLoading } = useCars();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Abstract background pattern or image could go here */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />
        </div>

        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Аренда авто <br className="hidden lg:block" />
              <span className="text-primary">нового поколения</span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium max-w-lg">
              Быстро, безопасно и без лишних документов. Выберите идеальный автомобиль для своих поездок прямо сейчас.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full" asChild>
                <Link href="/catalog">Выбрать авто</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white" asChild>
                <Link href="/add">Сдать своё авто</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl bg-zinc-800/50 border border-zinc-700 p-2 shadow-2xl skew-y-1 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/logo.png" alt="Hero Logo" width={200} height={200} className="opacity-20 grayscale brightness-200" />
              {/* This would be a hero image */}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Популярные автомобили</h2>
            <p className="text-muted-foreground mt-2">Лучшие предложения этой недели</p>
          </div>
          <Link href="/catalog" className="text-primary font-medium hover:underline">Смотреть все</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cars.slice(0, 4).map((car: any) => (
              <Link key={car.id} href={`/cars/${car.id}`} className="group block bg-white rounded-2xl border border-slate-100 p-2 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="relative aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden mb-4">
                  {car.images?.[0] ? (
                    <Image src={car.images[0].url} alt={car.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Car /></div>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-lg">{car.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{car.release_year} • {car.transmission || 'Автомат'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black text-xl">{car.price_per_day} ₸</span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">/ сутки</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="container">
        <div className="bg-primary rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-3xl font-black">Зарабатывайте на своём авто</h2>
            <p className="text-primary-foreground/80 text-lg">
              У вас есть автомобиль, который простаивает? Сдайте его в аренду через нашу платформу и получайте стабильный пассивный доход. Мы берем на себя проверку клиентов и страховку.
            </p>
            <Button variant="secondary" size="lg" className="rounded-full font-bold shadow-lg" asChild>
              <Link href="/add">Начать зарабатывать</Link>
            </Button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 translate-x-10" />
        </div>
      </section>
    </div>
  );
}
