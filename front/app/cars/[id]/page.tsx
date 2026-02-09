"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";

type Car = {
  id: number;
  name: string;
  photos: { id: number; url: string }[];
};

export default function CarDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<Car[]>("/cars")
      .then((res) => {
        const found = res.data.find((c) => c.id === id) ?? null;
        setCar(found);
      })
      .catch(() => setCar(null));
  }, [id]);

  if (!car) {
    return (
      <div className="container-page">
        <p className="text-sm text-muted">Загрузка данных автомобиля...</p>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 md:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="relative w-full h-60 rounded-2xl overflow-hidden bg-gray-200">
          {car.photos[0] && (
            <Image
              src={car.photos[0].url}
              alt={car.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <h1 className="text-xl font-semibold">{car.name}</h1>
        <p className="text-sm text-muted">
          Здесь будет техническая информация об автомобиле, тип кузова, КПП, год выпуска и т.д.
        </p>
      </div>

      <div className="space-y-3 bg-white rounded-2xl shadow-sm p-4 h-fit">
        <p className="font-semibold text-sm">Забронировать или связаться</p>
        <button className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-accent">
          Забронировать
        </button>
        <button className="w-full py-2 rounded-xl border text-sm font-medium hover:border-primary hover:text-primary">
          Связаться в WhatsApp
        </button>
        <p className="text-xs text-muted mt-2">
          Клиенту не нужна регистрация — при бронировании он заполняет свои данные, а владелец
          получает заявку.
        </p>
      </div>
    </div>
  );
}

