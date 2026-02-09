"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

type Car = {
  id: number;
  name: string;
  photos: { id: number; url: string }[];
};

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    apiClient
      .get<Car[]>("/cars")
      .then((res) => setCars(res.data))
      .catch(() => setCars([]));
  }, []);

  return (
    <div className="container-page space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-accent text-white p-6 flex flex-col justify-between min-h-[180px]">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Аренда авто, спецтехники и водного транспорта
            </h1>
            <p className="text-sm text-blue-100">
              Быстрый поиск автомобилей без регистрации для клиентов.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">
              Легковые авто
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">
              Грузовой транспорт
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">
              Спецтехника
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30">
              Водный транспорт
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow-sm p-4 flex flex-col justify-between">
          <div>
            <p className="font-semibold mb-1">Вы владелец?</p>
            <p className="text-sm text-muted mb-3">
              Разместите свои авто в AUTOPRO и управляйте бронированиями онлайн.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-accent transition-colors"
          >
            Вход для владельцев
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Топ объявлений</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.id}`}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:-translate-y-1 transition-transform"
            >
              <div className="relative h-44 w-full">
                {car.photos[0] ? (
                  <Image
                    src={car.photos[0].url}
                    alt={car.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-muted">
                    Фото скоро будет
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="font-semibold text-sm truncate">{car.name}</p>
                <p className="text-xs text-muted">Нажмите, чтобы посмотреть детали</p>
              </div>
            </Link>
          ))}
          {cars.length === 0 && (
            <div className="text-sm text-muted">
              Пока нет активных объявлений. Как только владельцы добавят авто, они появятся здесь.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

