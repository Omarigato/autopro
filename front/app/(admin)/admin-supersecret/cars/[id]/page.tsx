"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

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
          {car.status !== "ACTIVE" && car.status !== "PUBLISHED" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={approve}
            >
              <CheckCircle className="h-4 w-4" />
              Одобрить
            </Button>
          )}
          {car.status !== "REJECT" && car.status !== "REJECTED" && (
            <Button
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              variant="destructive"
              onClick={reject}
            >
              <XCircle className="h-4 w-4" />
              Отклонить
            </Button>
          )}
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

