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
  Grid
} from "lucide-react";
import { apiClient } from "@/lib/api";

type Car = {
  id: number;
  name: string;
  images: { id: number; url: string }[];
  release_year?: number;
  price?: number; // Mock if not in API
};

const CATEGORIES = [
  { id: 1, label: "Легковое авто", icon: CarIcon },
  { id: 2, label: "Грузовое авто", icon: Truck },
  { id: 3, label: "Спецтехника", icon: Construction },
  { id: 4, label: "Оборудование", icon: Wrench },
  { id: 5, label: "Водный транспорт", icon: Ship },
  { id: 6, label: "Услуги", icon: Grid },
];

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // API endpoint might be different, ensure it matches backend
    apiClient
      .get<Car[]>("/cars")
      .then((res) => setCars(res.data))
      .catch(() => setCars([]));
  }, []);

  return (
    <div className="space-y-8 pb-20">

      {/* Banners / Promo Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-auto bg-blue-600">
          <img src="https://images.unsplash.com/photo-1533473356331-0a3422d47a8d?auto=format&fit=crop&q=80" alt="Promo 1" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60">
            <span className="text-white font-bold text-sm">Акция</span>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-auto bg-indigo-600 hidden md:block">
          <img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80" alt="Promo 2" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60">
            <span className="text-white font-bold text-sm">Новинки</span>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-auto bg-purple-600 hidden md:block">
          <img src="https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80" alt="Promo 3" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60">
            <span className="text-white font-bold text-sm">Спецпредложение</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              href={`/catalog?category=${cat.id}`}
              key={cat.id}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center gap-2 aspect-square"
            >
              <cat.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Announcements */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Топ объявлений</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.id}`}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative h-48 w-full bg-gray-100">
                {car.images && car.images.length > 0 ? (
                  <Image
                    src={car.images[0].url}
                    alt={car.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <CarIcon className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {/* Heart icon placeholder */}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg truncate mb-1">{car.name}</h3>
                <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
                  <span>★ 4.5</span>
                  <span className="text-gray-400">(15 отзывов)</span>
                </div>
                <div className="font-bold text-lg mb-2">
                  12 000 ₸<span className="text-sm font-normal text-gray-500">/день</span>
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>2012 г</span>
                  <span>•</span>
                  <span>2.5 л</span>
                  <span>•</span>
                  <span>Автомат</span>
                </div>
              </div>
            </Link>
          ))}

          {cars.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              Пока нет объявлений. Будьте первым!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

