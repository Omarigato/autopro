"use client";

import { useCars } from "@/hooks/useCars";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Car, Search } from "lucide-react";

export default function HomePage() {
  const { data, isLoading } = useCars();
  const cars = data?.items || [];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 text-white py-8 lg:py-10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Abstract background pattern or image could go here */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />
        </div>

        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Аренда авто <br className="hidden lg:block" />
              <span className="text-zinc-400">нового поколения</span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium max-w-lg">
              Быстро, безопасно и без лишних документов. Выберите идеальный автомобиль для своих поездок прямо сейчас.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border-none" asChild>
                <Link href="/find">Найти авто</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-zinc-700 bg-transparent text-zinc-400 hover:bg-white hover:text-zinc-900 transition-colors" asChild>
                <Link href="/add">Сдать своё авто</Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full h-[250px] sm:h-[300px] lg:h-[400px] flex items-center justify-center">
            {/* Эффект свечения на заднем плане, чтобы выделить авто */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] bg-zinc-400/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Само изображение машины с тенью */}
            <Image
              src="/car.png"
              alt="Premium Car Rental"
              fill
              className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)] z-10 scale-110 lg:scale-[1.45] lg:translate-x-2 lg:translate-y-[8%]"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
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
                  <p className="text-sm text-slate-400 mb-4">
                    {[car.mark, car.model].filter(Boolean).join(" ")} {car.release_year ? `• ${car.release_year}` : ''}
                  </p>
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

    </div>
  );
}