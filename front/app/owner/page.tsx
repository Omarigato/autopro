"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

type UserMe = {
  id: number;
  name: string;
  phone_number: string;
  role: "owner" | "admin";
};

type Car = {
  id: number;
  name: string;
};

type Plan = {
  id: number;
  code: string;
  name: string;
  price_kzt: number;
  period_days: number;
  free_days: number;
  max_cars: number | null;
};

export default function OwnerDashboardPage() {
  const [me, setMe] = useState<UserMe | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, carsRes, plansRes] = await Promise.all([
          apiClient.get<UserMe>("/auth/me"),
          apiClient.get<Car[]>("/cars"),
          apiClient.get<Plan[]>("/subscriptions/plans")
        ]);
        setMe(meRes.data);
        setCars(carsRes.data);
        setPlans(plansRes.data);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-sm text-muted">Загрузка кабинета владельца...</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="container-page">
        <p className="text-sm text-muted mb-3">
          Не удалось получить данные пользователя. Пожалуйста, войдите заново.
        </p>
        <Link href="/login" className="text-primary text-sm">
          Перейти на страницу входа
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Кабинет владельца</h1>
          <p className="text-sm text-muted">
            {me.name} · {me.phone_number}
          </p>
        </div>
        <div className="flex gap-2">
          {me.role === "admin" && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded-xl border text-xs font-medium hover:border-primary hover:text-primary"
            >
              Перейти в админ‑панель
            </Link>
          )}
          <Link
            href="/owner/new-car"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-accent"
          >
            Добавить объявление
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Мои автомобили</h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {cars.length === 0 && (
            <div className="p-4 text-sm text-muted">
              У вас пока нет активных объявлений. Добавьте первое объявление.
            </div>
          )}
          {cars.map((car) => (
            <div key={car.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{car.name}</p>
              </div>
              <Link
                href={`/cars/${car.id}`}
                className="text-primary text-xs hover:underline"
              >
                Открыть
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Подписки</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between"
            >
              <div>
                <p className="text-sm font-semibold">
                  {plan.name}{" "}
                  <span className="text-xs text-muted uppercase ml-1">{plan.code}</span>
                </p>
                <p className="text-xl font-bold mt-1">
                  {plan.price_kzt} тг
                  <span className="text-xs text-muted font-normal"> / мес</span>
                </p>
                <p className="text-xs text-muted mt-1">
                  Период: {plan.period_days} дн. · Бесплатно: {plan.free_days} дн.
                </p>
                <p className="text-xs text-muted">
                  Лимит авто: {plan.max_cars ?? "без ограничений"}
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-accent">
                Купить подписку
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

