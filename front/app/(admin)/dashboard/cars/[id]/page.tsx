"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminCarDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [car, setCar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiClient
      .get(`/admin/cars/${id}`)
      .then((res: any) => {
        const d = res?.data ?? res;
        setCar(d);
      })
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const approve = () =>
    apiClient.post(`/admin/cars/${id}/approve`).then(load);
  const reject = () =>
    apiClient.post(`/admin/cars/${id}/reject`).then(load);

  if (loading) return <div className="text-slate-500">Загрузка...</div>;
  if (!car) return <div className="text-red-500">Объявление не найдено</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{car.name}</h2>
          <p className="text-sm text-slate-500">
            ID: {car.id} · Просмотров: {car.views}
          </p>
          <p className="text-sm text-slate-500">
            Создано: {car.create_date ? new Date(car.create_date).toLocaleString("ru-RU") : "—"}
          </p>
          <p className="text-sm text-slate-500">
            Обновлено: {car.update_date ? new Date(car.update_date).toLocaleString("ru-RU") : "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={approve}
          >
            Одобрить
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            variant="destructive"
            onClick={reject}
          >
            Отклонить
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Ссылки</h3>
        <div className="flex flex-col gap-2 text-sm">
          <Link
            href={`/cars/${car.id}`}
            target="_blank"
            className="text-primary hover:underline"
          >
            Открыть публичную страницу объявления
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Фотографии</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {car.images?.map((img: any) => (
            <div
              key={img.id}
              className="aspect-video rounded-xl overflow-hidden bg-slate-100"
            >
              <img
                src={img.url}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {(!car.images || car.images.length === 0) && (
            <p className="text-sm text-slate-500">Фотографии отсутствуют</p>
          )}
        </div>
      </div>
    </div>
  );
}

